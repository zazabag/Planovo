/**
 * Login to Reg.ru, extract FTP credentials, upload dist/planovo-pro/
 * Usage: REGRU_EMAIL=... REGRU_PASS=... node scripts/regru-deploy.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "basic-ftp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEPLOY_DIR = path.join(__dirname, "..", "dist", "planovo-pro");

const EMAIL = process.env.REGRU_EMAIL;
const PASS = process.env.REGRU_PASS;

if (!EMAIL || !PASS) {
  console.error("Set REGRU_EMAIL and REGRU_PASS");
  process.exit(1);
}

async function loginRegRu(page) {
  await page.goto("https://www.reg.ru/user/account/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".qa-auth-form-field-login", { timeout: 30000 });

  await page.locator(".qa-auth-form-field-login").fill(EMAIL);
  await page.locator(".qa-auth-form-field-pass").fill(PASS);
  await page.locator(".qa-auth-form-login-btn").click();

  await page.waitForFunction(
    () => !document.querySelector(".qa-auth-form-login-btn"),
    { timeout: 30000 }
  ).catch(() => {});

  await page.waitForTimeout(5000);

  if (await page.locator(".qa-auth-form-login-btn").isVisible().catch(() => false)) {
    await page.screenshot({ path: path.join(__dirname, "..", "dist", "regru-login-debug.png"), fullPage: true });
    throw new Error("Login failed — check email/password or captcha (dist/regru-login-debug.png)");
  }
  console.log("Logged in:", page.url());
}

function parseAccessText(text) {
  const host =
    text.match(/server\d+\.hosting\.reg\.ru/i)?.[0] ||
    text.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)?.[1] ||
    "server84.hosting.reg.ru";

  const user =
    text.match(/Доступ к FTP[\s\S]{0,120}?Логин:\s*\n?\s*(\S+)/i)?.[1] ||
    text.match(/\bu\d{5,10}\b/i)?.[0];

  const password =
    text.match(/Доступ к FTP[\s\S]{0,200}?Пароль:\s*\n?\s*(\S+)/i)?.[1];

  return { host, user, password };
}

async function extractFtpFromHosting(page, context) {
  await page.waitForTimeout(2000);

  const hostingNav = page.getByText("Хостинги", { exact: false }).first();
  if (await hostingNav.isVisible({ timeout: 10000 }).catch(() => false)) {
    await hostingNav.click();
    await page.waitForTimeout(4000);
  }

  const planovo = page.getByText("planovo.pro", { exact: false }).first();
  if (await planovo.isVisible({ timeout: 10000 }).catch(() => false)) {
    await planovo.click();
    await page.waitForTimeout(4000);
  }

  await page.screenshot({ path: path.join(__dirname, "..", "dist", "regru-service.png"), fullPage: true });

  // "Пароли и доступы" / "Доступы"
  for (const label of ["Пароли и доступы", "Пароли", "Доступы", "FTP"]) {
    const link = page.getByText(label, { exact: false }).first();
    if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await link.click();
      await page.waitForTimeout(4000);
      break;
    }
  }

  let text = await page.innerText("body").catch(() => "");
  fs.writeFileSync(path.join(__dirname, "..", "dist", "regru-passwords-page.txt"), text);

  let creds = parseAccessText(text);
  if (creds.user && creds.password) return creds;

  // ISPmanager auto-login
  const panelLink = page.locator('a:has-text("ISPmanager"), a:has-text("В панель"), a[href*="ispmanager"], a[href*="1500"]').first();
  if (await panelLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    const [popup] = await Promise.all([
      context.waitForEvent("page", { timeout: 20000 }),
      panelLink.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
    await popup.waitForTimeout(5000);
    text = await popup.innerText("body").catch(() => "");
    fs.writeFileSync(path.join(__dirname, "..", "dist", "regru-panel.txt"), text.slice(0, 8000));
    creds = parseAccessText(text);
    if (creds.user && creds.password) return creds;

    // File manager in ISPmanager
    const fm = popup.getByText("Менеджер файлов", { exact: false }).first();
    if (await fm.isVisible({ timeout: 8000 }).catch(() => false)) {
      await fm.click();
      await popup.waitForTimeout(3000);
      creds.panelPage = popup;
      return creds;
    }
  }

  return creds;
}

async function uploadViaFtp(creds, remoteDir) {
  const client = new Client(120000);
  client.ftp.verbose = true;
  console.log(`FTP connect ${creds.host} as ${creds.user} …`);
  await client.access({
    host: creds.host,
    user: creds.user,
    password: creds.password,
    secure: false,
  });

  const tryDirs = remoteDir ? [remoteDir] : ["www/planovo.pro", "www", "public_html", "/"];
  let cwd = null;
  for (const d of tryDirs) {
    try {
      await client.cd(d);
      cwd = d;
      console.log("CWD ok:", d);
      break;
    } catch {
      /* next */
    }
  }
  if (!cwd) {
    await client.cd("/");
    cwd = "/";
  }

  // Clear placeholder files
  const listing = await client.list();
  for (const item of listing) {
    if (item.name.startsWith(".")) continue;
    try {
      if (item.isDirectory) await client.removeDir(item.name);
      else await client.remove(item.name);
      console.log("Removed:", item.name);
    } catch (e) {
      console.warn("Remove skip:", item.name, e.message);
    }
  }

  console.log("Uploading from", DEPLOY_DIR, "…");
  await client.uploadFromDir(DEPLOY_DIR);
  console.log("Upload complete to", cwd);
  client.close();
}

async function main() {
  if (!fs.existsSync(DEPLOY_DIR)) {
    throw new Error("Run node scripts/build-deploy.mjs first");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "ru-RU" });
  const page = await context.newPage();

  try {
    await loginRegRu(page);
    const creds = await extractFtpFromHosting(page, context);
    console.log("FTP host:", creds.host);
    console.log("FTP user:", creds.user);
    console.log("FTP pass found:", !!creds.password);

    fs.writeFileSync(
      path.join(__dirname, "..", "dist", "regru-ftp-info.json"),
      JSON.stringify({ host: creds.host, user: creds.user, hasPass: !!creds.password }, null, 2)
    );

    if (!creds.user || !creds.password) {
      // Try hosting panel with same reg.ru credentials via ispmanager auto-login
      const panelBtn = page.locator('a[href*="ispmanager"], a:has-text("В панель")').first();
      if (await panelBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          context.waitForEvent("page", { timeout: 15000 }).catch(() => null),
          panelBtn.click(),
        ]);
        const p = popup || page;
        await p.waitForTimeout(5000);
        await p.screenshot({ path: path.join(__dirname, "..", "dist", "regru-panel.png"), fullPage: true });
      }
      throw new Error("Could not extract FTP password — check dist/regru-passwords-page.txt");
    }

    await uploadViaFtp(creds);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

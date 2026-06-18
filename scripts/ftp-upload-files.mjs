/** Upload specific files from dist/planovo-pro/ via FTP (Reg.ru creds file or FTP_* env). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "basic-ftp";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEPLOY_DIR = path.join(__dirname, "..", "dist", "planovo-pro");
const files = process.argv.slice(2);

async function getCredsFromRegRu() {
  const EMAIL = process.env.REGRU_EMAIL;
  const PASS = process.env.REGRU_PASS;
  if (!EMAIL || !PASS) return null;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.reg.ru/user/account/", { waitUntil: "domcontentloaded" });
  await page.locator(".qa-auth-form-field-login").fill(EMAIL);
  await page.locator(".qa-auth-form-field-pass").fill(PASS);
  await page.locator(".qa-auth-form-login-btn").click();
  await page.waitForFunction(() => !document.querySelector(".qa-auth-form-login-btn"), { timeout: 30000 });
  await page.getByText("Хостинги", { exact: false }).first().click();
  await page.waitForTimeout(3000);
  const planovo = page.getByText("planovo.pro", { exact: false }).first();
  if (await planovo.isVisible().catch(() => false)) {
    await planovo.click();
    await page.waitForTimeout(2000);
  }
  const access = page.getByText("Доступы", { exact: false }).first();
  if (await access.isVisible().catch(() => false)) {
    await access.click();
    await page.waitForTimeout(2000);
  }
  const text = await page.innerText("body");
  await browser.close();
  const user = text.match(/Доступ к FTP[\s\S]{0,120}?Логин:\s*\n?\s*(\S+)/i)?.[1];
  const password = text.match(/Доступ к FTP[\s\S]{0,200}?Пароль:\s*\n?\s*(\S+)/i)?.[1];
  if (!user || !password) throw new Error("FTP creds not found");
  return { host: "server84.hosting.reg.ru", user, password };
}

async function main() {
  if (!files.length) {
    console.error("Usage: node scripts/ftp-upload-files.mjs index.html assets/site-legal.js");
    process.exit(1);
  }
  const creds =
    process.env.FTP_USER && process.env.FTP_PASS
      ? { host: process.env.FTP_HOST || "server84.hosting.reg.ru", user: process.env.FTP_USER, password: process.env.FTP_PASS }
      : await getCredsFromRegRu();

  const client = new Client(60000);
  await client.access({ host: creds.host, user: creds.user, password: creds.password, secure: false });
  await client.cd("www/planovo.pro");
  for (const f of files) {
    const local = path.join(DEPLOY_DIR, f);
    if (!fs.existsSync(local)) throw new Error("Missing: " + local);
    await client.uploadFrom(local, f);
    console.log("uploaded", f);
  }
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/** Quick FTP upload — env FTP_* or dist/regru-passwords-page.txt */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "basic-ftp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEPLOY_DIR = path.join(__dirname, "..", "dist", "planovo-pro");
const CREDS_FILE = path.join(__dirname, "..", "dist", "regru-passwords-page.txt");

function parseCreds(text) {
  const host = text.match(/server\d+\.hosting\.reg\.ru/i)?.[0] || "server84.hosting.reg.ru";
  const user =
    text.match(/Доступ к FTP[\s\S]{0,120}?Логин:\s*\n?\s*(\S+)/i)?.[1];
  const password =
    text.match(/Доступ к FTP[\s\S]{0,200}?Пароль:\s*\n?\s*(\S+)/i)?.[1];
  if (!user || !password) throw new Error("FTP creds not found in " + CREDS_FILE);
  return { host, user, password };
}

function getCreds() {
  if (process.env.FTP_HOST && process.env.FTP_USER && process.env.FTP_PASS) {
    return {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
    };
  }
  const text = fs.readFileSync(CREDS_FILE, "utf8");
  return parseCreds(text);
}

async function main() {
  const creds = getCreds();
  const client = new Client(180000);
  client.ftp.verbose = true;

  console.log("Connecting", creds.host, "as", creds.user);
  await client.access({ host: creds.host, user: creds.user, password: creds.password, secure: false });

  for (const d of ["www/planovo.pro", "www", "public_html", "/"]) {
    try {
      await client.cd(d);
      console.log("Remote dir:", d);
      break;
    } catch {
      /* try next */
    }
  }

  console.log("Uploading", DEPLOY_DIR);
  console.log("Safety: existing remote files are not deleted by this legacy FTP helper.");
  await client.uploadFromDir(DEPLOY_DIR);
  client.close();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

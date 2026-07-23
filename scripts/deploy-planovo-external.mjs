/**
 * Safe Planovo public-edge deployment.
 *
 * By default this script only runs diagnostics and builds the local package.
 * Pass --apply to copy files to /opt/planovo-pro and reload nginx.
 */
import crypto from "crypto";
import fs from "fs";
import { execFileSync, spawnSync } from "child_process";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist", "planovo-pro");
const TEMPLATE = path.join(ROOT, "deploy", "planovo-external", "nginx.planovo-pro.conf");

const FORBIDDEN_REMOTE_PATTERNS = [
  "/opt/schedulekems",
  "/deploy/planovo-site",
  "/planovo-site",
  "/var/www",
  "/",
];

function parseArgs(argv) {
  const args = {
    host: process.env.PLANOVO_DEPLOY_HOST || "144.31.93.83",
    user: process.env.PLANOVO_DEPLOY_USER || "root",
    remoteRoot: process.env.PLANOVO_REMOTE_ROOT || "/opt/planovo-pro",
    apply: false,
    skipBuild: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--skip-build") args.skipBuild = true;
    else if (arg === "--host") args.host = argv[++i];
    else if (arg === "--user") args.user = argv[++i];
    else if (arg === "--remote-root") args.remoteRoot = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/deploy-planovo-external.mjs [--host 144.31.93.83] [--user root] [--remote-root /opt/planovo-pro]
  node scripts/deploy-planovo-external.mjs --apply

Environment:
  PLANOVO_DEPLOY_HOST   SSH host, default 144.31.93.83
  PLANOVO_DEPLOY_USER   SSH user, default root
  PLANOVO_REMOTE_ROOT   Remote root, default /opt/planovo-pro

Safety:
  Without --apply the script performs local build and remote read-only diagnostics.
  With --apply it writes only under PLANOVO_REMOTE_ROOT, installs one nginx site,
  and reloads nginx after nginx -t passes.`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}${stderr}`);
  }
  return result.stdout?.trim() || "";
}

function assertSafeRemoteRoot(remoteRoot) {
  if (!remoteRoot.startsWith("/opt/planovo-pro/") && remoteRoot !== "/opt/planovo-pro") {
    throw new Error(`Refusing remote root outside /opt/planovo-pro: ${remoteRoot}`);
  }
  for (const forbidden of FORBIDDEN_REMOTE_PATTERNS) {
    if (forbidden !== "/" && (remoteRoot === forbidden || remoteRoot.startsWith(`${forbidden}/`))) {
      throw new Error(`Refusing unsafe remote root: ${remoteRoot}`);
    }
  }
}

function sshTarget(args) {
  return `${args.user}@${args.host}`;
}

function ssh(args, remoteCommand, options = {}) {
  return run("ssh", [
    "-o",
    "BatchMode=yes",
    "-o",
    "ConnectTimeout=10",
    sshTarget(args),
    remoteCommand,
  ], options);
}

function scp(args, localPath, remotePath) {
  run("scp", [
    "-o",
    "BatchMode=yes",
    "-o",
    "ConnectTimeout=10",
    localPath,
    `${sshTarget(args)}:${remotePath}`,
  ]);
}

function gitSha() {
  return run("git", ["rev-parse", "--short=12", "HEAD"], { capture: true });
}

function gitFullSha() {
  return run("git", ["rev-parse", "HEAD"], { capture: true });
}

function buildPackage(skipBuild) {
  if (!skipBuild) {
    run("node", ["scripts/build-deploy.mjs"]);
  }
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    throw new Error(`Missing deploy package: ${DIST}. Run node scripts/build-deploy.mjs`);
  }
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function collectManifest(dir) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const filePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
      } else {
        const rel = path.relative(dir, filePath).split(path.sep).join("/");
        files.push({
          path: rel,
          size: fs.statSync(filePath).size,
          sha256: sha256(filePath),
        });
      }
    }
  }
  walk(dir);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return {
    project: "planovo-pro",
    gitSha: gitFullSha(),
    builtAt: new Date().toISOString(),
    fileCount: files.length,
    files,
  };
}

function renderNginxConfig(remoteRoot) {
  const siteRoot = `${remoteRoot}/current/site`;
  return fs.readFileSync(TEMPLATE, "utf8").replaceAll("__SITE_ROOT__", siteRoot);
}

function writeGeneratedFiles(args, sha) {
  const generatedDir = path.join(ROOT, "dist", "planovo-external");
  fs.mkdirSync(generatedDir, { recursive: true });

  const manifest = collectManifest(DIST);
  const manifestPath = path.join(generatedDir, `manifest-${sha}.json`);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const nginxPath = path.join(generatedDir, "planovo-pro.nginx.conf");
  fs.writeFileSync(nginxPath, renderNginxConfig(args.remoteRoot), "utf8");

  return { generatedDir, manifestPath, nginxPath };
}

function remoteDiagnostics(args) {
  const command = `
set -eu
echo "== identity =="
hostname
id
echo "== listeners =="
(ss -ltnp || true) 2>/dev/null
echo "== nginx =="
command -v nginx || true
(systemctl is-active nginx || true) 2>/dev/null
echo "== planovo certs =="
for f in /etc/letsencrypt/live/planovo.pro/fullchain.pem /etc/letsencrypt/live/planovo.pro/privkey.pem; do
  if [ -e "$f" ]; then echo "present $f"; else echo "missing $f"; fi
done
echo "== kems health =="
curl -fsS --max-time 5 http://127.0.0.1:18080/api/v1/public/health || true
echo
echo "== known planovo/kems directories =="
find /opt -maxdepth 3 -type d \\( -iname '*planovo*' -o -iname '*kems*' \\) 2>/dev/null | sort || true
`;
  return ssh(args, command, { capture: true });
}

function applyRemote(args, sha, files) {
  const releaseDir = `${args.remoteRoot}/releases/${sha}`;
  const siteDir = `${releaseDir}/site`;
  const sharedDir = `${args.remoteRoot}/shared`;
  const remoteManifest = `${sharedDir}/manifest-${sha}.json`;
  const remoteNginx = `${sharedDir}/planovo-pro.nginx.conf`;

  ssh(args, `
set -eu
test -e /etc/letsencrypt/live/planovo.pro/fullchain.pem
test -e /etc/letsencrypt/live/planovo.pro/privkey.pem
curl -fsS --max-time 5 http://127.0.0.1:18080/api/v1/public/health >/dev/null
mkdir -p '${siteDir}' '${sharedDir}' '${args.remoteRoot}/backups'
`);

  run("rsync", [
    "-az",
    "--delete",
    "--checksum",
    "--itemize-changes",
    "--exclude=.git/",
    `${DIST}/`,
    `${sshTarget(args)}:${siteDir}/`,
  ]);

  scp(args, files.manifestPath, remoteManifest);
  scp(args, files.nginxPath, remoteNginx);

  ssh(args, `
set -eu
if [ -e /etc/nginx/sites-available/planovo-pro.conf ]; then
  cp /etc/nginx/sites-available/planovo-pro.conf '${args.remoteRoot}/backups/planovo-pro.conf.$(date +%Y%m%d%H%M%S)'
fi
ln -sfn '${releaseDir}' '${args.remoteRoot}/current.next'
mv -Tf '${args.remoteRoot}/current.next' '${args.remoteRoot}/current'
install -m 0644 '${remoteNginx}' /etc/nginx/sites-available/planovo-pro.conf
ln -sfn /etc/nginx/sites-available/planovo-pro.conf /etc/nginx/sites-enabled/planovo-pro.conf
nginx -t
systemctl reload nginx
`);
}

function smokePublic() {
  run("node", ["scripts/smoke-planovo-external.mjs"]);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  assertSafeRemoteRoot(args.remoteRoot);

  const sha = gitSha();
  console.log(`Planovo external deploy: ${sha}`);
  console.log(`Remote: ${sshTarget(args)}:${args.remoteRoot}`);
  console.log(args.apply ? "Mode: apply" : "Mode: diagnostics only; pass --apply to deploy");

  buildPackage(args.skipBuild);
  const generated = writeGeneratedFiles(args, sha);

  try {
    const diagnostics = remoteDiagnostics(args);
    console.log(diagnostics);
  } catch (error) {
    console.error("Remote diagnostics failed.");
    console.error(error.message);
    if (args.apply) process.exit(1);
    return;
  }

  if (!args.apply) {
    console.log("Dry run complete. Generated:");
    console.log(`  ${generated.manifestPath}`);
    console.log(`  ${generated.nginxPath}`);
    return;
  }

  applyRemote(args, sha, generated);
  smokePublic();
  console.log(`Published Planovo external contour at ${gitFullSha()}`);
}

main();

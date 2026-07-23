/**
 * Public smoke checks for the Planovo external contour.
 */
import http from "http";
import https from "https";

const checks = [
  { url: "https://planovo.pro/", expect: [200] },
  { url: "https://www.planovo.pro/", expect: [200] },
  { url: "https://planovo.pro/kems/student/", expect: [200, 301, 302] },
  { url: "https://planovo.pro/kems/teacher/", expect: [200, 301, 302] },
  { url: "https://planovo.pro/kems/admin/", expect: [200, 301, 302] },
  { url: "https://planovo.pro/api/v1/public/health", expect: [200] },
  { url: "http://planovo.pro/", expect: [301, 308], locationPrefix: "https://planovo.pro/" },
];

function requestUrl(target) {
  const url = new URL(target);
  const client = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: "GET",
        timeout: 10000,
        headers: { "User-Agent": "PlanovoSmoke/1.0" },
      },
      (res) => {
        res.resume();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error(`Timeout: ${target}`)));
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const failures = [];
  for (const check of checks) {
    try {
      const result = await requestUrl(check.url);
      const okStatus = check.expect.includes(result.statusCode);
      const location = result.headers.location || "";
      const okLocation = !check.locationPrefix || location.startsWith(check.locationPrefix);
      const ok = okStatus && okLocation;
      console.log(`${ok ? "ok" : "fail"} ${check.url} -> ${result.statusCode}${location ? ` ${location}` : ""}`);
      if (!ok) failures.push(check.url);
    } catch (error) {
      console.log(`fail ${check.url} -> ${error.message}`);
      failures.push(check.url);
    }
  }

  if (failures.length) {
    throw new Error(`Smoke failed: ${failures.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

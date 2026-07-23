/**
 * Public smoke checks for the Planovo external contour.
 */
import http from "http";
import https from "https";

const checks = [
  {
    url: "https://planovo.pro/",
    expect: [200],
    includes: ["Планово держит", "Для колледжей, школ и вузов"],
    excludes: ["404: This page could not be found."],
  },
  {
    url: "https://www.planovo.pro/",
    expect: [200],
    includes: ["Планово держит", "Для колледжей, школ и вузов"],
    excludes: ["404: This page could not be found."],
  },
  {
    url: "https://planovo.pro/kems/student/",
    expect: [200],
    includes: ["<title>КЭМС ученик", "apple-mobile-web-app-title\" content=\"КЭМС ученик"],
    excludes: ["404: This page could not be found.", "Планово держит"],
  },
  {
    url: "https://planovo.pro/kems/teacher/",
    expect: [200],
    includes: ["<title>КЭМС преподаватель", "apple-mobile-web-app-title\" content=\"КЭМС преподаватель"],
    excludes: ["404: This page could not be found.", "Планово держит"],
  },
  {
    url: "https://planovo.pro/kems/admin/",
    expect: [200],
    includes: ["<title>КЭМС учебная часть", "apple-mobile-web-app-title\" content=\"КЭМС учебная часть"],
    excludes: ["404: This page could not be found.", "Планово держит"],
  },
  {
    url: "https://planovo.pro/api/v1/public/health",
    expect: [200],
    json: { status: "ok", service: "schedulekems-api" },
    contentType: "application/json",
    excludes: ["404: This page could not be found.", "<!DOCTYPE html>"],
  },
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
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
          if (body.length > 2_000_000) {
            req.destroy(new Error(`Response too large: ${target}`));
          }
        });
        res.on("end", () => {
          resolve({
            body,
            statusCode: res.statusCode,
            headers: res.headers,
          });
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error(`Timeout: ${target}`)));
    req.on("error", reject);
    req.end();
  });
}

function validateBody(check, result) {
  const body = result.body || "";
  const contentType = String(result.headers["content-type"] || "").toLowerCase();

  if (check.contentType && !contentType.includes(check.contentType)) {
    return `content-type ${contentType || "(missing)"} does not include ${check.contentType}`;
  }

  for (const expected of check.includes || []) {
    if (!body.includes(expected)) return `missing body marker: ${expected}`;
  }

  for (const forbidden of check.excludes || []) {
    if (body.includes(forbidden)) return `forbidden body marker present: ${forbidden}`;
  }

  if (check.json) {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return "body is not valid JSON";
    }
    for (const [key, expected] of Object.entries(check.json)) {
      if (parsed[key] !== expected) {
        return `json.${key} expected ${expected}, got ${parsed[key]}`;
      }
    }
  }

  return null;
}

async function main() {
  const failures = [];
  for (const check of checks) {
    try {
      const result = await requestUrl(check.url);
      const okStatus = check.expect.includes(result.statusCode);
      const location = result.headers.location || "";
      const okLocation = !check.locationPrefix || location.startsWith(check.locationPrefix);
      const bodyError = okStatus ? validateBody(check, result) : null;
      const ok = okStatus && okLocation && !bodyError;
      console.log(
        `${ok ? "ok" : "fail"} ${check.url} -> ${result.statusCode}${location ? ` ${location}` : ""}${
          bodyError ? ` (${bodyError})` : ""
        }`,
      );
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

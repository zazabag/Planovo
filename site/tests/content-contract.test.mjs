import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { collectSource } from "./helpers/render-worker.mjs";

test("keeps product claims inside the verified scope", async () => {
  const [appSource, componentSource, libSource, packageJson] = await Promise.all([
    collectSource(new URL("../app/", import.meta.url)),
    collectSource(new URL("../components/", import.meta.url)),
    collectSource(new URL("../lib/", import.meta.url)),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  const source = `${appSource}\n${componentSource}\n${libSource}\n${packageJson}`;

  assert.doesNotMatch(source, /\b46%\b|\b30%\b|\b24%\b/);
  assert.doesNotMatch(source, /planovo\.app/i);
  assert.doesNotMatch(
    source,
    /\b(?:window\.)?(?:localStorage|sessionStorage)\s*\./,
  );
  assert.doesNotMatch(source, /fake success|Заявка отправлена/i);
  assert.doesNotMatch(
    source,
    /полностью соответствует 152-ФЗ|готовая замена (?:1С|Moodle)|МЭШ для частников/i,
  );
  assert.doesNotMatch(
    source,
    /автоматически (?:генерирует|составляет) расписание(?!\?)/i,
  );

  assert.match(source, /Реализовано сейчас/);
  assert.match(source, /Готовится к запуску/);
  assert.match(source, /Следующий этап/);
  assert.match(source, /Roadmap/i);
  assert.match(source, /Пока нет/);
});

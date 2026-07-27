import { readFile, readdir } from "node:fs/promises";

export async function render(pathname = "/") {
  const workerUrl = new URL("../../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${process.pid}-${Date.now()}-${Math.random()}-${pathname}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html,*/*" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

export async function renderHtml(pathname = "/") {
  const response = await render(pathname);
  const html = await response.text();
  return { response, html };
}

export async function collectSource(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const chunks = [];

  for (const entry of entries) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      chunks.push(await collectSource(url));
    } else if (/\.(?:ts|tsx|css|json)$/.test(entry.name)) {
      chunks.push(await readFile(url, "utf8"));
    }
  }

  return chunks.join("\n");
}

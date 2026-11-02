#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, relative, isAbsolute, extname } from "node:path";

const args = process.argv.slice(2);
if (args.includes("--help") || args.length > 2) {
  console.log(
    "Usage: node scripts/serve.mjs ROOT [PORT]\nServe a local breadboard and its sources on loopback. PORT defaults to 0.",
  );
  process.exit(args.includes("--help") ? 0 : 1);
}
const root = await realpath(resolve(args[0] ?? "."));
const port = Number(args[1] ?? 0);
if (!Number.isInteger(port) || port < 0 || port > 65535)
  throw new Error("PORT must be an integer between 0 and 65535");
if (!(await stat(root)).isDirectory())
  throw new Error("ROOT must be a directory");

const server = createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let file = await realpath(resolve(root, `.${pathname}`));
    if ((await stat(file)).isDirectory())
      file = await realpath(resolve(file, "index.html"));
    const part = relative(root, file);
    if (
      part === ".." ||
      part.startsWith("../") ||
      part.startsWith("..\\") ||
      isAbsolute(part)
    ) {
      response.writeHead(403).end();
      return;
    }
    const mime =
      {
        ".html": "text/html",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
      }[extname(file)] ?? "text/plain";
    const bytes = await readFile(file);
    response.writeHead(200, {
      "Content-Type": `${mime}; charset=utf-8`,
      "Content-Length": bytes.length,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : bytes);
  } catch {
    response.writeHead(404).end();
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    JSON.stringify({
      root,
      url: `http://127.0.0.1:${server.address().port}/`,
      stop: "Ctrl-C",
    }),
  ),
);

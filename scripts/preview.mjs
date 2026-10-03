#!/usr/bin/env node
/**
 * Preview dev server for @devstroop/htmx-uikit.
 *
 * Serves preview/ as the web root and mounts the live library build so the
 * demo always reflects the current dist/ (npm run build) with no copies:
 *   /dist/*  → ../dist/*   (uikit.css, uikit.js — the esbuild output)
 *   /lib/*   → ../lib/*    (tokens.css and sources, if linked directly)
 *
 * Static preview only — no bundling, no dependencies. Port 5198 mirrors
 * react-uikit's preview on 5199.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW = join(ROOT, "preview");
const PORT = Number(process.env.PORT) || 5198;

const MOUNTS = new Map([
  ["/dist/", join(ROOT, "dist")],
  ["/lib/", join(ROOT, "lib")],
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

/** Map a request path to a file inside base, refusing traversal escapes. */
function safeJoin(base, urlPath) {
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const file = resolve(base, rel);
  if (file !== base && !file.startsWith(base + sep)) return null;
  return file;
}

async function existingFile(file) {
  try {
    const s = await stat(file);
    if (s.isDirectory()) return existingFile(join(file, "index.html"));
    return s.isFile() ? file : null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  let base = PREVIEW;
  let path = urlPath;
  for (const [prefix, mountBase] of MOUNTS) {
    if (urlPath.startsWith(prefix)) {
      base = mountBase;
      path = urlPath.slice(prefix.length - 1); // keep leading "/"
      break;
    }
  }
  const file = (await existingFile(safeJoin(base, path) ?? "")) || null;
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end(`404 ${urlPath}`);
    return;
  }
  const body = await readFile(file);
  res.writeHead(200, {
    "content-type": MIME[extname(file)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`htmx-uikit preview → http://localhost:${PORT}/`);
  console.log(`  root    preview/ (${PREVIEW})`);
  console.log(`  /dist   → ${join(ROOT, "dist")}`);
  console.log(`  /lib    → ${join(ROOT, "lib")}`);
});

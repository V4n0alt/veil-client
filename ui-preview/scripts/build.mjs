import { build, context } from "esbuild";
import { cp, mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, extname, sep } from "node:path";
const options = {
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outdir: "dist",
  entryNames: "app",
  format: "iife",
  target: "es2022",
  minify: true,
  sourcemap: false,
  external: ["./veil-sunset.png", "./inter-latin.woff2"],
  define: { "process.env.NODE_ENV": '"production"' },
};
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await cp("index.html", "dist/index.html");
if (!process.argv.includes("--serve")) {
  await build(options);
  console.log("Built dist/index.html — opens directly in a browser.");
} else {
  const ctx = await context(options);
  await ctx.watch();
  await ctx.rebuild();
  const root = resolve("dist");
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!file.startsWith(root + sep)) {
        res.writeHead(403).end();
        return;
      }
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    } catch {
      res.writeHead(404).end("Not found");
    }
  }).listen(4173, "127.0.0.1", () =>
    console.log("Veil preview: http://127.0.0.1:4173"),
  );
}

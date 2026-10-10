import { build, context } from "esbuild";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, extname, sep } from "node:path";
const textures = {};
let textureFiles = [];
try {
  textureFiles = await readdir("public/minecraft");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
for (const name of textureFiles.filter((name) => /^[a-z_]+\.png$/.test(name))) {
  textures[name.slice(0, -4)] =
    `data:image/png;base64,${(await readFile(`public/minecraft/${name}`)).toString("base64")}`;
}
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
  define: {
    "process.env.NODE_ENV": '"production"',
    __VEIL_TEXTURES__: JSON.stringify(textures),
  },
};
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await cp("index.html", "dist/index.html");
if (!process.argv.includes("--serve")) {
  await build(options);
  let css = await readFile("dist/app.css", "utf8");
  for (const [name, type] of [
    ["veil-sunset.png", "image/png"],
    ["inter-latin.woff2", "font/woff2"],
  ]) {
    const data = (await readFile(`public/${name}`)).toString("base64");
    if (type === "image/png") {
      css = css.replaceAll(`url(./${name})`, "var(--veil-embedded-scene)");
      css += `:root{--veil-embedded-scene:url(data:${type};base64,${data})}`;
    } else css = css.replaceAll(`./${name}`, `data:${type};base64,${data}`);
  }
  const icon = (await readFile("public/mark.svg")).toString("base64");
  const script = (await readFile("dist/app.js", "utf8")).replace(
    /<\/script/gi,
    "<\\/script",
  );
  let html = await readFile("index.html", "utf8");
  html = html
    .replace("./mark.svg", `data:image/svg+xml;base64,${icon}`)
    .replace(
      '<link rel="stylesheet" href="./app.css" />',
      () => `<style>${css}</style>`,
    )
    .replace(
      '<script src="./app.js" defer></script>',
      () => `<script>${script}</script>`,
    );
  const notices = await readFile("public/THIRD-PARTY-NOTICES.txt", "utf8");
  const veilLicense = await readFile("public/VEIL-LICENSE.txt", "utf8");
  let textureNotice = "";
  if (textureFiles.length)
    textureNotice = await readFile("public/minecraft/SOURCE.txt", "utf8");
  html = html.replace(
    "</body>",
    () =>
      `<template id="asset-notices">${[notices, veilLicense, textureNotice].join("\n").replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</template></body>`,
  );
  await writeFile("dist/Veil-Preview.html", html);
  console.log(
    "Built dist/Veil-Preview.html — all artwork, code and fonts embedded.",
  );
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

import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const assetsDir = "site-assets";
const redirects = ["_redirects", ".nojekyll"];
const pages = ["index.html", "provider/index.html", "agent/index.html", "vps/index.html"];
const legacyData = [
  { json: "items.json", script: "data.js", global: "ITEMS", valid: Array.isArray },
  { json: "vps.json", script: "vps-data.js", global: "VPS", valid: (value) => value && typeof value === "object" && !Array.isArray(value) },
];

async function readFeed(directory, { json, valid }) {
  const value = JSON.parse(await readFile(join(directory, json), "utf8"));
  if (!valid(value)) throw new Error("Unexpected JSON shape in " + json);
  return value;
}

async function packageSite() {
  const feeds = await Promise.all(legacyData.map(async (feed) => {
    const value = await readFeed(dist, feed);
    return { script: feed.script, body: "const " + feed.global + " = " + JSON.stringify(value) + ";\n" };
  }));
  await Promise.all([
    ...feeds.map(({ script, body }) => writeFile(join(dist, script), body)),
    ...redirects.map((file) => copyFile(join(root, file), join(dist, file))),
  ]);
}

async function mirrorFile(relativePath) {
  const destination = join(root, relativePath);
  const temp = destination + "." + randomUUID() + ".tmp";
  await mkdir(dirname(destination), { recursive: true });
  try {
    await copyFile(join(dist, relativePath), temp);
    await rename(temp, destination);
  } finally {
    await rm(temp, { force: true });
  }
}

async function mirrorToRoot() {
  const assets = await readdir(join(dist, assetsDir), { withFileTypes: true });
  const names = assets.filter((asset) => asset.isFile()).map((asset) => asset.name);
  if (!names.length) throw new Error("Vite generated no site assets");
  await Promise.all(names.map((name) => mirrorFile(join(assetsDir, name))));
  await Promise.all(legacyData.map(({ script }) => mirrorFile(script)));
  await Promise.all(pages.map(mirrorFile));

  const previous = await readdir(join(root, assetsDir), { withFileTypes: true });
  const current = new Set(names);
  for (const asset of previous) {
    if (asset.isFile() && /^[\w-]+-[\w-]{8,}\.(?:js|css)$/.test(asset.name) && !current.has(asset.name)) {
      await rm(join(root, assetsDir, asset.name), { force: true });
    }
  }
}

if (process.argv[2] === "--mirror") await mirrorToRoot();
else if (process.argv[2] === "--check") await Promise.all(legacyData.map((feed) => readFeed(root, feed)));
else await packageSite();

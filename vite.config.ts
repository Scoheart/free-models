import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const project = fileURLToPath(new URL("./", import.meta.url));
const web = fileURLToPath(new URL("./web/", import.meta.url));
const dataFiles = new Set(["items.json", "vps.json"]);

export default defineConfig({
  root: web,
  base: "./",
  plugins: [react()],
  server: { fs: { allow: [project] } },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rolldownOptions: {
      input: ["index.html", "provider/index.html", "agent/index.html", "vps/index.html"]
        .map((path) => resolve(web, path)),
      output: {
        // Preserve the public feed URLs across builds and both hosting targets.
        assetFileNames(asset) {
          return asset.names.find((name) => dataFiles.has(name)) ?? "site-assets/[name]-[hash][extname]";
        },
        entryFileNames: "site-assets/[name]-[hash].js",
        chunkFileNames: "site-assets/[name]-[hash].js",
      },
    },
  },
});

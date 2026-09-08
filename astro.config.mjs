// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { SITE, BASE_PATH } from "./src/config.ts";

// GitHub Pages *project* site: served from https://<user>.github.io/the-funk-yes/
// To move to a user site or custom domain later:
//   1. set SITE.origin to the new origin in src/config.ts
//   2. set BASE_PATH to "/" in src/config.ts
//   3. (custom domain) add `public/CNAME` with the bare domain
export default defineConfig({
  site: SITE.origin,
  base: BASE_PATH,
  trailingSlash: "ignore",
  build: { format: "directory" },
  vite: {
    // Cast to any: @tailwindcss/vite resolves its own copy of Vite whose Plugin
    // type differs nominally from Astro's pinned Vite. Compatible at runtime.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});

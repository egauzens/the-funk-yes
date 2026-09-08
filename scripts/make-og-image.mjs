/**
 * Regenerates public/og-image.png (1200x630) from an inline SVG.
 * Run: node scripts/make-og-image.mjs
 * Swap the markup / colors when the real brand art lands.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/og-image.png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#0b0b0c"/>
  <rect x="0" y="0" width="1200" height="12" fill="#d8ff3e"/>
  <rect x="0" y="618" width="1200" height="12" fill="#ff2e88"/>
  <text x="80" y="300" font-family="Arial Narrow, Arial, sans-serif" font-weight="700"
        font-size="150" fill="#f2ede1" letter-spacing="2">THE FUNK YES!</text>
  <text x="82" y="410" font-family="Arial Narrow, Arial, sans-serif" font-weight="700"
        font-size="86" fill="#7c7768" letter-spacing="2">// THE FUCK YES!</text>
  <text x="84" y="500" font-family="Arial, sans-serif" font-size="34" fill="#a7a297">
    Elevate everything + everyone, everywhere.</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log("wrote", out);

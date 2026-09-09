/**
 * Upload the placeholder images used by src/lib/fixtures/index.ts as Contentful
 * assets and link them to the seeded entries, so the Contentful-backed site
 * matches the fixtures look (band group photo, The Fuck Yes! photo, 4 member
 * photos). Contentful downloads each image from its public URL, processes it,
 * publishes the asset, then this links + republishes the entry.
 *
 *   CONTENTFUL_SPACE_ID=xxxxxxxx \
 *   CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxxxxxxx \
 *   node contentful/seed-assets.mjs
 *
 * Re-run behaviour: an entry that already has the image field set is skipped,
 * UNLESS its field name / member name is listed in FORCE (comma-separated),
 * in which case the file on the existing asset is replaced in place (the asset
 * id and entry link are kept). Example — re-do just the two scene photos:
 *
 *   FORCE=bandGroupPhoto,fuckYesPhoto node contentful/seed-assets.mjs
 *
 * Replace these with real band photos in the web app when you have them.
 */

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";

if (!SPACE || !TOKEN) {
  console.error("Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN (a CFPAT- token).");
  process.exit(1);
}

const API = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FORCE = new Set(
  (process.env.FORCE || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

async function cma(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

let L = "en-US";

const U = "https://images.unsplash.com";
// Scene photos: NO forced height — keep the source's native ~3:2 so the CSS
// containers (3/4 on the Story block, 21/9 on the Fuck Yes hero) crop it the
// same way the fixtures did. Member photos: force 4:5 to match .fy-member__photo
// so every portrait is the same shape.
const scene = "fit=crop&w=1600&q=75&fm=jpg";
const portrait = "fit=crop&w=1200&h=1500&q=80&fm=jpg";

/** Each target: which entry, which field, and the source image + alt text. */
const TARGETS = [
  {
    key: "bandGroupPhoto",
    entry: "siteContent",
    field: "bandGroupPhoto",
    fileName: "band-group.jpg",
    title: "The Funk Yes! — group photo (placeholder)",
    alt: "The Funk Yes! playing a packed room",
    src: `${U}/photo-1511671782779-c97d3d27a1d4?${scene}`,
  },
  {
    key: "fuckYesPhoto",
    entry: "siteContent",
    field: "fuckYesPhoto",
    fileName: "fuck-yes.jpg",
    title: "The Fuck Yes! — after-dark photo (placeholder)",
    alt: "Dark, smoke-lit stage with a band silhouetted against red light",
    src: `${U}/photo-1470229722913-7c0e2dbbafd3?${scene}`,
  },
  {
    key: "Cass Malone",
    entry: "bandMember",
    match: "Cass Malone",
    field: "photo",
    fileName: "cass-malone.jpg",
    title: "Cass Malone (placeholder)",
    alt: "Acoustic guitarist playing live",
    src: `${U}/photo-1493225457124-a3eb161ffa5f?${portrait}`,
  },
  {
    key: "Reggie Cole",
    entry: "bandMember",
    match: "Reggie Cole",
    field: "photo",
    fileName: "reggie-cole.jpg",
    title: "Reggie Cole (placeholder)",
    alt: "Bassist in low light",
    src: `${U}/photo-1510915361894-db8b60106cb1?${portrait}`,
  },
  {
    key: "Nina Park",
    entry: "bandMember",
    match: "Nina Park",
    field: "photo",
    fileName: "nina-park.jpg",
    title: "Nina Park (placeholder)",
    alt: "Electric guitarist on a dim stage",
    src: `${U}/photo-1459749411175-04bf5292ceea?${portrait}`,
  },
  {
    key: "Marcus Adeyemi",
    entry: "bandMember",
    match: "Marcus Adeyemi",
    field: "photo",
    fileName: "marcus-adeyemi.jpg",
    title: "Marcus Adeyemi (placeholder)",
    alt: "Hands playing a cajon",
    src: `${U}/photo-1508973379184-7517410fb0bc?${portrait}`,
  },
];

async function findEntry(t) {
  const q =
    t.entry === "bandMember"
      ? `/entries?content_type=bandMember&fields.name=${encodeURIComponent(t.match)}&limit=1`
      : `/entries?content_type=siteContent&limit=1`;
  const res = await cma(q);
  return res.items[0];
}

/** process the pending file on an asset, wait for it, then publish. */
async function processAndPublish(id, version) {
  await cma(`/assets/${id}/files/${L}/process`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(version) },
  });
  let asset;
  for (let i = 0; i < 25; i++) {
    await sleep(1500);
    asset = await cma(`/assets/${id}`);
    if (asset.fields?.file?.[L]?.url) break;
  }
  if (!asset.fields?.file?.[L]?.url) throw new Error(`asset ${id} did not finish processing`);
  await cma(`/assets/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(asset.sys.version) },
  });
}

async function createAsset(t) {
  const created = await cma("/assets", {
    method: "POST",
    body: {
      fields: {
        title: { [L]: t.title },
        description: { [L]: t.alt },
        file: { [L]: { contentType: "image/jpeg", fileName: t.fileName, upload: t.src } },
      },
    },
  });
  await processAndPublish(created.sys.id, created.sys.version);
  return created.sys.id;
}

/** Swap the file on an existing asset — keeps its id, so entry links survive. */
async function replaceAssetFile(assetId, t) {
  const cur = await cma(`/assets/${assetId}`);
  cur.fields.title = { [L]: t.title };
  cur.fields.description = { [L]: t.alt };
  cur.fields.file = { [L]: { contentType: "image/jpeg", fileName: t.fileName, upload: t.src } };
  const updated = await cma(`/assets/${assetId}`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(cur.sys.version) },
    body: { fields: cur.fields },
  });
  await processAndPublish(assetId, updated.sys.version);
}

async function linkIntoEntry(entryId, field, assetId) {
  const fresh = await cma(`/entries/${entryId}`);
  fresh.fields[field] = { [L]: { sys: { type: "Link", linkType: "Asset", id: assetId } } };
  const updated = await cma(`/entries/${entryId}`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(fresh.sys.version) },
    body: { fields: fresh.fields },
  });
  await cma(`/entries/${entryId}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(updated.sys.version) },
  });
}

async function main() {
  const locales = await cma("/locales");
  L = (locales.items.find((l) => l.default) || locales.items[0]).code;
  const forcing = FORCE.size ? ` · FORCE={${[...FORCE].join(", ")}}` : "";
  console.log(`Space ${SPACE} · env ${ENV} · locale ${L}${forcing}\n`);

  for (const t of TARGETS) {
    const label = t.match || `siteContent.${t.field}`;
    try {
      const entry = await findEntry(t);
      if (!entry) {
        console.error(`  ✗ ${label} — entry not found (run seed.mjs first?)`);
        process.exitCode = 1;
        continue;
      }
      const existingId = entry.fields?.[t.field]?.[L]?.sys?.id;

      if (existingId && FORCE.has(t.key)) {
        await replaceAssetFile(existingId, t);
        console.log(`  ✓ ${label} — replaced file on asset ${existingId} + re-published`);
      } else if (existingId) {
        console.log(`  · ${label} — already has ${t.field}, skipped (FORCE=${t.key} to redo)`);
      } else {
        const assetId = await createAsset(t);
        await linkIntoEntry(entry.sys.id, t.field, assetId);
        console.log(`  ✓ ${label} — asset ${assetId} linked to ${t.field} + published`);
      }
    } catch (err) {
      console.error(`  ✗ ${label}\n${err.message}\n`);
      process.exitCode = 1;
    }
  }

  console.log("\nDone. Trigger a rebuild (or let the webhook do it) to see the changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

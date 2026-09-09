# The Funk Yes! — website

Static [Astro](https://astro.build) site, hosted free on **GitHub Pages**.

- **Media** (audio, video, galleries) lives on SoundCloud, Bandcamp, YouTube,
  Google Drive and Instagram and is embedded — nothing is uploaded here.
- **Changing content** (shows, recordings, bios, FUNQs, hero copy) comes from
  **Contentful** and is baked in at build time. A Contentful webhook re-triggers
  the deploy so edits go live without a code change.
- Builds from **local fixtures** (`src/lib/fixtures/`) until Contentful is wired
  up, so you can run and deploy it today.

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:4321/the-funk-yes/
```

`npm run build` → static output in `dist/` (runs Astro, then Pagefind to build
the search index). `npm run preview` serves the built site at the real base path.

Requires Node 20+ (`.nvmrc`).

---

## Project layout

| Path | What |
|---|---|
| `src/config.ts` | Site title, **base path**, social links, nav, integration ids. The stuff that rarely changes. |
| `src/lib/contentful.ts` | Build-time content fetch + fixture fallback. |
| `src/lib/fixtures/` | Stand-in content used when Contentful env vars are absent. |
| `src/components/embeds/` | One component per media source (SoundCloud, Bandcamp, YouTube, Google Drive, Instagram). |
| `src/pages/` | One file per route. `index.astro` is the 7-section main flow. |
| `contentful/` | Content-model migration script + hand-setup guide. |
| `.github/workflows/deploy.yml` | Build + deploy to Pages. |
| `scripts/make-og-image.mjs` | Regenerates `public/og-image.png`. |

---

## Deploy to GitHub Pages

1. Push this repo to GitHub as **`the-funk-yes`**.
2. Repo → Settings → **Pages** → *Source: GitHub Actions*.
3. Push to `main` (or run the workflow manually). Site goes live at
   **`https://<user>.github.io/the-funk-yes/`**.

### Custom domain or user site later

Edit `src/config.ts`:

```ts
export const SITE = { origin: "https://thefunkyes.band", /* … */ };
export const BASE_PATH: string = "/";           // was "/the-funk-yes"
```

For a custom domain also add `public/CNAME` containing just the bare domain, and
set the domain in Settings → Pages. Nothing else changes — every internal link
goes through `withBase()`.

---

## Contentful

Full instructions: **[`contentful/migration.md`](contentful/migration.md)**. Short version:

1. Create a space, run `contentful/migrate.cjs` (or build the 7 models by hand).
2. Create one `siteContent` entry + some shows / members / recordings / videos /
   FUNQs. **Publish** them.
3. Add repo **Secrets**: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_DELIVERY_TOKEN`.
4. Add a Contentful **webhook** → `repository_dispatch` so publishing rebuilds the
   site (steps in the guide).

Locally, put the same values in `.env` (copy from `.env.example`).

---

## Forms & newsletter

Both need a third-party endpoint (GitHub Pages can't process form posts). Set
these as repo **Variables** (and in `.env` for local):

| Variable | Used by | Get it from |
|---|---|---|
| `PUBLIC_FORMSPREE_ID` | contact / booking form | <https://formspree.io> — the id after `/f/` in your form endpoint |
| `PUBLIC_NEWSLETTER_URL` | email sign-up | your provider's embed/POST URL (e.g. [Buttondown](https://buttondown.email)) |

Prefer a different form host (Web3Forms, Getform, Formspark)? Swap the `action`
URL construction in `src/components/ContactForm.astro`.

---

## Editing content without Contentful

Everything renders from `src/lib/fixtures/index.ts` when Contentful isn't
configured — edit that file to change copy/shows/etc. for a fixtures-only deploy.

## Swapping the look

- Colors & fonts: the `@theme` block at the top of `src/styles/global.css`.
- Logo: `src/components/Logo.astro`.
- OG image: edit `scripts/make-og-image.mjs`, run `node scripts/make-og-image.mjs`.
- Placeholder photos: they come from the fixtures / Contentful, not the repo.

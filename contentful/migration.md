# Contentful setup

The site reads all regularly-changing content from Contentful at build time. Until
`CONTENTFUL_SPACE_ID` is set it builds from local fixtures (`src/lib/fixtures/`), so
you can do this whenever.

You can build the content models **automatically** (recommended) or **by hand**.

---

## Option A — run the migration script (fast)

1. Create a free space at <https://app.contentful.com> → note the **Space ID**
   (Settings → General settings).
2. Settings → API keys → **Content management tokens** → *Generate personal token*.
   Copy it (starts `CFPAT-…`).
3. From the repo root:

   ```bash
   npx contentful-migration \
     --space-id "<SPACE_ID>" \
     --management-token "<CFPAT token>" \
     --environment-id master \
     --yes \
     contentful/migrate.mjs
   ```

4. This creates: `siteContent`, `show`, `bandMember`, `recording`, `liveVideo`,
   `funq`, `gallery`. Then jump to **After the models exist** below.

---

## Option B — build the models by hand

Content model → Add content type. Field types in parens. Mark **required** where noted.

### `siteContent` — *Site content (singleton)*  (create exactly one entry)
| Field | ID | Type | Notes |
|---|---|---|---|
| Internal title | `internalTitle` | Short text | required, e.g. "Site content" |
| Mission statement | `missionStatement` | Short text | required |
| Hero tagline | `heroTagline` | Short text | required |
| Band bio (short) | `bandBioShort` | Long text | required |
| Band bio (long) | `bandBioLong` | Rich text | |
| Band group photo | `bandGroupPhoto` | Media (one file) | |
| The Fuck Yes! description | `fuckYesDescription` | Rich text | |
| The Fuck Yes! photo | `fuckYesPhoto` | Media (one file) | |
| Booking blurb | `bookingBlurb` | Rich text | |
| Funk Files intro | `funkFilesIntro` | Long text | |

### `show` — *Show*
| Field | ID | Type | Notes |
|---|---|---|---|
| Title | `title` | Short text | required, display field |
| Date & time | `dateTime` | Date & time | required |
| Venue name | `venueName` | Short text | required |
| Venue address | `venueAddress` | Short text | |
| City | `city` | Short text | |
| Ticket / info URL | `ticketUrl` | Short text | |
| Pricing | `pricing` | Short text | required; accept only `Free`, `Sliding scale`, `Ticketed` (dropdown) |
| Description | `description` | Long text | |
| Flyer | `flyer` | Media (one file) | |
| Status | `status` | Short text | required; only `Confirmed`, `Cancelled`, `Sold out` (dropdown) |

### `bandMember` — *Band member*
| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `name` | Short text | required, display field |
| Instrument / role | `instrumentRole` | Short text | required |
| Short bio | `shortBio` | Long text | required |
| Long bio | `longBio` | Rich text | |
| Photo | `photo` | Media (one file) | |
| Sort order | `order` | Integer | required (1, 2, 3 …) |
| Socials (JSON) | `socials` | JSON object | e.g. `{ "instagram": "https://…" }` |

### `recording` — *Recording*
| Field | ID | Type | Notes |
|---|---|---|---|
| Title | `title` | Short text | required, display field |
| Type | `recordingType` | Short text | required; `Practice`, `Live`, `Studio` (dropdown) |
| Platform | `platform` | Short text | required; `SoundCloud`, `Bandcamp`, `Google Drive` (dropdown) |
| Embed URL or id | `embedUrlOrId` | Short text | required — see note below |
| Recorded date | `recordedDate` | Date | |
| Description | `description` | Long text | |
| Feature on home page | `featured` | Boolean | |

**`embedUrlOrId` per platform:**
- **SoundCloud** — the track/playlist page URL (`https://soundcloud.com/…`).
- **Bandcamp** — the numeric **album id** (find it in the album's embed code:
  `album=1234567890`), or `track=1234567890` for a single track.
- **Google Drive** — the file's share URL or just its file id. The file must be
  shared **"Anyone with the link"**.

### `liveVideo` — *Live video*
| Field | ID | Type | Notes |
|---|---|---|---|
| Title | `title` | Short text | required, display field |
| Platform | `platform` | Short text | required; `YouTube`, `Google Drive`, `Instagram` (dropdown) |
| URL or id | `urlOrId` | Short text | required — YouTube id/URL, Drive id/URL, or Instagram post/reel URL |
| Date | `date` | Date | |
| Description | `description` | Long text | |
| Feature on home page | `featured` | Boolean | |

### `funq` — *FUNQ*
| Field | ID | Type | Notes |
|---|---|---|---|
| Question | `question` | Short text | required, display field |
| Answer | `answer` | Rich text | required |
| Sort order | `order` | Integer | required |

### `gallery` — *Gallery* (optional, not wired into a page yet)
| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `name` | Short text | required, display field |
| Source | `source` | Short text | `Instagram` or `Google Drive` |
| Source ref | `sourceRef` | Short text | handle/hashtag, or Drive folder id |
| Items (JSON list) | `items` | JSON object | `[{ "driveFileId": "…", "caption": "…", "isImage": true }]` |

---

## After the models exist

1. Create **one** `siteContent` entry and fill it in. Add a few `show`,
   `bandMember`, `recording`, `liveVideo`, and `funq` entries. **Publish** each one
   (draft entries are not returned by the delivery API).
2. Settings → API keys → **Add API key** → copy the **Space ID** and the
   **Content Delivery API - access token**.
3. Local: put them in `.env`

   ```
   CONTENTFUL_SPACE_ID=xxxx
   CONTENTFUL_DELIVERY_TOKEN=xxxx
   ```

   then `npm run build && npm run preview` — content now comes from Contentful.
4. CI: repo → Settings → Secrets and variables → Actions
   - **Secrets:** `CONTENTFUL_SPACE_ID`, `CONTENTFUL_DELIVERY_TOKEN`
   - **Variables (optional):** `CONTENTFUL_ENVIRONMENT` (default `master`)

## Rebuild on content change

So edits go live without a code push:

1. GitHub → your avatar → Settings → Developer settings → **Fine-grained personal
   access tokens** → generate one scoped to this repo with **Contents: Read and
   write** (needed to fire `repository_dispatch`). Copy it.
2. Contentful → Settings → **Webhooks** → Add webhook:
   - **URL:** `POST https://api.github.com/repos/<user>/the-funk-yes/dispatches`
   - **Headers:**
     - `Accept: application/vnd.github+json`
     - `Authorization: Bearer <the PAT>`
   - **Content type:** `application/json`
   - **Payload** (customize → JSON):
     ```json
     { "event_type": "contentful-update" }
     ```
   - **Triggers:** Entry & Asset — *publish* and *unpublish*.
3. Publish an entry → the `Build & deploy` workflow runs → site updates in a few
   minutes.

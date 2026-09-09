/**
 * Seed a fresh Contentful space with placeholder content, then publish it all.
 *
 * Run this AFTER `contentful/migrate.mjs` has created the content models.
 * It talks to the Contentful Management API over plain HTTPS — no extra
 * packages, just Node 20+ (global fetch).
 *
 *   CONTENTFUL_SPACE_ID=xxxxxxxx \
 *   CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxxxxxxx \
 *   node contentful/seed.mjs
 *
 * Optional env: CONTENTFUL_ENVIRONMENT (default "master").
 *
 * This mirrors src/lib/fixtures/index.ts (minus images — every photo/flyer
 * field is optional; add real assets in the web app later). It is a ONE-TIME
 * seed: re-running creates duplicate entries. To start over, bulk-delete
 * entries in the Contentful web app first.
 */

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";

if (!SPACE || !TOKEN) {
  console.error(
    "Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN (a CFPAT- personal token).",
  );
  process.exit(1);
}

const API = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}\n${text}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Minimal Contentful rich-text document from one or more plain paragraphs. */
function rich(paragraphs) {
  const paras = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  return {
    nodeType: "document",
    data: {},
    content: paras.map((text) => ({
      nodeType: "paragraph",
      data: {},
      content: [{ nodeType: "text", value: text, marks: [], data: {} }],
    })),
  };
}

const soon = (days, hour = 17) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

let LOCALE = "en-US";

async function createAndPublish(contentType, fields) {
  const wrapped = Object.fromEntries(
    Object.entries(fields)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, { [LOCALE]: v }]),
  );
  const entry = await cma("/entries", {
    method: "POST",
    headers: { "X-Contentful-Content-Type": contentType },
    body: { fields: wrapped },
  });
  await cma(`/entries/${entry.sys.id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(entry.sys.version) },
  });
  return entry.sys.id;
}

async function main() {
  const locales = await cma("/locales");
  LOCALE = (locales.items.find((l) => l.default) || locales.items[0]).code;
  console.log(`Space ${SPACE} · env ${ENV} · locale ${LOCALE}\n`);

  const jobs = [];

  jobs.push([
    "siteContent",
    {
      internalTitle: "Site content",
      missionStatement: "Elevate everything + everyone, everywhere.",
      heroTagline: "Live funk for backyards, bars, benefits, and the street corner.",
      bandBioShort:
        "The Funk Yes! is a four-piece funk band built on one rule: say yes to the groove. Acoustic guitar, electric guitar, bass, and cajon — we started as a Tuesday-night jam that refused to end and turned into a band that will play just about anywhere there's a corner and a pulse.",
      bandBioLong: rich([
        "The Funk Yes! started in a garage with a borrowed bass amp and a standing Tuesday invite. Nobody left. Months later the jam had a name, a booking calendar, and a lineup that stuck: acoustic guitar, electric guitar, bass, and cajon.",
        "We play practice-room funk, sweaty live sets, and the occasional studio experiment. No kit, no horns — just four people, a wooden box, and the pocket.",
      ]),
      fuckYesDescription: rich(
        "The Fuck Yes! is what happens after midnight. Same four players, darker room, heavier low end, no setlist. Fuzz on the electric guitar, the cajon hit like it owes somebody money, and the acoustic turned up loud enough to fight back.",
      ),
      bookingBlurb: rich([
        "We play backyards, streets, bars, restaurants, benefits, warehouses, weddings, wakes, and parking lots. The acoustic guitar and cajon mean we can go fully unplugged on a street corner or plug in and get loud in a warehouse — power or no power. Rates run on a sliding scale from free to whatever you've got.",
        "Tell us the place, the date, and the vibe. We'll bring the funk.",
      ]),
      funkFilesIntro:
        "Everything we've captured — phone recordings from the practice room, board tapes from live sets, and the stuff we actually finished in a studio.",
    },
  ]);

  const shows = [
    {
      title: "Funk @ 5 — Rooftop Kickoff",
      dateTime: soon(6),
      venueName: "The Loading Dock",
      venueAddress: "412 Warehouse Row",
      city: "Portland, OR",
      ticketUrl: "https://example.com/tickets/rooftop",
      pricing: "Sliding scale",
      description: "Golden-hour set on the roof. Bring a jacket and a friend.",
      status: "Confirmed",
    },
    {
      title: "Benefit for the Community Fridge",
      dateTime: soon(14),
      venueName: "St. Vincent's Hall",
      venueAddress: "9 Chapel St",
      city: "Portland, OR",
      pricing: "Free",
      description: "All tips split with the mutual-aid fridge network.",
      status: "Confirmed",
    },
    {
      title: "Late Set — The Fuck Yes!",
      dateTime: soon(21, 23),
      venueName: "Basement 9",
      venueAddress: "9 SE Alder St",
      city: "Portland, OR",
      ticketUrl: "https://example.com/tickets/late",
      pricing: "Ticketed",
      description: "The after-dark version. 21+, loud, no setlist.",
      status: "Confirmed",
    },
    {
      title: "Street Corner Sunday",
      dateTime: soon(30, 14),
      venueName: "Corner of 8th & Ankeny",
      venueAddress: "8th & E Ankeny",
      city: "Portland, OR",
      pricing: "Free",
      status: "Confirmed",
    },
  ];
  shows.forEach((s) => jobs.push(["show", s]));

  const members = [
    {
      name: "Cass Malone",
      instrumentRole: "Acoustic guitar / vocals / band leader",
      shortBio: "Calls the tunes, counts them off too fast, apologizes later.",
      longBio: rich(
        "Cass started the Tuesday jam that became The Funk Yes!. Plays rhythm like the downbeat is a personal challenge.",
      ),
      order: 1,
      socials: { instagram: "https://instagram.com/cassmalone" },
    },
    {
      name: "Reggie Cole",
      instrumentRole: "Bass",
      shortBio: "One note, held long enough to pay rent.",
      longBio: rich("Reggie is the reason the room moves. Fender P, flatwounds, no pick, no mercy."),
      order: 2,
    },
    {
      name: "Nina Park",
      instrumentRole: "Electric guitar",
      shortBio: "Rhythm parts like a metronome with opinions, solos like she's mad about it.",
      longBio: rich("Nina runs her tele through more pedals than strictly necessary. Nobody complains."),
      order: 3,
    },
    {
      name: "Marcus Adeyemi",
      instrumentRole: "Cajon / percussion",
      shortBio: "The metronome has a complaint and it is about Marcus.",
      longBio: rich(
        "Deep pocket, ghost notes for days, gets a full kit's worth of sound out of a wooden box.",
      ),
      order: 4,
    },
  ];
  members.forEach((m) => jobs.push(["bandMember", m]));

  const recordings = [
    {
      title: "Practice Room Jam #47",
      recordingType: "Practice",
      platform: "SoundCloud",
      embedUrlOrId: "https://soundcloud.com/forss/flickermood",
      recordedDate: soon(-20),
      description: "Phone on a music stand. The bridge falls apart at 3:10 and it rules.",
      featured: true,
    },
    {
      title: "Live at The Loading Dock",
      recordingType: "Live",
      platform: "SoundCloud",
      embedUrlOrId: "https://soundcloud.com/forss/soulhack",
      recordedDate: soon(-45),
      description: "Board tape, one mic on the crowd. The cajon's clipping and we left it.",
      featured: true,
    },
    {
      title: "Elevate Everything (studio)",
      recordingType: "Studio",
      platform: "Bandcamp",
      embedUrlOrId: "1234567890",
      recordedDate: soon(-90),
      description: "The one we actually finished. Two days, one room, no clicks.",
      featured: true,
    },
    {
      title: "Warm-up Grooves (loop)",
      recordingType: "Practice",
      platform: "Google Drive",
      embedUrlOrId: "1AbCdEfGhIjKlMnOpQrStUvWxYz012345",
      description: "Ten minutes of us finding the tempo. Useful, not pretty.",
      featured: false,
    },
  ];
  recordings.forEach((r) => jobs.push(["recording", r]));

  const videos = [
    {
      title: "Rooftop set — full jam",
      platform: "YouTube",
      urlOrId: "dQw4w9WgXcQ",
      date: soon(-45),
      description: "Golden hour, all four of us, crowd on the ledge.",
      featured: true,
    },
    {
      title: "Basement 9 — The Fuck Yes! (clip)",
      platform: "Instagram",
      urlOrId: "https://www.instagram.com/p/C0000000000/",
      date: soon(-30),
      description: "90 seconds of the late set. Filmed vertical, obviously.",
      featured: true,
    },
    {
      title: "Street corner Sunday",
      platform: "Google Drive",
      urlOrId: "1VideoFileIdGoesHere0000000000000",
      date: soon(-14),
      featured: false,
    },
  ];
  videos.forEach((v) => jobs.push(["liveVideo", v]));

  const funqs = [
    {
      question: "Is it “The Funk Yes!” or “The Fuck Yes!”?",
      answer: rich(
        "Both. The Funk Yes! is the daytime band. The Fuck Yes! is the same people after midnight with the gain up. Same love, different lighting.",
      ),
      order: 1,
    },
    {
      question: "What does it cost to book you?",
      answer: rich(
        "Sliding scale, free to generous. We'd rather play than not. If you can pay, pay what the night is worth to you.",
      ),
      order: 2,
    },
    {
      question: "How many of you are there?",
      answer: rich(
        "Four. Acoustic guitar, electric guitar, bass, and cajon. Sometimes a friend sits in, but the four of us are the whole band.",
      ),
      order: 3,
    },
    {
      question: "Do you do weddings / benefits / parking lots?",
      answer: rich("Yes, yes, and enthusiastically yes. The parking lot ones are our favorite."),
      order: 4,
    },
    {
      question: "Where do the recordings live?",
      answer: rich(
        "SoundCloud and Bandcamp for finished stuff, Google Drive for the rough practice-room tapes. It's all pulled into the Funk Files.",
      ),
      order: 5,
    },
  ];
  funqs.forEach((f) => jobs.push(["funq", f]));

  for (const [type, fields] of jobs) {
    const label = fields.title || fields.name || fields.question || fields.internalTitle;
    try {
      const id = await createAndPublish(type, fields);
      console.log(`  ✓ ${type.padEnd(12)} ${label}  (${id})`);
    } catch (err) {
      console.error(`  ✗ ${type.padEnd(12)} ${label}\n${err.message}\n`);
      process.exitCode = 1;
    }
  }

  console.log("\nDone. Check Content in the Contentful web app — everything should be Published.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

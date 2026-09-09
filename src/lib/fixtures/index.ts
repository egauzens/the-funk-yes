/**
 * Local stand-in content so the site builds and runs before Contentful exists
 * (and in CI on forks with no secrets). `src/lib/contentful.ts` returns these
 * whenever `CONTENTFUL_SPACE_ID` is unset.
 *
 * Media URLs point at royalty-free placeholders. Replace once real assets and a
 * Contentful space are in place — nothing here should ship to production.
 */
import type {
  BandMember,
  Funq,
  LiveVideo,
  Recording,
  Show,
  SiteContent,
} from "../types.ts";

const soon = (days: number, hour = 17) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const siteContent: SiteContent = {
  missionStatement: "Elevate everything + everyone, everywhere.",
  heroTagline: "Live funk for backyards, bars, benefits, and the street corner.",
  bandBioShort:
    "The Funk Yes! is a four-piece funk band built on one rule: say yes to the groove. Acoustic guitar, electric guitar, bass, and cajon — we started as a Tuesday-night jam that refused to end and turned into a band that will play just about anywhere there's a corner and a pulse.",
  bandBioLong:
    "<p>The Funk Yes! started in a garage with a borrowed bass amp and a standing Tuesday invite. Nobody left. Months later the jam had a name, a booking calendar, and a lineup that stuck: acoustic guitar, electric guitar, bass, and cajon.</p><p>We play <strong>practice-room funk</strong>, <strong>sweaty live sets</strong>, and the occasional <strong>studio experiment</strong>. No kit, no horns — just four people, a wooden box, and the pocket.</p>",
  bandGroupPhoto: {
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=70",
    alt: "The Funk Yes! playing a packed room",
    width: 1600,
    height: 1067,
  },
  fuckYesDescription:
    "<p><strong>The Fuck Yes!</strong> is what happens after midnight. Same four players, darker room, heavier low end, no setlist. Fuzz on the electric guitar, the cajon hit like it owes somebody money, and the acoustic turned up loud enough to fight back.</p>",
  fuckYesPhoto: {
    url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=70",
    alt: "Dark, smoke-lit stage with a band silhouetted against red light",
    width: 1600,
    height: 1067,
  },
  bookingBlurb:
    "<p>We play backyards, streets, bars, restaurants, benefits, warehouses, weddings, wakes, and parking lots. The acoustic guitar and cajon mean we can go fully unplugged on a street corner or plug in and get loud in a warehouse — power or no power. Rates run on a <strong>sliding scale from free to whatever you've got</strong> — and no, we would not turn down a $1,000,000 check from Elon Musk.</p><p>Tell us the place, the date, and the vibe. We'll bring the funk.</p>",
  funkFilesIntro:
    "Everything we've captured — phone recordings from the practice room, board tapes from live sets, and the stuff we actually finished in a studio.",
};

export const shows: Show[] = [
  {
    id: "show-1",
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
    id: "show-2",
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
    id: "show-3",
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
    id: "show-4",
    title: "Street Corner Sunday",
    dateTime: soon(30, 14),
    venueName: "Corner of 8th & Ankeny",
    venueAddress: "8th & E Ankeny",
    city: "Portland, OR",
    pricing: "Free",
    status: "Confirmed",
  },
];

export const bandMembers: BandMember[] = [
  {
    id: "bm-1",
    name: "Cass Malone",
    instrumentRole: "Acoustic guitar / vocals / band leader",
    shortBio: "Calls the tunes, counts them off too fast, apologizes later.",
    longBio:
      "<p>Cass started the Tuesday jam that became The Funk Yes!. Plays rhythm like the downbeat is a personal challenge.</p>",
    photo: {
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&h=1500&q=70",
      alt: "Acoustic guitarist playing live",
      width: 1200,
      height: 1500,
    },
    order: 1,
    socials: { instagram: "https://instagram.com/cassmalone" },
  },
  {
    id: "bm-2",
    name: "Reggie Cole",
    instrumentRole: "Bass",
    shortBio: "One note, held long enough to pay rent.",
    longBio: "<p>Reggie is the reason the room moves. Fender P, flatwounds, no pick, no mercy.</p>",
    photo: {
      url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&h=1500&q=70",
      alt: "Bassist in low light",
      width: 1200,
      height: 1500,
    },
    order: 2,
  },
  {
    id: "bm-3",
    name: "Nina Park",
    instrumentRole: "Electric guitar",
    shortBio: "Rhythm parts like a metronome with opinions, solos like she's mad about it.",
    longBio: "<p>Nina runs her tele through more pedals than strictly necessary. Nobody complains.</p>",
    photo: {
      url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&h=1500&q=70",
      alt: "Electric guitarist on a dim stage",
      width: 1200,
      height: 1500,
    },
    order: 3,
  },
  {
    id: "bm-4",
    name: "Marcus Adeyemi",
    instrumentRole: "Cajon / percussion",
    shortBio: "The metronome has a complaint and it is about Marcus.",
    longBio: "<p>Deep pocket, ghost notes for days, gets a full kit's worth of sound out of a wooden box.</p>",
    photo: {
      url: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=1200&h=1500&q=70",
      alt: "Hands playing a cajon",
      width: 1200,
      height: 1500,
    },
    order: 4,
  },
];

export const recordings: Recording[] = [
  {
    id: "rec-1",
    title: "Practice Room Jam #47",
    recordingType: "Practice",
    platform: "SoundCloud",
    embedUrlOrId: "https://soundcloud.com/forss/flickermood",
    recordedDate: soon(-20),
    description: "Phone on a music stand. The bridge falls apart at 3:10 and it rules.",
    featured: true,
  },
  {
    id: "rec-2",
    title: "Live at The Loading Dock",
    recordingType: "Live",
    platform: "SoundCloud",
    embedUrlOrId: "https://soundcloud.com/forss/soulhack",
    recordedDate: soon(-45),
    description: "Board tape, one mic on the crowd. The cajon's clipping and we left it.",
    featured: true,
  },
  {
    id: "rec-3",
    title: "Elevate Everything (studio)",
    recordingType: "Studio",
    platform: "Bandcamp",
    embedUrlOrId: "1234567890",
    recordedDate: soon(-90),
    description: "The one we actually finished. Two days, one room, no clicks.",
    featured: true,
  },
  {
    id: "rec-4",
    title: "Warm-up Grooves (loop)",
    recordingType: "Practice",
    platform: "Google Drive",
    embedUrlOrId: "1AbCdEfGhIjKlMnOpQrStUvWxYz012345",
    description: "Ten minutes of us finding the tempo. Useful, not pretty.",
    featured: false,
  },
];

export const liveVideos: LiveVideo[] = [
  {
    id: "lv-1",
    title: "Rooftop set — full jam",
    platform: "YouTube",
    urlOrId: "dQw4w9WgXcQ",
    date: soon(-45),
    description: "Golden hour, all four of us, crowd on the ledge.",
    featured: true,
  },
  {
    id: "lv-2",
    title: "Basement 9 — The Fuck Yes! (clip)",
    platform: "Instagram",
    urlOrId: "https://www.instagram.com/p/C0000000000/",
    date: soon(-30),
    description: "90 seconds of the late set. Filmed vertical, obviously.",
    featured: true,
  },
  {
    id: "lv-3",
    title: "Street corner Sunday",
    platform: "Google Drive",
    urlOrId: "1VideoFileIdGoesHere0000000000000",
    date: soon(-14),
    featured: false,
  },
];

export const funqs: Funq[] = [
  {
    id: "funq-1",
    question: "Is it “The Funk Yes!” or “The Fuck Yes!”?",
    answer:
      "<p>Both. <strong>The Funk Yes!</strong> is the daytime band. <strong>The Fuck Yes!</strong> is the same people after midnight with the gain up. Same love, different lighting.</p>",
    order: 1,
  },
  {
    id: "funq-2",
    question: "What does it cost to book you?",
    answer:
      "<p>Sliding scale, free to generous. We'd rather play than not. If you can pay, pay what the night is worth to you.</p>",
    order: 2,
  },
  {
    id: "funq-3",
    question: "How many of you are there?",
    answer:
      "<p>Four. Acoustic guitar, electric guitar, bass, and cajon. Sometimes a friend sits in, but the four of us are the whole band.</p>",
    order: 3,
  },
  {
    id: "funq-4",
    question: "Do you do weddings / benefits / parking lots?",
    answer: "<p>Yes, yes, and enthusiastically yes. The parking lot ones are our favorite.</p>",
    order: 4,
  },
  {
    id: "funq-5",
    question: "Where do the recordings live?",
    answer:
      "<p>SoundCloud and Bandcamp for finished stuff, Google Drive for the rough practice-room tapes. It's all pulled into the <a href=\"/the-funk-yes/funk-files\">Funk Files</a>.</p>",
    order: 5,
  },
];

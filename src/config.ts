/**
 * Static configuration for The Funk Yes! site.
 *
 * Everything here changes rarely and lives in the repo. Anything the band edits
 * on a regular basis (shows, recordings, bios, FUNQs, hero copy) comes from
 * Contentful instead — see `src/lib/contentful.ts`.
 */

/** Origin the site is served from (no trailing slash). */
export const SITE = {
  origin: "https://YOUR-GITHUB-USERNAME.github.io",
  title: "The Funk Yes!",
  shortTitle: "TFY!",
  description:
    "The Funk Yes! — a live funk band elevating everything and everyone, everywhere. Live jams, upcoming shows, recordings, and how to book us.",
  mission: "Elevate everything + everyone, everywhere.",
  bookingEmail: "book@thefunkyes.band",
} as const;

/**
 * Base path for GitHub Pages.
 *   - project site (default):        "/the-funk-yes"
 *   - user site / custom domain:     "/"
 * Astro prepends this to every internal link built with `withBase()` below.
 */
export const BASE_PATH: string = "/the-funk-yes";

/** Prefix an app-absolute path with the configured base path. */
export function withBase(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (BASE_PATH === "/" || BASE_PATH === "") return clean;
  return `${BASE_PATH}${clean}`;
}

/** Top navigation — also used to build the footer link list. */
export const NAV: { label: string; href: string }[] = [
  { label: "Live Jam-Funk", href: "/live-jam-funk" },
  { label: "Funk @ 5", href: "/funk-at-5" },
  { label: "Funk Files", href: "/funk-files" },
  { label: "Behind The Funk Yes!", href: "/behind-the-funk-yes" },
  { label: "The Fuck Yes!", href: "/fuck-yes" },
  { label: "Book Us", href: "/contact" },
  { label: "FUNQs", href: "/funqs" },
];

/** Social accounts — rendered centered in the hero and in the footer. */
export const SOCIALS: { label: string; href: string; icon: SocialIcon }[] = [
  { label: "Instagram", href: "https://instagram.com/thefunkyes", icon: "instagram" },
  { label: "SoundCloud", href: "https://soundcloud.com/thefunkyes", icon: "soundcloud" },
  { label: "Bandcamp", href: "https://thefunkyes.bandcamp.com", icon: "bandcamp" },
  { label: "YouTube", href: "https://youtube.com/@thefunkyes", icon: "youtube" },
  { label: "Spotify", href: "https://open.spotify.com/artist/000000", icon: "spotify" },
  { label: "Email", href: `mailto:${SITE.bookingEmail}`, icon: "email" },
];

export type SocialIcon =
  | "instagram"
  | "soundcloud"
  | "bandcamp"
  | "youtube"
  | "spotify"
  | "email";

/**
 * Third-party integrations. Fill these from GitHub repo *variables* at build
 * time (PUBLIC_ vars are inlined into the client bundle by Astro/Vite).
 * Falling back to empty string keeps local dev working; the components render a
 * friendly placeholder when a value is missing.
 */
export const INTEGRATIONS = {
  /** Formspree form id, e.g. "xdorwABC" — from https://formspree.io form settings. */
  formspreeId: import.meta.env.PUBLIC_FORMSPREE_ID ?? "",
  /** Newsletter POST endpoint, e.g. a Buttondown embed action URL. */
  newsletterUrl: import.meta.env.PUBLIC_NEWSLETTER_URL ?? "",
} as const;

/** Blurbs for the three link boxes in home Section 2. */
export const LINK_BOXES: {
  title: string;
  href: string;
  blurb: string;
  kicker: string;
}[] = [
  {
    kicker: "Watch",
    title: "Live Jam-Funk",
    href: "/live-jam-funk",
    blurb:
      "Full-length video from the room — the strings, the box, the pocket, the crowd. Every jam we caught on tape, in one place.",
  },
  {
    kicker: "Show up",
    title: "Funk @ 5",
    href: "/funk-at-5",
    blurb:
      "Where we're bringing the funk next. Backyards, bars, benefits, streets. Bring a friend, bring five.",
  },
  {
    kicker: "Know us",
    title: "Behind The Funk Yes!",
    href: "/behind-the-funk-yes",
    blurb:
      "Who's in the band, how it started, and why we keep saying yes. The whole story, players and all.",
  },
];

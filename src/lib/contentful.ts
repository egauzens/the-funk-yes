/**
 * Contentful access layer.
 *
 * All content is fetched here at build time and normalized into the plain
 * shapes in `./types.ts`. If `CONTENTFUL_SPACE_ID` is not set (local dev before
 * the space exists, or CI without secrets) every helper transparently returns
 * the fixtures in `./fixtures/` instead, so the site always builds.
 *
 * The delivery token is read-only and is only ever used in this module during
 * the build — it is never exposed to the browser.
 */
import { createClient, type EntryFieldTypes } from "contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import * as fixtures from "./fixtures/index.ts";
import type {
  BandMember,
  Funq,
  ImageRef,
  LiveVideo,
  Recording,
  RecordingType,
  Show,
  SiteContent,
} from "./types.ts";

const SPACE_ID = import.meta.env.CONTENTFUL_SPACE_ID;
const DELIVERY_TOKEN = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;
const ENVIRONMENT = import.meta.env.CONTENTFUL_ENVIRONMENT ?? "master";

export const usingContentful = Boolean(SPACE_ID && DELIVERY_TOKEN);

if (!usingContentful) {
  // eslint-disable-next-line no-console
  console.warn(
    "[contentful] CONTENTFUL_SPACE_ID / CONTENTFUL_DELIVERY_TOKEN not set — building with local fixture content.",
  );
}

const client = usingContentful
  ? createClient({
      space: SPACE_ID!,
      accessToken: DELIVERY_TOKEN!,
      environment: ENVIRONMENT,
    })
  : null;

/* --------------------------------- helpers -------------------------------- */

type RawFields = Record<string, unknown>;

/** Contentful asset -> ImageRef (adds https:, requests webp at a sane size). */
function toImage(asset: unknown, alt: string, width = 1600): ImageRef | undefined {
  const file = (asset as any)?.fields?.file;
  if (!file?.url) return undefined;
  const base = file.url.startsWith("//") ? `https:${file.url}` : file.url;
  const details = file.details?.image;
  return {
    url: `${base}?fm=webp&q=72&w=${width}`,
    alt: (asset as any)?.fields?.description || (asset as any)?.fields?.title || alt,
    width: details?.width,
    height: details?.height,
  };
}

/** Rich-text Document -> trusted HTML string. Empty string when absent. */
function richText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  try {
    return documentToHtmlString(doc as Document);
  } catch {
    return "";
  }
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

async function entries(contentType: string, query: Record<string, unknown> = {}) {
  if (!client) return [];
  const res = await client.getEntries({
    content_type: contentType,
    include: 2,
    limit: 200,
    ...query,
  });
  return res.items ?? [];
}

/* ------------------------------- public API ------------------------------ */

export async function getSiteContent(): Promise<SiteContent> {
  if (!client) return fixtures.siteContent;
  const [entry] = await entries("siteContent", { limit: 1 });
  if (!entry) return fixtures.siteContent;
  const f = entry.fields as RawFields;
  return {
    missionStatement: str(f.missionStatement, fixtures.siteContent.missionStatement),
    heroTagline: str(f.heroTagline, fixtures.siteContent.heroTagline),
    bandBioShort: str(f.bandBioShort, fixtures.siteContent.bandBioShort),
    bandBioLong: richText(f.bandBioLong) || fixtures.siteContent.bandBioLong,
    bandGroupPhoto: toImage(f.bandGroupPhoto, "The Funk Yes! band photo"),
    fuckYesDescription: richText(f.fuckYesDescription) || fixtures.siteContent.fuckYesDescription,
    fuckYesPhoto: toImage(f.fuckYesPhoto, "The Fuck Yes! band photo"),
    bookingBlurb: richText(f.bookingBlurb) || fixtures.siteContent.bookingBlurb,
    funkFilesIntro: str(f.funkFilesIntro, fixtures.siteContent.funkFilesIntro),
  };
}

export async function getShows(): Promise<Show[]> {
  if (!client) return [...fixtures.shows].sort(byDateTimeAsc);
  const items = await entries("show", { order: "fields.dateTime" });
  return items.map((entry): Show => {
    const f = entry.fields as RawFields;
    return {
      id: entry.sys.id,
      title: str(f.title, "Untitled show"),
      dateTime: str(f.dateTime),
      venueName: str(f.venueName),
      venueAddress: str(f.venueAddress),
      city: str(f.city),
      ticketUrl: str(f.ticketUrl) || undefined,
      pricing: (str(f.pricing, "Sliding scale") as Show["pricing"]),
      description: str(f.description) || undefined,
      flyer: toImage(f.flyer, `${str(f.title)} flyer`, 900),
      status: (str(f.status, "Confirmed") as Show["status"]),
    };
  });
}

export async function getUpcomingShows(limit?: number): Promise<Show[]> {
  const now = Date.now();
  const upcoming = (await getShows())
    .filter((s) => s.dateTime && new Date(s.dateTime).getTime() >= now - 1000 * 60 * 60 * 6)
    .sort(byDateTimeAsc);
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export async function getBandMembers(): Promise<BandMember[]> {
  if (!client) return [...fixtures.bandMembers].sort((a, b) => a.order - b.order);
  const items = await entries("bandMember", { order: "fields.order" });
  return items
    .map((entry): BandMember => {
      const f = entry.fields as RawFields;
      return {
        id: entry.sys.id,
        name: str(f.name, "Band member"),
        instrumentRole: str(f.instrumentRole),
        shortBio: str(f.shortBio),
        longBio: richText(f.longBio),
        photo: toImage(f.photo, `${str(f.name)} of The Funk Yes!`, 800),
        order: num(f.order, 99),
        socials: (f.socials as Record<string, string>) || undefined,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getRecordings(type?: RecordingType): Promise<Recording[]> {
  const all = client
    ? (await entries("recording", { order: "-fields.recordedDate" })).map((entry): Recording => {
        const f = entry.fields as RawFields;
        return {
          id: entry.sys.id,
          title: str(f.title, "Untitled recording"),
          recordingType: (str(f.recordingType, "Live") as RecordingType),
          platform: (str(f.platform, "SoundCloud") as Recording["platform"]),
          embedUrlOrId: str(f.embedUrlOrId),
          recordedDate: str(f.recordedDate) || undefined,
          description: str(f.description) || undefined,
          featured: Boolean(f.featured),
        };
      })
    : fixtures.recordings;
  return type ? all.filter((r) => r.recordingType === type) : all;
}

export async function getFeaturedRecordings(limit = 3): Promise<Recording[]> {
  const all = await getRecordings();
  const featured = all.filter((r) => r.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getLiveVideos(): Promise<LiveVideo[]> {
  if (!client) return fixtures.liveVideos;
  const items = await entries("liveVideo", { order: "-fields.date" });
  return items.map((entry): LiveVideo => {
    const f = entry.fields as RawFields;
    return {
      id: entry.sys.id,
      title: str(f.title, "Untitled video"),
      platform: (str(f.platform, "YouTube") as LiveVideo["platform"]),
      urlOrId: str(f.urlOrId),
      date: str(f.date) || undefined,
      description: str(f.description) || undefined,
      featured: Boolean(f.featured),
    };
  });
}

export async function getFeaturedVideos(limit = 4): Promise<LiveVideo[]> {
  const all = await getLiveVideos();
  const featured = all.filter((v) => v.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getFunqs(): Promise<Funq[]> {
  if (!client) return [...fixtures.funqs].sort((a, b) => a.order - b.order);
  const items = await entries("funq", { order: "fields.order" });
  return items
    .map((entry): Funq => {
      const f = entry.fields as RawFields;
      return {
        id: entry.sys.id,
        question: str(f.question, "Question"),
        answer: richText(f.answer),
        order: num(f.order, 99),
      };
    })
    .sort((a, b) => a.order - b.order);
}

function byDateTimeAsc(a: { dateTime: string }, b: { dateTime: string }) {
  return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
}

// Keeps `EntryFieldTypes` imported for downstream typing if models are codegen'd later.
export type { EntryFieldTypes };

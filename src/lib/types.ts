/**
 * Normalized content shapes used across the site.
 *
 * `src/lib/contentful.ts` maps raw Contentful entries into these plain objects
 * so components never touch the Contentful SDK types, and the local fixtures in
 * `src/lib/fixtures/` can match the exact same shape.
 *
 * Rich-text fields are normalized to trusted HTML strings at fetch time.
 */

export interface ImageRef {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export type ShowStatus = "Confirmed" | "Cancelled" | "Sold out";
export type ShowPricing = "Free" | "Sliding scale" | "Ticketed";

export interface Show {
  id: string;
  title: string;
  /** ISO 8601, includes time. */
  dateTime: string;
  venueName: string;
  venueAddress: string;
  city: string;
  ticketUrl?: string;
  pricing: ShowPricing;
  description?: string;
  flyer?: ImageRef;
  status: ShowStatus;
}

export interface BandMember {
  id: string;
  name: string;
  instrumentRole: string;
  shortBio: string;
  /** HTML. */
  longBio: string;
  photo?: ImageRef;
  order: number;
  socials?: Record<string, string>;
}

export type RecordingType = "Practice" | "Live" | "Studio";
export type RecordingPlatform = "SoundCloud" | "Bandcamp" | "Google Drive";

export interface Recording {
  id: string;
  title: string;
  recordingType: RecordingType;
  platform: RecordingPlatform;
  /** URL (SoundCloud / Drive) or numeric album id (Bandcamp). */
  embedUrlOrId: string;
  recordedDate?: string;
  description?: string;
  featured: boolean;
}

export type VideoPlatform = "YouTube" | "Google Drive" | "Instagram";

export interface LiveVideo {
  id: string;
  title: string;
  platform: VideoPlatform;
  /** URL or bare id, depending on platform. */
  urlOrId: string;
  date?: string;
  description?: string;
  featured: boolean;
}

export interface Funq {
  id: string;
  question: string;
  /** HTML. */
  answer: string;
  order: number;
}

export interface SiteContent {
  missionStatement: string;
  heroTagline: string;
  bandBioShort: string;
  /** HTML. */
  bandBioLong: string;
  bandGroupPhoto?: ImageRef;
  /** HTML. */
  fuckYesDescription: string;
  fuckYesPhoto?: ImageRef;
  /** HTML. */
  bookingBlurb: string;
  funkFilesIntro?: string;
}

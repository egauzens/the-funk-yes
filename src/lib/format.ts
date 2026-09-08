/** Shared date/time formatting for shows, recordings and videos. */

const TZ = "America/Los_Angeles";

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: TZ,
    ...opts,
  }).format(d);
}

export function fmtTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function dayParts(iso: string): { month: string; day: string; year: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: "", day: "", year: "" };
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...o }).format(d);
  return {
    month: fmt({ month: "short" }).toUpperCase(),
    day: fmt({ day: "2-digit" }),
    year: fmt({ year: "numeric" }),
  };
}

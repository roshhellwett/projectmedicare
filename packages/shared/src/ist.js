/**
 * All user-facing dates on this site are Indian Standard Time (Asia/Kolkata).
 * Every date/time string in the app must go through this module — no ad-hoc
 * toLocaleString calls anywhere else.
 */

export const IST_TIMEZONE = "Asia/Kolkata";

function fmt(value, options) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    ...options,
    timeZone: IST_TIMEZONE,
  }).format(date);
}

/** "Sunday, 9 August 2026" */
export function formatCampDate(value) {
  return fmt(value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "9 Aug 2026" */
export function formatShortDate(value) {
  return fmt(value, { day: "numeric", month: "short", year: "numeric" });
}

/** "9 Aug 2026, 7:35 pm IST" */
export function formatDateTime(value) {
  const base = fmt(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return base ? `${base} IST` : "";
}

/** Current date in IST as YYYY-MM-DD (useful for date inputs and comparisons). */
export function istToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** The date of the coming (or current) Sunday in IST, as YYYY-MM-DD. */
export function nextSundayIST() {
  const today = new Date(`${istToday()}T00:00:00+05:30`);
  const delta = (7 - today.getUTCDay()) % 7;
  const target = new Date(today.getTime() + delta * 86400000);
  return target.toISOString().slice(0, 10);
}

/** 'live' | 'scheduled' | 'expired' for a bulletin's visibility window. */
export function windowStatus(startsAt, endsAt, now = new Date()) {
  const t = now.getTime();
  if (startsAt && new Date(startsAt).getTime() > t) return "scheduled";
  if (endsAt && new Date(endsAt).getTime() < t) return "expired";
  return "live";
}

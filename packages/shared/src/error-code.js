/**
 * Support error codes.
 *
 * A code is what a user emails us: short, copy-pasteable, and traceable.
 * Shape: JM-<base36 timestamp>-<Sentry event id (12) | random (8)>
 * The timestamp segment lets us find the request in logs even when Sentry is
 * not configured.
 */

export const SUPPORT_EMAIL = "zenithprojects@icloud.com";

function randomSegment() {
  const bytes = new Uint8Array(4);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1)
      bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Build a support code, preferring a Sentry event id when one exists. */
export function makeErrorCode(eventId) {
  const stamp = Date.now().toString(36).toUpperCase();
  const tail = eventId
    ? String(eventId)
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 12)
    : randomSegment();
  return `JM-${stamp}-${tail.toUpperCase()}`;
}

/** True for strings that look like one of our codes. */
export function isErrorCode(value) {
  return typeof value === "string" && /^JM-[0-9A-Z]+-[0-9A-Z]+$/.test(value);
}

/** Everything the user should be able to copy in one click. */
export function formatErrorReport({
  code,
  path,
  digest,
  message,
  at = new Date(),
}) {
  return [
    `Error code: ${code}`,
    path ? `Page: ${path}` : null,
    digest ? `Digest: ${digest}` : null,
    message ? `Detail: ${message}` : null,
    `Time: ${at.toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** mailto: link pre-filled with the report so the user only has to press send. */
export function supportMailto(report, code) {
  const subject = `Janta Medicare website error ${code ?? ""}`.trim();
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    `Hello,\n\nI hit an error on the website.\n\n${report}\n\nWhat I was doing:\n`,
  )}`;
}

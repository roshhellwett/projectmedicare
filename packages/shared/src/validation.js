/**
 * Tiny hand-rolled validators (zero dependencies) used by every admin write
 * endpoint. Each returns the cleaned value or throws ValidationError.
 */

export class ValidationError extends Error {}

export function str(
  value,
  field,
  { min = 1, max = 500, optional = false } = {},
) {
  if (value === undefined || value === null || value === "") {
    if (optional) return "";
    throw new ValidationError(`${field} is required`);
  }
  if (typeof value !== "string")
    throw new ValidationError(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length < min) throw new ValidationError(`${field} is too short`);
  if (trimmed.length > max)
    throw new ValidationError(`${field} must be under ${max} characters`);
  return trimmed;
}

export function num(value, field, { min = 0, max = 1_000_000 } = {}) {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || Number.isNaN(n)) {
    throw new ValidationError(`${field} must be a number`);
  }
  if (n < min || n > max) throw new ValidationError(`${field} is out of range`);
  return n;
}

export function bool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

/** YYYY-MM-DD */
export function dateOnly(value, field) {
  const s = str(value, field, { max: 10 });
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    Number.isNaN(new Date(`${s}T00:00:00+05:30`).getTime())
  ) {
    throw new ValidationError(`${field} must be a valid date`);
  }
  return s;
}

/** ISO timestamp, or null when empty. A bare datetime-local value is read as IST. */
export function isoOrNull(value, field) {
  if (value === undefined || value === null || value === "") return null;
  const s = String(value);
  const d = new Date(s.length <= 16 ? `${s}:00+05:30` : s);
  if (Number.isNaN(d.getTime()))
    throw new ValidationError(`${field} must be a valid date & time`);
  return d.toISOString();
}

export function oneOf(value, field, allowed) {
  const s = String(value ?? "");
  if (!allowed.includes(s)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return s;
}

export function uuid(value, field) {
  const s = str(value, field, { max: 64 });
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  ) {
    throw new ValidationError(`${field} is invalid`);
  }
  return s;
}

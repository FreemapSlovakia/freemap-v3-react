/** A time as epoch milliseconds, or `undefined` for anything but a parsable string. */
export function toEpochMs(value: unknown): number | undefined {
  const ms = typeof value === 'string' ? Date.parse(value) : Number.NaN;

  return Number.isFinite(ms) ? ms : undefined;
}

/** UTC ISO time, whole seconds without `.000` — as GPX writes and the link reads back. */
export function isoInstant(ms: number): string {
  return new Date(ms).toISOString().replace(/\.000Z$/, 'Z');
}

/**
 * A `datetime-local` value in the viewer's time zone; `withMs` keeps a
 * fraction of a second where there is one.
 */
export function toDatetimeLocal(date: Date, withMs = false): string {
  const ten = (i: number): string => (i < 10 ? '0' : '') + i;

  const YYYY = date.getFullYear();

  const MM = ten(date.getMonth() + 1);

  const DD = ten(date.getDate());

  const HH = ten(date.getHours());

  const II = ten(date.getMinutes());

  const SS = ten(date.getSeconds());

  const ms = date.getMilliseconds();

  return `${YYYY}-${MM}-${DD}T${HH}:${II}:${SS}${
    withMs && ms ? `.${String(ms).padStart(3, '0')}` : ''
  }`;
}

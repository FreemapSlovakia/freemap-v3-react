/**
 * Days and hours in a place's time zone, or the browser's where it is null
 * (a forecast from before the API gave one).
 */

const formats = new Map<string, Intl.DateTimeFormat>();

// Cached: building one is far dearer than formatting.
function partsFormat(timeZone: string): Intl.DateTimeFormat {
  let format = formats.get(timeZone);

  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    formats.set(timeZone, format);
  }

  return format;
}

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function partsIn(date: Date, timeZone: string | null): Parts {
  if (!timeZone) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };
  }

  const parts = Object.fromEntries(
    partsFormat(timeZone)
      .formatToParts(date)
      .map((p) => [p.type, Number(p.value)]),
  );

  return parts as Parts;
}

/** `YYYY-MM-DD` of the day `date` falls on there. */
export function zonedDayKey(date: Date, timeZone: string | null): string {
  const { year, month, day } = partsIn(date, timeZone);

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function zonedHour(date: Date, timeZone: string | null): number {
  return partsIn(date, timeZone).hour;
}

/** The midnight starting the day `date` falls on there. */
export function zonedDayStart(date: Date, timeZone: string | null): Date {
  const { year, month, day } = partsIn(date, timeZone);

  const midnight = Date.UTC(year, month - 1, day);

  // Taken again at the guess: a DST switch makes midnight's offset differ.
  const guess = midnight - offsetMinutes(date, timeZone) * 60_000;

  return new Date(midnight - offsetMinutes(new Date(guess), timeZone) * 60_000);
}

/** Whether the browser knows the zone; a renamed one may be new to it. */
export function isKnownZone(timeZone: string): boolean {
  try {
    partsFormat(timeZone);

    return true;
  } catch {
    return false;
  }
}

/** Minutes the zone is ahead of UTC at `date`. */
function offsetMinutes(date: Date, timeZone: string | null): number {
  if (!timeZone) {
    return -date.getTimezoneOffset();
  }

  const p = partsIn(date, timeZone);

  return Math.round(
    (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) -
      (date.getTime() - date.getMilliseconds())) /
      60_000,
  );
}

/**
 * How far the place's clock is from the browser's, as "+1 h" or "−0:30 h";
 * null where they agree.
 */
// TODO: says the difference `at` only; it changes within the forecast where
// just one of the zones switches DST.
export function zoneDifference(
  timeZone: string | null,
  at: Date,
): string | null {
  const minutes = offsetMinutes(at, timeZone) - offsetMinutes(at, null);

  if (minutes === 0) {
    return null;
  }

  const abs = Math.abs(minutes);

  const hm =
    abs % 60 === 0
      ? String(abs / 60)
      : `${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;

  return `${minutes > 0 ? '+' : '−'}${hm} h`;
}

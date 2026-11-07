import type { EventItem } from '../model/actions.js';
import { spanOf } from '../model/colorize.js';

const DAY_MS = 86_400_000;

const localDay = (at: number) => {
  const d = new Date(at);

  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS;
};

// Halves away from zero, so a distance ahead and behind round alike.
const round = (n: number) => Math.sign(n) * Math.round(Math.abs(n));

/**
 * When an event starts or ended, relative to `now`, in one unit ("in 4 weeks",
 * "yesterday"); while it runs "now", or "today" for one lasting whole days.
 * `anchor` is the date it counts to. Running is as the map colours it.
 */
export function eventRelativeTime(
  event: Pick<EventItem, 'startAt' | 'endAt' | 'dateOnly'>,
  format: Intl.RelativeTimeFormat,
  now: Date,
): { text: string; anchor: 'start' | 'end' } {
  const [start, end] = spanOf(event);

  const t = now.getTime();

  // Without times or an end, it lasts its days through.
  const byDay = event.dateOnly || !event.endAt;

  if (start <= t && t < end) {
    return {
      text: byDay ? format.format(0, 'day') : format.format(0, 'second'),
      anchor: 'end',
    };
  }

  const upcoming = t < start;

  const anchor = upcoming ? 'start' : 'end';

  // An ended one counts to its last day, or its end's moment.
  const at = upcoming ? start : byDay ? end - 1 : end;

  const days = localDay(at) - localDay(t);

  // A timed one on the same day or within hours, by the hour, so one past
  // midnight isn't "tomorrow".
  if (!event.dateOnly && (days === 0 || Math.abs(at - t) < 6 * 3_600_000)) {
    const minutes = round((at - t) / 60_000);

    return {
      text:
        Math.abs(minutes) < 60
          ? format.format(minutes, 'minute')
          : format.format(round(minutes / 60), 'hour'),
      anchor,
    };
  }

  const size = Math.abs(days);

  return {
    text:
      size < 14
        ? format.format(days, 'day')
        : size < 60
          ? format.format(round(days / 7), 'week')
          : // Months up to 18, so a year is never one, which "auto" says as
            // "next year", a calendar year.
            size < 548
            ? format.format(round(days / 30.44), 'month')
            : format.format(round(days / 365.25), 'year'),
    anchor,
  };
}

import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { EventItem } from '../model/actions.js';

/**
 * Formats an event's start and end with `options`; a date-only event's days
 * without the time and in UTC, where its midnights are.
 */
export function useEventDatesFormat(options: Intl.DateTimeFormatOptions) {
  const { hour: _hour, minute: _minute, ...dayOptions } = options;

  const timed = useDateTimeFormat(options);

  const dateOnly = useDateTimeFormat({ ...dayOptions, timeZone: 'UTC' });

  return (event: Pick<EventItem, 'startAt' | 'endAt' | 'dateOnly'>) => {
    const format = event.dateOnly ? dateOnly : timed;

    return event.endAt
      ? `${format.format(event.startAt)} – ${format.format(event.endAt)}`
      : format.format(event.startAt);
  };
}

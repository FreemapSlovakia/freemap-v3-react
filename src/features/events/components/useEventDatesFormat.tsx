import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactNode } from 'react';
import type { EventItem } from '../model/actions.js';

/**
 * Formats an event's start and end with `options`; a date-only event's days
 * without the time and in UTC, where its midnights are. `note` goes after the
 * date it is `of`.
 */
export function useEventDatesFormat(options: Intl.DateTimeFormatOptions) {
  const { hour: _hour, minute: _minute, ...dayOptions } = options;

  const timed = useDateTimeFormat(options);

  const dateOnly = useDateTimeFormat({ ...dayOptions, timeZone: 'UTC' });

  return (
    event: Pick<EventItem, 'startAt' | 'endAt' | 'dateOnly'>,
    note?: { of: 'start' | 'end'; node: ReactNode },
  ): ReactNode => {
    const format = event.dateOnly ? dateOnly : timed;

    const start = format.format(event.startAt);

    if (!event.endAt) {
      return (
        <>
          {start}
          {note?.node}
        </>
      );
    }

    return (
      <>
        {start}
        {note?.of === 'start' && note.node}
        {' – '}
        {format.format(event.endAt)}
        {note?.of === 'end' && note.node}
      </>
    );
  };
}

import type { ComponentProps, ReactElement } from 'react';
import type { EventSummary } from '../model/actions.js';
import { EventValues } from './EventTraits.js';
import { useEventDatesFormat } from './useEventDatesFormat.js';

const DATE_FORMAT = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} as const;

/**
 * An event's dates and values as running text, under its title in a list row
 * and a minimized panel; the indicators go beside the title.
 */
export function EventLine({
  event,
  ...values
}: ComponentProps<typeof EventValues> & {
  event: Pick<EventSummary, 'startAt' | 'endAt' | 'dateOnly'>;
}): ReactElement {
  const formatDates = useEventDatesFormat(DATE_FORMAT);

  return (
    <small className="d-block">
      <span className="text-nowrap">{formatDates(event)}</span>

      <EventValues event={event} afterText {...values} />
    </small>
  );
}

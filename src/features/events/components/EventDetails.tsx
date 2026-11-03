import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
import type { EventItem } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

/** An event's details, as its toast shows them. */
export function EventDetails({ event }: { event: EventItem }): ReactElement {
  const em = useEventsMessages();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div className="fw-bold">
        {event.name}{' '}
        {event.visibility === 'unlisted' && (
          <Badge bg="secondary">{em?.visibilityUnlisted}</Badge>
        )}
      </div>

      <div>
        {dateFormat.format(event.startAt)}
        {event.endAt && ` – ${dateFormat.format(event.endAt)}`}
      </div>

      {event.description && (
        <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
          {event.description}
        </div>
      )}
    </>
  );
}

import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import type { EventSummary } from '../model/actions.js';
import { EventsListTraitSchema } from '../model/listSort.js';
import { EventLine } from './EventLine.js';
import { EventIndicators } from './EventTraits.js';

const ALL_TRAITS = new Set(EventsListTraitSchema.options);

/** An event found by the search box, as a row of the events list shows it. */
export function EventSearchItem({
  event,
  active,
}: {
  event: EventSummary;
  active: boolean;
}): ReactElement {
  return (
    <Dropdown.Item
      as="button"
      // Not to submit the search box's form.
      type="button"
      eventKey={`event-${event.id}`}
      active={active}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="text-truncate me-auto">{event.title}</span>

        <EventIndicators event={event} traits={ALL_TRAITS} />
      </div>

      <EventLine event={event} traits={ALL_TRAITS} />
    </Dropdown.Item>
  );
}

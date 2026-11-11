import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Badge, Button, Dropdown } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import z from 'zod';
import {
  EVENTS_LAYER,
  type EventSummary,
  EventSummarySchema,
} from '../model/actions.js';
import { spanOf } from '../model/colorize.js';
import type { EventsListTrait } from '../model/listSort.js';
import { eventsLayerOnSelector, selectedEventId } from '../model/selectors.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';
import { EventLine } from './EventLine.js';

// A row tells the map's events apart by their dates.
const DATES_ONLY = new Set<EventsListTrait>();

/** Upcoming first, soonest on top; then the ended, latest on top. */
function ordered(events: EventSummary[], now: number): EventSummary[] {
  const upcoming = events.filter((e) => spanOf(e)[1] > now);

  const ended = events.filter((e) => spanOf(e)[1] <= now);

  return [
    ...upcoming.toSorted((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    ...ended.toSorted((a, b) => b.startAt.getTime() - a.startAt.getTime()),
  ];
}

/** The events linking the open map: one is opened by the button, more listed. */
export function MapEventsButton({
  mapId,
}: {
  mapId: string;
}): ReactElement | null {
  const em = useEventsMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // A save or a delete may link or unlink this map.
  const saving = useAppSelector((state) => state.events.saving);

  const selectedId = useAppSelector(selectedEventId);

  // A deleted event lets go of the selection.
  const nothingSelected = selectedId === null;

  // Tagged with their map, so another's never show while this one's load.
  const [found, setFound] = useState<{
    mapId: string;
    events: EventSummary[];
  }>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: on a deselect too, which a delete makes
  useEffect(() => {
    if (saving) {
      return;
    }

    let current = true;

    (async () => {
      let events: EventSummary[] = [];

      try {
        const res = await httpRequest({
          getState: store.getState,
          url: `/events?${new URLSearchParams({ mapId, summary: '1' })}`,
          expectedStatus: 200,
          cancelActions: [],
        });

        events = ordered(
          z.array(EventSummarySchema).parse(await res.json()),
          Date.now(),
        );
      } catch (err) {
        // The button is extra; the map works without it.
        console.warn('Loading the map’s events failed', err);
      }

      if (current) {
        setFound({ mapId, events });
      }
    })();

    return () => {
      current = false;
    };
  }, [mapId, saving, nothingSelected, store]);

  const events = found?.mapId === mapId ? found.events : [];

  if (!events.length) {
    return null;
  }

  const open = (id: string) => {
    trackMatomo(['trackEvent', 'Events', 'openFromMap']);

    // As an event's link does: its layer on, to show it.
    if (!eventsLayerOnSelector(store.getState())) {
      dispatch(mapToggleLayer({ type: EVENTS_LAYER, enable: true }));
    }

    dispatch(selectFeature({ type: 'event', id }));
  };

  if (events.length === 1) {
    const [event] = events as [EventSummary];

    return (
      <LongPressTooltip label={event.title}>
        {({ props }) => (
          <Button
            variant="secondary"
            active={event.id === selectedId}
            onClick={() => open(event.id)}
            {...props}
          >
            <FaCalendarAlt />
          </Button>
        )}
      </LongPressTooltip>
    );
  }

  return (
    <Dropdown onSelect={(id) => id && open(id)}>
      <LongPressTooltip label={em?.mapEvents}>
        {({ props }) => (
          <Dropdown.Toggle variant="secondary" {...props}>
            <FaCalendarAlt />{' '}
            <Badge pill bg="dark">
              {events.length}
            </Badge>
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        {events.map((event) => (
          <Dropdown.Item
            key={event.id}
            as="button"
            eventKey={event.id}
            active={event.id === selectedId}
          >
            <div className="text-truncate">{event.title}</div>

            <EventLine event={event} traits={DATES_ONLY} />
          </Dropdown.Item>
        ))}
      </FmDropdownMenu>
    </Dropdown>
  );
}

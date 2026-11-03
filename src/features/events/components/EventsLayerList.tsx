import { selectFeature } from '@app/store/actions.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { distanceTo } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useMemo } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { selectedEventId } from '../model/selectors.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

/** The events the layer shows, on its page in the map layers panel. */
export function EventsLayerList(): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const events = useAppSelector((state) => state.events.list);

  const near = useAppSelector((state) => state.events.filter.near);

  const language = useAppSelector((state) => state.l10n.language);

  // Nearest first, near a place; otherwise as listed, by date.
  const list = useMemo(
    () =>
      near
        ? events
            .map((event) => ({
              event,
              km: distanceTo(near, event.startPoint) / 1000,
            }))
            .toSorted((a, b) => a.km - b.km)
        : events.map((event) => ({ event, km: undefined })),
    [events, near],
  );

  const kmFormat = new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  });

  const selectedId = useAppSelector(selectedEventId);

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (list.length === 0) {
    return <p className="text-muted mb-2">{em?.noEvents}</p>;
  }

  return (
    <ListGroup className="mb-2">
      {list.map(({ event, km }) => (
        <ListGroup.Item
          key={event.id}
          action
          active={event.id === selectedId}
          onClick={() => {
            dispatch(selectFeature({ type: 'event', id: event.id }));

            void panToUncovered(dispatch, event.startPoint, { ifHidden: true });
          }}
        >
          <div className="text-truncate">{event.title}</div>

          <small className="text-truncate d-block">
            {dateFormat.format(event.startAt)}
            {event.endAt && ` – ${dateFormat.format(event.endAt)}`}
            {km !== undefined && ` · ${kmFormat.format(km)} km`}
          </small>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

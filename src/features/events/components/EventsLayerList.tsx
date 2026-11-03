import { selectFeature } from '@app/store/actions.js';
import { panToUncovered } from '@features/map/panToUncovered.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import type { ReactElement } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { selectedEventId } from '../model/selectors.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

/** The events the layer shows, on its page in the map layers panel. */
export function EventsLayerList(): ReactElement {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const list = useAppSelector((state) => state.events.list);

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
      {list.map((event) => (
        <ListGroup.Item
          key={event.mapId}
          action
          active={event.mapId === selectedId}
          onClick={() => {
            dispatch(selectFeature({ type: 'event', id: event.mapId }));

            const at = event.startPoint ?? event.filterLocation;

            if (at) {
              void panToUncovered(dispatch, at, { ifHidden: true });
            }
          }}
        >
          <div className="text-truncate">{event.name}</div>

          <small className="text-truncate d-block">
            {dateFormat.format(event.startAt)}
            {event.endAt && ` – ${dateFormat.format(event.endAt)}`}
          </small>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

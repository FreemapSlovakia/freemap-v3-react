import { setActiveModal } from '@app/store/actions.js';
import { mapsLoad } from '@features/myMaps/model/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';
import { Popup } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { EVENTS_LAYER } from '../model/actions.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

export function EventsLayer(): ReactElement | null {
  const dispatch = useDispatch();

  const em = useEventsMessages();

  const list = useAppSelector((state) => state.events.list);

  // The list is also populated for the panel; only paint markers when the
  // independent overlay layer is actually enabled.
  const layerActive = useAppSelector((state) =>
    state.map.layers.includes(EVENTS_LAYER),
  );

  if (!layerActive) {
    return null;
  }

  return (
    <>
      {list.map((event) => {
        const point = event.startPoint ?? event.filterLocation;

        if (!point) {
          return null;
        }

        return (
          <RichMarker
            key={event.id}
            position={{ lat: point.lat, lng: point.lon }}
            color="#6f42c1"
          >
            <Popup>
              <b>{event.title}</b>

              <div className="text-muted">
                {event.startAt.toLocaleString()}
                {event.endAt ? ` – ${event.endAt.toLocaleString()}` : ''}
              </div>

              {event.description && (
                <div className="mt-1">{event.description}</div>
              )}

              <Button
                className="mt-2"
                size="sm"
                variant="primary"
                onClick={() => {
                  // Same load path as My maps: opens the event's underlying map.
                  dispatch(mapsLoad({ id: event.mapId }));

                  dispatch(setActiveModal(null));
                }}
              >
                <FaSignInAlt /> {em?.open}
              </Button>
            </Popup>
          </RichMarker>
        );
      })}
    </>
  );
}

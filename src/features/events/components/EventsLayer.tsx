import { selectFeature } from '@app/store/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { EVENTS_LAYER } from '../model/actions.js';
import { selectedEventId } from '../model/selectors.js';

export function EventsLayer(): ReactElement | null {
  const dispatch = useDispatch();

  const list = useAppSelector((state) => state.events.list);

  const selected = useAppSelector((state) => state.events.selected);

  const selectedId = useAppSelector(selectedEventId);

  const layerActive = useAppSelector((state) =>
    state.map.layers.includes(EVENTS_LAYER),
  );

  if (!layerActive) {
    return null;
  }

  // The filter may have dropped the selected one.
  const shown =
    selected && !list.some((e) => e.mapId === selected.mapId)
      ? [...list, selected]
      : list;

  return (
    <>
      {shown.map((event) => {
        const point = event.startPoint ?? event.filterLocation;

        if (!point) {
          return null;
        }

        return (
          <RichMarker
            key={event.mapId}
            position={{ lat: point.lat, lng: point.lon }}
            color="#6f42c1"
            faIcon={<FaCalendarAlt />}
            halo={event.mapId === selectedId ? SELECTION_COLOR : undefined}
            zIndexOffset={event.mapId === selectedId ? 1000 : 0}
            eventHandlers={{
              click() {
                dispatch(selectFeature({ type: 'event', id: event.mapId }));
              },
            }}
          >
            {event.name && <Tooltip direction="top">{event.name}</Tooltip>}
          </RichMarker>
        );
      })}
    </>
  );
}

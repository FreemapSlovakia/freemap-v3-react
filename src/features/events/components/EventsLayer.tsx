import { selectFeature } from '@app/store/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCalendarDay } from 'react-icons/fa';
import { Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { eventColor } from '../model/colorize.js';
import { eventsLayerOnSelector, selectedEventId } from '../model/selectors.js';
import { iconOfKind } from '../model/transports.js';

export function EventsLayer(): ReactElement | null {
  const dispatch = useDispatch();

  const list = useAppSelector((state) => state.events.list);

  const selected = useAppSelector((state) => state.events.selected);

  const selectedId = useAppSelector(selectedEventId);

  const layerActive = useAppSelector(eventsLayerOnSelector);

  const colorizeBy = useAppSelector((state) => state.eventsSettings.colorizeBy);

  const userId = useAppSelector((state) => state.auth.user?.id);

  if (!layerActive) {
    return null;
  }

  const now = Date.now();

  // The filter may have dropped the selected one.
  const shown =
    selected && !list.some((e) => e.id === selected.id)
      ? [...list, selected]
      : list;

  return (
    <>
      {shown.map((event) => (
        <RichMarker
          key={event.id}
          position={{ lat: event.startPoint.lat, lng: event.startPoint.lon }}
          color={eventColor(event, colorizeBy, userId, now)}
          // One kind of transport shows as itself; several can't share the glyph.
          faIcon={
            (event.transports.length === 1 &&
              iconOfKind(event.transports[0]!)) || <FaCalendarDay />
          }
          halo={event.id === selectedId ? SELECTION_COLOR : undefined}
          zIndexOffset={event.id === selectedId ? 1000 : 0}
          eventHandlers={{
            click() {
              dispatch(selectFeature({ type: 'event', id: event.id }));
            },
          }}
        >
          <Tooltip direction="top">{event.title}</Tooltip>
        </RichMarker>
      ))}
    </>
  );
}

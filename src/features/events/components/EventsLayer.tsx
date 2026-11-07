import { selectFeature } from '@app/store/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import eventsBody from '@shared/mapLibrary/defs/events.js';
import type { ReactElement } from 'react';
import { FaCalendarDay } from 'react-icons/fa';
import { Pane, Tooltip } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { eventColor, stackOrder } from '../model/colorize.js';
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

  const zoomOk = useAppSelector(
    (state) => state.map.zoom >= (eventsBody.minZoom ?? 0),
  );

  if (!layerActive) {
    return null;
  }

  const now = Date.now();

  // By its id: the full one, or while it loads its summary. The filter may have
  // dropped it, and zoomed out it is the only one shown.
  const selectedItem =
    selected?.id === selectedId
      ? selected
      : list.find((e) => e.id === selectedId);

  const shown = [
    ...(zoomOk
      ? stackOrder(
          list.filter((e) => e.id !== selectedId),
          colorizeBy,
          userId,
          now,
        )
      : []),
    ...(selectedItem ? [selectedItem] : []),
  ];

  return (
    // A pane of its own under the other markers: the stacking offsets below
    // would lift these above route points, drawing points and results.
    <Pane name="fm-events" style={{ zIndex: 590 }}>
      {shown.map((event, i) => (
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
          // Leaflet stacks by the marker's y plus this, so a step must outdo
          // the y apart two overlapping markers can be; the selected is last.
          zIndexOffset={i * 100}
          eventHandlers={{
            click() {
              dispatch(selectFeature({ type: 'event', id: event.id }));
            },
          }}
        >
          <Tooltip direction="top" pane="tooltipPane">
            {event.title}
          </Tooltip>
        </RichMarker>
      ))}
    </Pane>
  );
}

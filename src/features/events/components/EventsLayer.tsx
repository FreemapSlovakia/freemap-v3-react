import { selectFeature } from '@app/store/actions.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import eventsBody from '@shared/mapLibrary/defs/events.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { FaCalendarDay } from 'react-icons/fa';
import { Pane, Tooltip, useMap } from 'react-leaflet';
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

  const map = useMap();

  // Only the markers in view, and half a view around it: a thousand Leaflet
  // markers off screen still slow every pan and zoom.
  const [bounds, setBounds] = useState(() => map.getBounds().pad(0.5));

  useEffect(() => {
    const update = () => setBounds(map.getBounds().pad(0.5));

    map.on('moveend', update);

    return () => {
      map.off('moveend', update);
    };
  }, [map]);

  // Ranked over the whole list, then culled per pan: a marker entering the
  // view, or one selected, restacks no other. Ticking, as "when" ranks and
  // colours by what has started.
  const now = useNow();

  // Only "when" ranks by the time: the others aren't re-sorted every minute.
  const rankNow = colorizeBy === 'when' ? now : 0;

  const ranked = useMemo(
    () => stackOrder(list, colorizeBy, userId, rankNow),
    [list, colorizeBy, userId, rankNow],
  );

  if (!layerActive) {
    return null;
  }

  // By its id: the full one, or while it loads its summary. The filter may have
  // dropped it, and zoomed out it is the only one shown.
  const selectedItem =
    selected?.id === selectedId
      ? selected
      : list.find((e) => e.id === selectedId);

  const shown = [
    ...(zoomOk ? ranked : [])
      .map((event, rank) => ({ event, rank }))
      .filter(
        ({ event }) =>
          event.id !== selectedId &&
          bounds.contains([event.startPoint.lat, event.startPoint.lon]),
      ),
    ...(selectedItem ? [{ event: selectedItem, rank: ranked.length }] : []),
  ];

  return (
    // A pane of its own under the other markers: the stacking offsets below
    // would lift these above route points, drawing points and results.
    <Pane name="fm-events" style={{ zIndex: 590 }}>
      {shown.map(({ event, rank }) => (
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
          zIndexOffset={rank * 100}
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

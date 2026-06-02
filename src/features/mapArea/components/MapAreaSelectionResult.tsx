import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { divIcon, type LeafletEvent } from 'leaflet';
import { type ReactElement, useRef } from 'react';
import { Marker, Rectangle } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { type Bbox, mapAreaSetSelecting } from '../model/actions.js';
import classes from './MapAreaSelectionResult.module.css';

const cornerIcon = divIcon({
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
  html: `<div class="${classes['corner-handle']}"></div>`,
});

const moveIcon = divIcon({
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
  html: `<div class="${classes['move-handle']}">${'<span></span>'.repeat(9)}</div>`,
});

// see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
function preventMapClick() {
  window.preventMapClick = true;

  window.setTimeout(() => {
    window.preventMapClick = false;
  });
}

export function MapAreaSelectionResult(): ReactElement | null {
  const dispatch = useDispatch();

  const bbox = useAppSelector((state) => state.mapArea.selecting);

  // snapshot taken at drag start of the whole-rectangle move handle
  const moveStart = useRef<{ lat: number; lng: number; bbox: Bbox } | null>(
    null,
  );

  if (!bbox) {
    return null;
  }

  // narrowed const so nested handler closures keep the non-null type
  const box: Bbox = bbox;

  const [w, s, e, n] = box;

  // corners as [lat, lng]; index drives which edges a handle controls
  // 0 = SW (w, s), 1 = SE (e, s), 2 = NE (e, n), 3 = NW (w, n)
  const corners: [number, number][] = [
    [s, w],
    [s, e],
    [n, e],
    [n, w],
  ];

  function moveCorner(index: number, lat: number, lng: number) {
    const nb = [...box] as Bbox;

    if (index === 0) {
      nb[0] = lng;
      nb[1] = lat;
    } else if (index === 1) {
      nb[2] = lng;
      nb[1] = lat;
    } else if (index === 2) {
      nb[2] = lng;
      nb[3] = lat;
    } else {
      nb[0] = lng;
      nb[3] = lat;
    }

    dispatch(mapAreaSetSelecting(nb));
  }

  return (
    <>
      <Rectangle
        bounds={[
          [s, w],
          [n, e],
        ]}
        interactive={false}
        pathOptions={{ color: '#3388ff', weight: 2, fillOpacity: 0.15 }}
      />

      {corners.map(([lat, lng], index) => (
        <Marker
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          draggable
          position={{ lat, lng }}
          icon={cornerIcon}
          eventHandlers={{
            dragstart: preventMapClick,
            drag(e: LeafletEvent) {
              const c = e.target.getLatLng();

              moveCorner(index, c.lat, c.lng);
            },
            dragend(e: LeafletEvent) {
              const c = e.target.getLatLng();

              moveCorner(index, c.lat, c.lng);

              preventMapClick();
            },
          }}
        />
      ))}

      <Marker
        draggable
        position={{ lat: (s + n) / 2, lng: (w + e) / 2 }}
        icon={moveIcon}
        eventHandlers={{
          dragstart(e: LeafletEvent) {
            preventMapClick();

            const c = e.target.getLatLng();

            moveStart.current = { lat: c.lat, lng: c.lng, bbox: box };
          },
          drag(e: LeafletEvent) {
            const start = moveStart.current;

            if (!start) {
              return;
            }

            const c = e.target.getLatLng();

            const dLat = c.lat - start.lat;

            const dLng = c.lng - start.lng;

            dispatch(
              mapAreaSetSelecting([
                start.bbox[0] + dLng,
                start.bbox[1] + dLat,
                start.bbox[2] + dLng,
                start.bbox[3] + dLat,
              ]),
            );
          },
          dragend() {
            moveStart.current = null;

            preventMapClick();
          },
        }}
      />
    </>
  );
}

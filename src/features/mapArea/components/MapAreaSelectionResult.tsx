import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { divIcon, type LeafletEvent } from 'leaflet';
import { type ReactElement, useRef } from 'react';
import { Marker, Pane, Rectangle } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { type Bbox, mapAreaSetSelecting } from '../model/actions.js';
import classes from './MapAreaSelectionResult.module.css';

function cornerIcon(cursorClass: string) {
  return divIcon({
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: '',
    html: `<div class="${classes.cornerHandle} ${cursorClass}"></div>`,
  });
}

// corner handles, indexed 0 = SW, 1 = SE, 2 = NE, 3 = NW
const cornerIcons = [
  cornerIcon(classes.cursorNesw),
  cornerIcon(classes.cursorNwse),
  cornerIcon(classes.cursorNesw),
  cornerIcon(classes.cursorNwse),
];

const sideIconH = divIcon({
  iconSize: [22, 10],
  iconAnchor: [11, 5],
  className: '',
  html: `<div class="${classes.sideHandleH}"></div>`,
});

const sideIconV = divIcon({
  iconSize: [10, 22],
  iconAnchor: [5, 11],
  className: '',
  html: `<div class="${classes.sideHandleV}"></div>`,
});

const moveIcon = divIcon({
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: '',
  html: `<div class="${classes.moveHandle}">${'<span></span>'.repeat(9)}</div>`,
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

  // edge midpoints as [lat, lng]; index drives which single edge a handle moves
  // 0 = S, 1 = E, 2 = N, 3 = W
  const sides: { position: [number, number]; icon: typeof sideIconH }[] = [
    { position: [s, (w + e) / 2], icon: sideIconH },
    { position: [(s + n) / 2, e], icon: sideIconV },
    { position: [n, (w + e) / 2], icon: sideIconH },
    { position: [(s + n) / 2, w], icon: sideIconV },
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

  function moveSide(index: number, lat: number, lng: number) {
    const nb = [...box] as Bbox;

    if (index === 0) {
      nb[1] = lat;
    } else if (index === 1) {
      nb[2] = lng;
    } else if (index === 2) {
      nb[3] = lat;
    } else {
      nb[0] = lng;
    }

    dispatch(mapAreaSetSelecting(nb));
  }

  return (
    <>
      {/* dedicated pane below fm-active-overlay (800) so the handle markers in
          fm-active-overlay always stack above the rectangle */}
      <Pane name="fm-area-rect" style={{ zIndex: 799 }} />

      <Rectangle
        pane="fm-area-rect"
        bounds={[
          [s, w],
          [n, e],
        ]}
        interactive={false}
        pathOptions={{ color: '#3388ff', weight: 2, fillOpacity: 0.15 }}
      />

      {sides.map(({ position: [lat, lng], icon }, index) => (
        <Marker
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          draggable
          pane="fm-active-overlay"
          position={{ lat, lng }}
          icon={icon}
          eventHandlers={{
            dragstart: preventMapClick,
            drag(e: LeafletEvent) {
              const c = e.target.getLatLng();

              moveSide(index, c.lat, c.lng);
            },
            dragend(e: LeafletEvent) {
              const c = e.target.getLatLng();

              moveSide(index, c.lat, c.lng);

              preventMapClick();
            },
          }}
        />
      ))}

      {corners.map(([lat, lng], index) => (
        <Marker
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          draggable
          pane="fm-active-overlay"
          position={{ lat, lng }}
          icon={cornerIcons[index]}
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
        pane="fm-active-overlay"
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

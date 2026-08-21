import { makeBeamIcon } from '@shared/beamIcon.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import type {
  LatLngLiteral,
  LeafletEvent,
  Marker as LeafletMarker,
  PathOptions,
} from 'leaflet';
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { FaCrosshairs, FaEye } from 'react-icons/fa';
import { Marker, Polyline, useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaMoveViewpoint } from '../model/actions.js';
import { usePanoramaHover, usePanoramaView } from '../viewStore.js';

const WEDGE_SIZE = 240;

const WEDGE_RADIUS = 110;

/**
 * The line of sight a reading was taken along. Thin and dashed so it reads as a
 * sight line rather than as a route someone drew, and in the viewpoint marker's
 * own colour so the pair belong together.
 */
const SIGHT_LINE = {
  color: COLORS.normal,
  weight: 1.5,
  opacity: 0.75,
  dashArray: '5 5',
};

const SIGHT_LINE_HOVER = { ...SIGHT_LINE, weight: 1, opacity: 0.4 };

/**
 * The slice of horizon the viewer currently holds, drawn from the viewpoint —
 * screen-sized rather than ground-sized, since it says which way one is
 * looking, not how far one can see. In the viewpoint marker's own colour, so it
 * is never mistaken for the located heading beam.
 */
const makeWedgeIcon = (fov: number) =>
  makeBeamIcon({
    halfAngle: fov / 2,
    size: WEDGE_SIZE,
    radius: WEDGE_RADIUS,
    color: COLORS.normal,
    innerStop: 0.1,
    innerOpacity: 0.55,
    gradientId: 'fm-panorama-wedge',
  });

/**
 * Where the panorama is taken from, which way it is looking, and where a press
 * in the picture landed.
 *
 * Dragging the viewpoint doesn't render: it says where the next one goes, and
 * the toolbar's Update button pays for it.
 */
export default function PanoramaResult(): ReactElement | null {
  const dispatch = useDispatch();

  const viewpoint = useAppSelector((state) => state.panorama.viewpoint);

  const probe = useAppSelector((state) => state.panorama.probe);

  const view = usePanoramaView();

  const hover = usePanoramaHover();

  const map = useMap();

  const wedgeRef = useRef<LeafletMarker | null>(null);

  // A ridge picked out of the picture can be tens of kilometres off and land
  // outside the map entirely, where a mark helps nobody. Panned the least
  // amount that brings it in rather than centred on it: centring would throw
  // the viewpoint — the other end of what is being read — off the screen.
  useEffect(() => {
    if (probe) {
      map.panInside([probe.lat, probe.lon], { padding: [40, 40] });
    }
  }, [probe, map]);

  const handleDragEnd = useCallback(
    (e: LeafletEvent) => {
      const { lat, lng } = (e.target as LeafletMarker).getLatLng();

      dispatch(panoramaMoveViewpoint({ lat, lon: lng }));
    },
    [dispatch],
  );

  // Only the width is geometry; the bearing is a rotation. Rounded, because two
  // fields of view a fraction of a degree apart draw the same wedge and
  // rebuilding the icon rewrites the element's markup.
  const fov = view === null ? null : Math.round(view.fov);

  const wedgeIcon = useMemo(
    () => (fov === null ? null : makeWedgeIcon(fov)),
    [fov],
  );

  const position = useMemo(
    () => viewpoint && { lat: viewpoint.lat, lng: viewpoint.lon },
    [viewpoint],
  );

  // Turned by mutating the element rather than by rebuilding the icon, which
  // would replace the DOM node on every frame of a pan. A rebuilt icon brings a
  // fresh element pointing north, but only a changed `view` can cause one, so
  // that alone is enough to turn it back.
  useEffect(() => {
    const wrapper = wedgeRef.current?.getElement()?.firstElementChild;

    if (wrapper instanceof HTMLElement && view) {
      wrapper.style.transform = `rotate(${view.azimuth.toFixed(1)}deg)`;
    }
  }, [view]);

  return !position ? null : (
    <>
      {wedgeIcon && (
        <Marker
          ref={wedgeRef}
          position={position}
          icon={wedgeIcon}
          interactive={false}
          keyboard={false}
          // Under the pin it points from, which is what one grabs.
          zIndexOffset={-1000}
        />
      )}

      {/* An eye, not a summit: it marks where one stands and looks from, which
          is as often a saddle or a road as a peak. */}
      <RichMarker
        position={position}
        draggable
        eventHandlers={{ dragend: handleDragEnd }}
        faIcon={<FaEye />}
      />

      {/* What the pointer is resting on, faded: it follows every mouse move, so
          it says "this is what you are looking at" without claiming to be a
          mark anyone made. The press is what leaves the solid one.

          Each carries a line back to the viewpoint — the line of sight the
          reading was taken along, which is what says the mark belongs to this
          panorama rather than being some other pin on the map. */}
      {hover && (
        <SightMark
          from={position}
          at={hover}
          pathOptions={SIGHT_LINE_HOVER}
          opacity={0.65}
        />
      )}

      {probe && (
        <SightMark from={position} at={probe} pathOptions={SIGHT_LINE} />
      )}
    </>
  );
}

function SightMark({
  from,
  at,
  pathOptions,
  opacity,
}: {
  from: LatLngLiteral;
  at: LatLon;
  pathOptions: PathOptions;
  opacity?: number;
}): ReactElement {
  const to = { lat: at.lat, lng: at.lon };

  return (
    <>
      <Polyline
        positions={[from, to]}
        interactive={false}
        pathOptions={pathOptions}
      />

      <RichMarker
        position={to}
        interactive={false}
        opacity={opacity}
        faIcon={<FaCrosshairs />}
      />
    </>
  );
}

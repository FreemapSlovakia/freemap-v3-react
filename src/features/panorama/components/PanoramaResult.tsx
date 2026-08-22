import { useMessages } from '@features/l10n/l10nInjector.js';
import { makeBeamIcon } from '@shared/beamIcon.js';
import { COLORS } from '@shared/colors.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { LatLon } from '@shared/types/common.js';
import type {
  LatLngLiteral,
  LeafletEvent,
  Marker as LeafletMarker,
  PathOptions,
} from 'leaflet';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaCrosshairs, FaEye } from 'react-icons/fa';
import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaMoveViewpoint } from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import { usePanoramaHover, usePanoramaView } from '../viewStore.js';
import { PanoramaProbeReadout } from './PanoramaProbeReadout.js';

const WEDGE_SIZE = 240;

const WEDGE_RADIUS = 110;

/** How near the edge a mark may sit and still count as on screen. */
const PAN_MARGIN_PX = 40;

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

  const m = usePanoramaMessages();

  const gm = useMessages();

  // Plain, not the `meter` unit style: `general.masl` follows it and says both
  // the unit and what it is measured from.
  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  const viewpoint = useAppSelector((state) => state.panorama.viewpoint);

  const probe = useAppSelector((state) => state.panorama.probe);

  const render = useAppSelector((state) => state.panorama.render);

  const view = usePanoramaView();

  const hover = usePanoramaHover();

  const map = useMap();

  const wedgeRef = useRef<LeafletMarker | null>(null);

  // A ridge picked out of the picture can be tens of kilometres off and land
  // outside the map entirely, where a mark helps nobody. A mark already on
  // screen is left where it is — moving the map under someone who can see what
  // they asked for is the rudest thing this could do — and one that isn't is
  // centred, which is where the eye goes looking for it.
  useEffect(() => {
    if (!probe) {
      return;
    }

    const at = map.latLngToContainerPoint([probe.lat, probe.lon]);

    const size = map.getSize();

    if (
      at.x < PAN_MARGIN_PX ||
      at.y < PAN_MARGIN_PX ||
      at.x > size.x - PAN_MARGIN_PX ||
      at.y > size.y - PAN_MARGIN_PX
    ) {
      map.panTo([probe.lat, probe.lon]);
    }
  }, [probe, map]);

  // Only safe to re-render inside the gesture because `RichMarker` keeps the
  // icon it has where nothing changed: rebuilding one reaches Leaflet's
  // `setIcon`, which replaces the drag handler and drops the gesture with it.
  const [dragging, setDragging] = useState(false);

  const handleDragStart = useCallback(() => setDragging(true), []);

  const handleDragEnd = useCallback(
    (e: LeafletEvent) => {
      setDragging(false);

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

  // What everything read out of the picture is measured from — not the pin,
  // which may since have been dragged somewhere the picture never saw.
  const sightFrom = useMemo(
    () => render && { lat: render.viewpoint.lat, lng: render.viewpoint.lon },
    [render],
  );

  // Whether the pin still stands where the picture was taken from; dragging it
  // stages a new place without rendering. The viewpoint alone is compared, not
  // the whole render key: reframing or changing the tier makes another picture
  // of the same spot.
  const atRenderedViewpoint =
    render !== null &&
    viewpoint !== null &&
    render.viewpoint.lat === viewpoint.lat &&
    render.viewpoint.lon === viewpoint.lon;

  // The render answers the eye's elevation for the place it was taken from, so
  // there is nothing to ask the elevation API for — and nothing to gate on the
  // account, since the service already clamped what it would give this one.
  const eyeElevation = atRenderedViewpoint ? render.eyeElevation : null;

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
      {wedgeIcon && sightFrom && (
        <Marker
          ref={wedgeRef}
          position={sightFrom}
          icon={wedgeIcon}
          interactive={false}
          keyboard={false}
          // Under the eye it points from, which is what one grabs.
          zIndexOffset={-1000}
        />
      )}

      {/* Where the picture was taken from, while the pin is elsewhere: faded,
          so it reads as the place the readings come from rather than as a
          second viewpoint, and something for the cone and the lines to stand
          on. It keeps the render's eye elevation, still true of that place. */}
      {(dragging || !atRenderedViewpoint) && sightFrom && (
        <RichMarker
          position={sightFrom}
          opacity={0.45}
          draggable={false}
          // Under the live pin, for a drag that ends up nearly back where it began.
          zIndexOffset={-500}
          faIcon={<FaEye />}
        >
          {render && (
            <Tooltip direction="top">
              {m?.eyeElevation}: {nfEle.format(render.eyeElevation)}{' '}
              {gm?.general.masl}
            </Tooltip>
          )}
        </RichMarker>
      )}

      {/* An eye, not a summit: it marks where one stands and looks from, which
          is as often a saddle or a road as a peak. */}
      <RichMarker
        position={position}
        draggable
        eventHandlers={{
          dragstart: handleDragStart,
          dragend: handleDragEnd,
        }}
        faIcon={<FaEye />}
      >
        {eyeElevation === null ? null : (
          <Tooltip direction="top">
            {m?.eyeElevation}: {nfEle.format(eyeElevation)} {gm?.general.masl}
          </Tooltip>
        )}
      </RichMarker>

      {/* What the pointer is resting on, faded: it follows every mouse move, so
          it says "this is what you are looking at" without claiming to be a
          mark anyone made. The press is what leaves the solid one.

          Each carries a line back to where the picture was taken from — the
          line of sight the reading was taken along. To the render, not to the
          pin: a line from a dragged pin crosses country nobody measured. */}
      {hover && sightFrom && (
        <SightMark
          from={sightFrom}
          at={hover}
          pathOptions={SIGHT_LINE_HOVER}
          opacity={0.65}
        />
      )}

      {probe && sightFrom && (
        <SightMark
          from={sightFrom}
          at={probe}
          pathOptions={SIGHT_LINE}
          // A press on the bare terrain has no name to give, but the two
          // figures are read off the picture either way — which is the whole
          // of what such a press asked.
          tooltip={<PanoramaProbeReadout probe={probe} />}
        />
      )}
    </>
  );
}

function SightMark({
  from,
  at,
  pathOptions,
  opacity,
  tooltip,
}: {
  from: LatLngLiteral;
  at: LatLon;
  pathOptions: PathOptions;
  opacity?: number;
  tooltip?: ReactNode;
}): ReactElement {
  const to = { lat: at.lat, lng: at.lon };

  return (
    <>
      <Polyline
        positions={[from, to]}
        interactive={false}
        pathOptions={pathOptions}
      />

      {/* Interactive only where there is something to say: an inert mark lets a
          click through to the map, which under this tool means picking a new
          viewpoint — and nobody presses a pin meaning to move house. */}
      <RichMarker
        position={to}
        interactive={Boolean(tooltip)}
        opacity={opacity}
        faIcon={<FaCrosshairs />}
      >
        {/* Above the pin, which points down at the place it marks — a tooltip
            below it would sit on the very ground being named. */}
        {tooltip ? <Tooltip direction="top">{tooltip}</Tooltip> : null}
      </RichMarker>
    </>
  );
}

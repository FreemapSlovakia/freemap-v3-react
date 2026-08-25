import { makeBeamIcon } from '@shared/beamIcon.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import {
  GhostViewpointMarker,
  useStagedViewpoint,
  ViewpointElevationTooltip,
} from '@shared/components/ViewpointMarkers.js';
import { bearingTo, sameLatLon, toLatLng } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import {
  DomEvent,
  type LatLngLiteral,
  type LeafletEvent,
  type Marker as LeafletMarker,
  type PathOptions,
} from 'leaflet';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { FaCrosshairs, FaStreetView } from 'react-icons/fa';
import {
  Marker,
  type MarkerProps,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { panoramaGroundInk } from '../gradient.js';
import {
  panoramaLookAt,
  panoramaMoveViewpoint,
  panoramaSetAzimuth,
  panoramaSetSettings,
} from '../model/actions.js';
import { readTowards } from '../ray.js';
import {
  setPanoramaAim,
  usePanoramaAim,
  usePanoramaHover,
  usePanoramaView,
} from '../viewStore.js';
import { PanoramaProbeReadout, readoutOf } from './PanoramaProbeReadout.js';

const WEDGE_SIZE = 240;

const WEDGE_RADIUS = 110;

/** How near the edge a mark may sit and still count as on screen. */
const PAN_MARGIN_PX = 40;

/** Travel that tells a swing of the wedge from a press through it. */
const CLICK_SLOP_PX = 3;

/**
 * The line of sight a reading was taken along. Thin and dashed so it reads as a
 * sight line rather than as a route someone drew, and in the mark colour like
 * everything else here.
 */
const sightLine = (color: string): PathOptions => ({
  color,
  weight: 1.5,
  opacity: 0.75,
  dashArray: '5 5',
});

/**
 * The slice of horizon the viewer currently holds, drawn from the viewpoint —
 * screen-sized rather than ground-sized, since it says which way one is
 * looking, not how far one can see. Its colour is what keeps it from being
 * mistaken for the located heading beam.
 */
const makeWedgeIcon = (fov: number, color: string) =>
  makeBeamIcon({
    halfAngle: fov / 2,
    size: WEDGE_SIZE,
    radius: WEDGE_RADIUS,
    color,
    innerStop: 0.1,
    innerOpacity: 0.55,
    gradientId: 'fm-panorama-wedge',
    grabbable: true,
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

  const render = useAppSelector((state) => state.panorama.render);

  // Everything drawn here — the eye, the wedge, the sight lines and the marks
  // they end at — is inked in the picture's own near-ground colour, so the map
  // says which panorama it belongs to.
  const markColor = useAppSelector((state) =>
    panoramaGroundInk(
      state.panoramaSettings.groundColor,
      state.panoramaSettings.groundGradient,
    ),
  );

  const view = usePanoramaView();

  const aim = usePanoramaAim();

  const hover = usePanoramaHover();

  const map = useMap();

  const wedgeRef = useRef<LeafletMarker | null>(null);

  /** Whether the swing that just ended owes the map a click it must not get. */
  const swungRef = useRef(false);

  // Read in the gesture rather than subscribed to: the handler is attached once
  // per icon, and re-attaching it on a setting nobody pressed would drop a
  // swing in flight.
  const autoPan = useAppSelector((state) => state.panoramaSettings.autoPan);

  const autoPanRef = useRef(autoPan);

  autoPanRef.current = autoPan;

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

  const { dragging, handlers } = useStagedViewpoint(
    useCallback((at) => dispatch(panoramaMoveViewpoint(at)), [dispatch]),
  );

  /** What the mark reads as: the drag's own figures, or the store's. */
  const readout = readoutOf(aim, probe);

  // A gesture is what clears the aim, so anything that ends one without its own
  // end — the map features going with the tool — would leave the viewer aimed
  // by a hand that is no longer there.
  useEffect(() => () => setPanoramaAim(null), []);

  // Only the width is geometry; the bearing is a rotation. Rounded, because two
  // fields of view a fraction of a degree apart draw the same wedge and
  // rebuilding the icon rewrites the element's markup.
  const fov = view === null ? null : Math.round(view.fov);

  const wedgeIcon = useMemo(
    () => (fov === null ? null : makeWedgeIcon(fov, markColor)),
    [fov, markColor],
  );

  const sight = useMemo(() => sightLine(markColor), [markColor]);

  const sightHover = useMemo(
    () => ({ ...sight, weight: 1, opacity: 0.4 }),
    [sight],
  );

  const position = useMemo(() => viewpoint && toLatLng(viewpoint), [viewpoint]);

  // What everything read out of the picture is measured from — not the pin,
  // which may since have been dragged somewhere the picture never saw.
  const sightFrom = useMemo(
    () => render && toLatLng(render.viewpoint),
    [render],
  );

  // Dragging the mark asks what is over there, the way swinging the wedge does
  // — the bearing goes through `viewStore` frame by frame and only the drop
  // reaches the store, where `panoramaLookAt` takes the reading and moves the
  // mark to whatever the picture can actually see along that line.
  const markHandlers = useMemo(
    () => ({
      dragstart: () => {
        // A view turning by itself would take the bearing away as it is set.
        if (autoPanRef.current) {
          dispatch(panoramaSetSettings({ autoPan: false }));
        }
      },

      drag: (e: LeafletEvent) => {
        if (!render) {
          return;
        }

        const { lat, lng } = (e.target as LeafletMarker).getLatLng();

        const at = { lat, lon: lng };

        const { azimuth, distance, seen } = readTowards(render, at);

        // Only where the picture can see the place: the two figures are true of
        // the map wherever the mark is, but a dot on the terrain would claim a
        // view of ground a ridge hides.
        setPanoramaAim({
          azimuth,
          mark: {
            at,
            distance,
            seen: seen?.visible ? { iy: seen.iy, ele: seen.ele } : null,
          },
        });
      },

      dragend: (e: LeafletEvent) => {
        const { lat, lng } = (e.target as LeafletMarker).getLatLng();

        setPanoramaAim(null);

        dispatch(panoramaLookAt({ lat, lon: lng }));
      },
    }),
    [dispatch, render],
  );

  // Whether the pin still stands where the picture was taken from; dragging it
  // stages a new place without rendering. The viewpoint alone is compared, not
  // the whole render key: reframing or changing the tier makes another picture
  // of the same spot.
  const atRenderedViewpoint =
    render !== null &&
    viewpoint !== null &&
    sameLatLon(render.viewpoint, viewpoint);

  // The render answers the eye's elevation for the place it was taken from, so
  // there is nothing to ask the elevation API for — and nothing to gate on the
  // account, since the service already clamped what it would give this one.
  const eyeElevation = atRenderedViewpoint ? render.eyeElevation : null;

  // Turned by mutating the element rather than by rebuilding the icon, which
  // would replace the DOM node on every frame of a pan. A rebuilt icon does
  // bring a fresh element pointing north — a changed field of view, or the
  // ground colour the mark takes from the settings — so the icon itself is a
  // reason to turn it back.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a rebuilt icon is a fresh element pointing north
  useEffect(() => {
    const wrapper = wedgeRef.current?.getElement()?.firstElementChild;

    const azimuth = aim?.azimuth ?? view?.azimuth;

    if (wrapper instanceof HTMLElement && azimuth !== undefined) {
      wrapper.style.transform = `rotate(${azimuth.toFixed(1)}deg)`;
    }
  }, [view, aim, wedgeIcon]);

  // Swinging the wedge turns the viewer, which is the map's way of asking what
  // is over there — the panel stays open and answers as the wedge moves, so
  // nothing has to be hidden and no tool loses its click.
  //
  // The bearing goes through `viewStore` frame by frame and reaches the store
  // only when the gesture ends: every dispatch writes the persisted state and
  // rewrites the URL. Listeners on the element itself, with the pointer
  // captured, so a swing that runs off the wedge — which it always does —
  // keeps being followed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a rebuilt icon is a new element to listen on
  useEffect(() => {
    const el = wedgeRef.current?.getElement();

    const from = sightFrom;

    if (!el || !from) {
      return;
    }

    // The map starts its own pan from `mousedown` (and `touchstart`), which a
    // stopped `pointerdown` never reaches — the browser fires both. Those two
    // alone: `disableClickPropagation` would take the click as well, and a
    // press on the wedge is a press on the map under every mode that wants one
    // — the picking modes, the route planner, the drawing tools, the context
    // menu — with the wedge standing over the very ground being pointed at.
    const stopStart = (e: Event) => DomEvent.stopPropagation(e);

    // Except the click a swing ends with, which nobody aimed anywhere. Cleared
    // by the press that follows, so a swing whose click never comes cannot
    // swallow a later one.
    const swallowSwungClick = (e: MouseEvent) => {
      if (swungRef.current) {
        swungRef.current = false;

        DomEvent.stop(e);
      }
    };

    const bearing = (e: PointerEvent) => {
      const { lat, lng } = map.mouseEventToLatLng(e);

      return bearingTo({ lat: from.lat, lon: from.lng }, { lat, lon: lng });
    };

    const handleDown = (e: PointerEvent) => {
      // Neither the map's pan nor the picture's own gestures: this one is the
      // wedge's, from press to release.
      e.preventDefault();

      e.stopPropagation();

      swungRef.current = false;

      const startedAt = { x: e.clientX, y: e.clientY };

      el.setPointerCapture(e.pointerId);

      // A view turning by itself would fight the swing, and would take the
      // aimed bearing away the moment it was let go — the same reason a drag
      // in the picture stops it.
      if (autoPanRef.current) {
        dispatch(panoramaSetSettings({ autoPan: false }));
      }

      // A bearing and nothing else: the swing says which way to look, not what
      // to look at, so there is no place in it to mark.
      const handleMove = (move: PointerEvent) =>
        setPanoramaAim({ azimuth: bearing(move), mark: null });

      const handleUp = (up: PointerEvent) => {
        el.removeEventListener('pointermove', handleMove);

        el.removeEventListener('pointerup', handleUp);

        el.removeEventListener('pointercancel', handleUp);

        setPanoramaAim(null);

        // A press that went nowhere is a press on the map, and is left to be
        // one; only a swing turns the view and eats its own click.
        if (
          Math.abs(up.clientX - startedAt.x) > CLICK_SLOP_PX ||
          Math.abs(up.clientY - startedAt.y) > CLICK_SLOP_PX
        ) {
          swungRef.current = true;

          dispatch(panoramaSetAzimuth(bearing(up)));
        }
      };

      el.addEventListener('pointermove', handleMove);

      el.addEventListener('pointerup', handleUp);

      el.addEventListener('pointercancel', handleUp);
    };

    el.addEventListener('pointerdown', handleDown);

    el.addEventListener('mousedown', stopStart);

    el.addEventListener('touchstart', stopStart);

    el.addEventListener('click', swallowSwungClick, true);

    return () => {
      el.removeEventListener('pointerdown', handleDown);

      el.removeEventListener('mousedown', stopStart);

      el.removeEventListener('touchstart', stopStart);

      el.removeEventListener('click', swallowSwungClick, true);
    };
  }, [dispatch, map, sightFrom, wedgeIcon]);

  return !position ? null : (
    <>
      {wedgeIcon && sightFrom && (
        <Marker
          ref={wedgeRef}
          position={sightFrom}
          icon={wedgeIcon}
          // Not Leaflet's interactivity, which would give the marker's whole
          // 240 px square pointer events and swallow every press near the
          // viewpoint. Left inert, its icon keeps Leaflet's `pointer-events:
          // none`, and the one shape that asks for them — the grab wedge — is
          // hit through it; the presses still bubble to the element the
          // listeners sit on, which no `pointer-events` can stop.
          interactive={false}
          keyboard={false}
          // Under the eye it stands on: the eye is dragged to move house, the
          // wedge is swung to look elsewhere, and the apex is where they meet.
          zIndexOffset={-1000}
        />
      )}

      {/* Where the picture was taken from, while the pin is elsewhere: faded,
          so it reads as the place the readings come from rather than as a
          second viewpoint, and something for the cone and the lines to stand
          on. It keeps the render's eye elevation, still true of that place. */}
      {(dragging || !atRenderedViewpoint) && sightFrom && render && (
        <GhostViewpointMarker
          position={sightFrom}
          color={markColor}
          faIcon={<FaStreetView />}
          elevation={render.eyeElevation}
        />
      )}

      {/* An eye, not a summit: it marks where one stands and looks from, which
          is as often a saddle or a road as a peak. */}
      <RichMarker
        position={position}
        color={markColor}
        draggable
        eventHandlers={handlers}
        faIcon={<FaStreetView />}
      >
        {eyeElevation === null ? null : (
          <ViewpointElevationTooltip elevation={eyeElevation} />
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
          color={markColor}
          pathOptions={sightHover}
          opacity={0.65}
        />
      )}

      {probe && sightFrom && (
        <SightMark
          from={sightFrom}
          // Where the drag has it, so the line of sight follows the mark rather
          // than staying behind on the place it was let go of last.
          at={aim?.mark?.at ?? probe}
          color={markColor}
          pathOptions={sight}
          // Dragged, it looks elsewhere: the view turns to it as it moves and
          // the reading is taken again where it is dropped. `panoramaLookAt`
          // may put it back somewhere else — a place the picture cannot see is
          // moved to the ridge that hides it.
          draggable
          eventHandlers={markHandlers}
          // A press on the bare terrain has no name to give, but the two
          // figures are read off the picture either way — which is the whole
          // of what such a press asked. Under a drag they are of where the mark
          // is now, seen from the viewpoint or not: both are true of the map,
          // and a tooltip taken away mid-drag never comes back, Leaflet opening
          // one on a hover that has already happened.
          tooltip={readout && <PanoramaProbeReadout probe={readout} />}
        />
      )}
    </>
  );
}

function SightMark({
  from,
  at,
  color,
  pathOptions,
  opacity,
  tooltip,
  draggable,
  eventHandlers,
}: {
  from: LatLngLiteral;
  at: LatLon;
  color: string;
  pathOptions: PathOptions;
  opacity?: number;
  tooltip?: ReactNode;
  /** The mark is dragged to look elsewhere; see `PanoramaResult`. */
  draggable?: boolean;
  eventHandlers?: MarkerProps['eventHandlers'];
}): ReactElement {
  const to = { lat: at.lat, lng: at.lon };

  return (
    <>
      <Polyline
        positions={[from, to]}
        interactive={false}
        pathOptions={pathOptions}
      />

      {/* Interactive only where there is something to say or to do: an inert
          mark lets a click through to the map, which under this tool means
          picking a new viewpoint — and nobody presses a pin meaning to move
          house. A draggable one counts, and counts throughout: taking it away
          reaches `marker.dragging.disable()` and drops the gesture in flight,
          which is not something an emptied tooltip may do. */}
      <RichMarker
        position={to}
        color={color}
        interactive={Boolean(tooltip) || Boolean(draggable)}
        draggable={draggable}
        eventHandlers={eventHandlers}
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

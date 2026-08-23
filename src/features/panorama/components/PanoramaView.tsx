import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  isCompassSupported,
  subscribeCompass,
} from '@features/location/compass.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { angleDiff, clamp, mod } from '@shared/mathUtils.js';
import type { LatLon } from '@shared/types/common.js';
import destination from '@turf/destination';
import clsx from 'clsx';
import {
  Fragment,
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { distanceAt } from '../depth.js';
import { hazeCutoffM, rankLabels } from '../labels/fromPeaks.js';
import {
  type LabelAnchor,
  type LabelPlacement,
  layoutLabels,
  thinLabels,
} from '../labels/layout.js';
import type { PanoramaLabel } from '../labels/types.js';
import {
  panoramaSetAzimuth,
  panoramaSetProbe,
  panoramaSetSettings,
} from '../model/actions.js';
import type { PanoramaRenderInfo } from '../model/reducer.js';
import { labelLayoutLimits } from '../model/settingsReducer.js';
import type { PanoramaRenderData } from '../renderHolder.js';
import { setPanoramaHover, setPanoramaView } from '../viewStore.js';
import classes from './Panorama.module.css';

/** Matches `.label` in the stylesheet, which is what `measure` measures. */
const LABEL_FONT = '12px sans-serif';

const LINE_HEIGHT = 16;

/**
 * Shortest leader drawn. Long enough to read as a line pointing at something
 * rather than as a tick under the text, which is the whole job it has when
 * several names stand over one stretch of skyline.
 */
const MIN_LEADER = 16;

/** Matches `.compass`, whose strip the labels are kept out of. */
const COMPASS_HEIGHT = 24;

/** A full turn in a minute, which reads as looking around rather than spinning. */
const AUTO_PAN_DEG_PER_S = 6;

/**
 * Roughly how long the view takes to close on where the phone points. Long
 * enough that a magnetometer's jitter reads as a still picture rather than a
 * shiver, short enough that turning to look at something arrives with the turn.
 */
const COMPASS_EASE_MS = 200;

/**
 * A magnetometer streams whether or not the device moves, so silence means the
 * sensor died or the permission went — at which point turning by itself is a
 * better answer than a picture frozen at the last bearing it heard.
 */
const COMPASS_STALE_MS = 3000;

/** Farther than this in a press and it was a drag, not a click. */
const CLICK_SLOP_PX = 4;

/** Room the distance readout needs before it has to flip to the other side. */
const READOUT_CLEARANCE_PX = 90;

/** How far in the view may go, whatever resolution the picture has. */
const MAX_ZOOM = 8;

/** How far left of the view a wrapped label may sit and still be worth drawing. */
const WRAP_MARGIN_PX = 200;

/** How still the turning must be before the bearing is written down. */
const SETTLE_MS = 500;

/**
 * The picked name, its leader and its dot. The marker's red lightened: the pin
 * sits on a map, this sits on forest and rock under a black shadow, where
 * `COLORS.normal` is too dark to read. Near enough to say "the same summit",
 * far enough to be legible.
 */
const PICKED_INK = '#ff6a6a';

/** Where a bearing and a distance from the viewpoint land on the ground. */
function groundPoint(
  viewpoint: LatLon,
  azimuth: number,
  distance: number,
): LatLon {
  const [lon, lat] = destination(
    [viewpoint.lon, viewpoint.lat],
    distance,
    azimuth,
    { units: 'meters' },
  ).geometry.coordinates as [number, number];

  return { lat, lon };
}

let measureCtx: CanvasRenderingContext2D | null | undefined;

/**
 * Cached across renders: the font never changes, so a name measures the same
 * for as long as the page lives, and the layout runs on every frame of a pan
 * over the better part of a thousand of them.
 */
const measured = new Map<string, number>();

function measureText(text: string): number {
  const hit = measured.get(text);

  if (hit !== undefined) {
    return hit;
  }

  if (measureCtx === undefined) {
    measureCtx = document.createElement('canvas').getContext('2d');

    if (measureCtx) {
      measureCtx.font = LABEL_FONT;
    }
  }

  // Roughly what the font comes out at, for a browser that gave us no context.
  const width = measureCtx?.measureText(text).width ?? text.length * 6.5;

  measured.set(text, width);

  return width;
}

/** A distance read off the picture, as a bearing and an image row. */
type HoverReading = { az: number; iy: number; distance: number };

/**
 * The reading a sample carries, or `null` where it hit sky. Held as bearing and
 * row rather than as the pixel it was taken at, so it stays over its own
 * terrain while the view turns — which a press-set one has to survive.
 */
function hoverReading(sample: {
  az: number;
  iy: number;
  ground: { distance: number } | null;
}): HoverReading | null {
  return (
    sample.ground && {
      az: sample.az,
      iy: sample.iy,
      distance: sample.ground.distance,
    }
  );
}

type Props = {
  render: PanoramaRenderInfo;
  data: PanoramaRenderData;
  width: number;
  height: number;
};

export function PanoramaView({
  render,
  data,
  width,
  height,
}: Props): ReactElement {
  const gm = useMessages();

  const dispatch = useDispatch();

  const settings = useAppSelector((state) => state.panoramaSettings);

  const language = useAppSelector((state) => state.l10n.language);

  const storedAzimuth = useAppSelector((state) => state.panorama.azimuth);

  /** Which name is picked, if the mark on the map came from one. */
  const pickedId = useAppSelector(
    (state) => state.panorama.probe?.peak?.id ?? null,
  );

  // The bearing lives here frame by frame and reaches the store once the
  // turning settles — every action writes the persisted state to localStorage,
  // so dispatching per frame would be sixty writes a second. Seeded from the
  // store, which is what a reloaded `panorama-az=` restores.
  const [azimuth, setAzimuth] = useState(storedAzimuth);

  const [zoom, setZoom] = useState(1);

  const [offsetY, setOffsetY] = useState(0);

  const [dragging, setDragging] = useState(false);

  const [hover, setHover] = useState<HoverReading | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);

  const nfDeg = useNumberFormat({
    style: 'unit',
    unit: 'degree',
    unitDisplay: 'narrow',
    maximumFractionDigits: 0,
  });

  // The whole altitude band fits the panel to begin with. Zooming past the
  // image's own pixels magnifies rather than reveals, but it is still worth
  // having: it spreads a crowded skyline out, which brings more names with it,
  // and it is how one aims at a particular ridge. So the floor is a fixed
  // magnification, raised where the image has pixels the panel isn't showing.
  //
  // Never smaller than what makes one full turn fill the width, either: below
  // that the background repeats and the same ridge is on screen twice, while
  // the names and the compass — which have one place per bearing — cover only
  // the first copy. A wide, low panel therefore shows the whole turn and
  // scrolls vertically instead.
  const fitScale =
    height > 0 ? Math.max(height / render.height, width / render.width) : 1;

  const maxZoom = Math.max(MAX_ZOOM, 1 / fitScale);

  const scale = fitScale * clamp(zoom, 1, maxZoom);

  const degPerPx = render.stepDeg / scale;

  const spanPx = 360 / degPerPx;

  const azLeft = azimuth - (width * degPerPx) / 2;

  const maxOffsetY = Math.max(0, render.height - height / scale);

  const clampedOffsetY = Math.min(offsetY, maxOffsetY);

  /** Where a bearing lands in the viewport, taking the 360° wrap either way. */
  const screenX = useCallback(
    (az: number): number => {
      const x = mod(az - azLeft, 360) / degPerPx;

      // Only what falls off the right edge is worth looking for on the left,
      // and only when the wrap brings it back within reach of the view. Testing
      // the turn's width instead would move everything at once wherever one
      // turn barely fills the panel — which is precisely the case a wide, low
      // panel is in.
      return x > width && x - spanPx > -WRAP_MARGIN_PX ? x - spanPx : x;
    },
    [azLeft, degPerPx, spanPx, width],
  );

  // What was last written down, so a bearing arriving from outside can be told
  // from this component's own echo of it coming back.
  const writtenRef = useRef(storedAzimuth);

  useEffect(() => {
    const timer = setTimeout(() => {
      writtenRef.current = azimuth;

      dispatch(panoramaSetAzimuth(azimuth));
    }, SETTLE_MS);

    return () => clearTimeout(timer);
  }, [azimuth, dispatch]);

  // A bearing set from the URL — a reload, or stepping through the history —
  // turns the view. Ignoring what this component itself wrote is what keeps a
  // settle mid-drag from snapping the picture back to where it was half a
  // second ago.
  useEffect(() => {
    if (Math.round(storedAzimuth) !== Math.round(writtenRef.current)) {
      writtenRef.current = storedAzimuth;

      setAzimuth(storedAzimuth);
    }
  }, [storedAzimuth]);

  // A reading belongs to the picture it was taken from. `iy` is an image row,
  // and the two passes are not the same height — the preview's rows are a
  // quarter of the detailed one's — so a reading carried across would be put
  // back at the wrong altitude while still claiming the old distance. A new
  // viewpoint is the same story, and the reducer already clears the map's mark
  // for it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the render's identity is the point
  useEffect(() => {
    setHover(null);

    setPanoramaHover(null);
  }, [render.id]);

  // What the map's wedge follows. Its own store rather than Redux: the wedge
  // needs the field of view too, and that is nobody else's business.
  //
  // A hidden panel measures 0 wide — `Main` puts the panels away while a place
  // is being picked — and a zero field of view collapses the wedge to a sliver
  // on the very map being picked on. Keep the last real one.
  useEffect(() => {
    if (width > 0) {
      setPanoramaView({ azimuth, fov: width * degPerPx });
    }
  }, [azimuth, degPerPx, width]);

  // Cleared on the way out only. Clearing it before every re-run instead would
  // leave the store's half-degree threshold nothing to compare against, so
  // every frame would notify twice and the throttle would never fire.
  useEffect(() => () => setPanoramaView(null), []);

  /** Where the device points, as a bearing and when it was last heard. */
  const compassRef = useRef<{ heading: number; at: number } | null>(null);

  // Only while the view is meant to be moving, and only where there is a
  // magnetometer to ask — desktop Chrome exposes the events with nothing behind
  // them. On iOS the readings arrive only after the permission the play button
  // asks for, so until then this stays silent and the view turns by itself.
  useEffect(() => {
    if (!settings.autoPan || !isCompassSupported()) {
      compassRef.current = null;

      return;
    }

    return subscribeCompass(({ heading, at }) => {
      compassRef.current = { heading, at };
    });
  }, [settings.autoPan]);

  // Moves on its own until it is taken over by hand. Where the device can say
  // which way it is pointed the view follows that — a panorama held up at a
  // ridge should be looking at the ridge — and turning at a steady six degrees
  // a second is what to do when nothing knows any better.
  useEffect(() => {
    // `width === 0` says the panel is hidden — `Main` puts them away while a
    // place is being picked. Left running it turns the view at 60 fps into a
    // `display: none` box, re-laying out every peak label each frame, on the
    // phone the user is picking on.
    if (!settings.autoPan || dragging || width === 0) {
      return;
    }

    let raf = 0;

    let last = performance.now();

    const step = (now: number) => {
      const dt = now - last;

      last = now;

      const compass = compassRef.current;

      setAzimuth((a) =>
        compass && now - compass.at < COMPASS_STALE_MS
          ? mod(
              a +
                angleDiff(compass.heading, a) *
                  Math.min(1, dt / COMPASS_EASE_MS),
              360,
            )
          : mod(a + (AUTO_PAN_DEG_PER_S * dt) / 1000, 360),
      );

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [settings.autoPan, dragging, width]);

  // The geometry a zoom has to work back from, kept where an event handler can
  // read it without being torn down and rebuilt on every frame of a pan.
  const geomRef = useRef({
    azimuth,
    zoom,
    offsetY: clampedOffsetY,
    scale,
    degPerPx,
    fitScale,
    maxZoom,
    width,
    height,
    stepDeg: render.stepDeg,
    renderHeight: render.height,
  });

  useEffect(() => {
    geomRef.current = {
      azimuth,
      zoom,
      offsetY: clampedOffsetY,
      scale,
      degPerPx,
      fitScale,
      maxZoom,
      width,
      height,
      stepDeg: render.stepDeg,
      renderHeight: render.height,
    };
  });

  /**
   * Zooms about a point, leaving whatever is under it where it is — the bearing
   * at that column and the image row at that line both come out unmoved, so the
   * view closes in on what was aimed at rather than on the middle of the panel.
   */
  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    const g = geomRef.current;

    const nextZoom = clamp(g.zoom * factor, 1, g.maxZoom);

    if (nextZoom === g.zoom) {
      return;
    }

    const nextScale = g.fitScale * nextZoom;

    const nextDegPerPx = g.stepDeg / nextScale;

    const azAt = g.azimuth + (px - g.width / 2) * g.degPerPx;

    const rowAt = g.offsetY + py / g.scale;

    const nextAzimuth = mod(azAt - (px - g.width / 2) * nextDegPerPx, 360);

    const nextOffsetY = clamp(
      rowAt - py / nextScale,
      0,
      Math.max(0, g.renderHeight - g.height / nextScale),
    );

    // Written back here rather than left to the effect that refreshes it after
    // the commit. A pinch reports several moves per rendered frame, and each
    // one reading the same stale zoom makes the steps overwrite instead of
    // compounding — a wide pinch then zooms only as far as its last pair of
    // events, which is most of the gesture thrown away.
    geomRef.current = {
      ...g,
      zoom: nextZoom,
      scale: nextScale,
      degPerPx: nextDegPerPx,
      azimuth: nextAzimuth,
      offsetY: nextOffsetY,
    };

    setZoom(nextZoom);

    setAzimuth(nextAzimuth);

    setOffsetY(nextOffsetY);
  }, []);

  // Not through React's handler: it registers wheel passively, so the page
  // would scroll as well as the view zooming.
  useEffect(() => {
    const el = viewportRef.current;

    if (!el) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = el.getBoundingClientRect();

      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.deltaY < 0 ? 1.25 : 1 / 1.25,
      );
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());

  /** Distance between the two fingers on the previous move, while pinching. */
  const pinchRef = useRef<number | null>(null);

  const travelRef = useRef(0);

  /** Whether this gesture has already taken the view over. */
  const stoppedRef = useRef(false);

  /** Whether a second finger ever joined, which makes the gesture a pinch. */
  const pinchedRef = useRef(false);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Only the first finger starts a gesture. Zeroing on the second one too
    // would hand a pinch a fresh travel budget, and the lift at the end of it
    // would then read as a press on whatever the last finger was over.
    if (pointers.current.size > 1) {
      pinchedRef.current = true;
    } else {
      travelRef.current = 0;

      stoppedRef.current = false;

      pinchedRef.current = false;
    }

    setDragging(true);
  }, []);

  /**
   * What a pointer is aimed at: where in the panel it is, and where its line of
   * sight meets the terrain — `null` ground for sky, and no sample at all when
   * the render came without a distance buffer.
   */
  const sampleGround = useCallback(
    (e: ReactPointerEvent) => {
      if (!data.depth) {
        return null;
      }

      const rect = e.currentTarget.getBoundingClientRect();

      const px = e.clientX - rect.left;

      const py = e.clientY - rect.top;

      const az = azLeft + px * degPerPx;

      const ix = mod((az - render.azStart) / render.stepDeg, render.width);

      // Clamped off the last row: at the very bottom of the frame `py / scale`
      // lands exactly on the row past the end, which reads as no data at all.
      const iy = Math.min(clampedOffsetY + py / scale, render.height - 0.001);

      const distance = distanceAt(data.depth, ix, iy);

      return {
        // The bearing and the image row, not the pixel they were read at: the
        // picture moves under a readout that outlives the gesture, and these
        // are what put it back over the terrain it measured.
        az,
        iy,
        ground:
          distance === null
            ? null
            : {
                ...groundPoint(render.viewpoint, az, distance),
                distance,
                azimuth: mod(az, 360),
              },
      };
    },
    [
      azLeft,
      clampedOffsetY,
      data.depth,
      degPerPx,
      render.azStart,
      render.height,
      render.stepDeg,
      render.viewpoint,
      render.width,
      scale,
    ],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const previous = pointers.current.get(e.pointerId);

      if (previous) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        const points = [...pointers.current.values()];

        if (points.length >= 2) {
          const [a, b] = points as [
            { x: number; y: number },
            { x: number; y: number },
          ];

          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          // Against the previous frame rather than the start of the gesture, so
          // the zoom follows the fingers about as they move — the midpoint is
          // what stays put, which is what a pinch means.
          if (pinchRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();

            zoomAt(
              (a.x + b.x) / 2 - rect.left,
              (a.y + b.y) / 2 - rect.top,
              distance / pinchRef.current,
            );
          }

          pinchRef.current = distance;
        } else {
          const dx = e.clientX - previous.x;

          const dy = e.clientY - previous.y;

          travelRef.current += Math.abs(dx) + Math.abs(dy);

          // Turning it by hand is taking it over, and it stays taken over —
          // the same thing the stop button does, said with the gesture that
          // already means "I want to look at this". Only once it is a drag: a
          // press that goes nowhere is asking a distance, not steering.
          //
          // Latched in a ref rather than tested against the setting, which is a
          // render behind: pointer moves keep arriving before the store's
          // `false` comes back, and every one of them would dispatch again —
          // and every dispatch writes the whole persisted state to localStorage.
          if (
            travelRef.current > CLICK_SLOP_PX &&
            !stoppedRef.current &&
            settings.autoPan
          ) {
            stoppedRef.current = true;

            dispatch(panoramaSetSettings({ autoPan: false }));
          }

          setAzimuth((a) => mod(a - dx * degPerPx, 360));

          setOffsetY((o) => clamp(o - dy / scale, 0, maxOffsetY));
        }

        return;
      }

      // Hovering is a mouse's and a pen's; a finger says what it wants by
      // pressing, and `endPointer` answers that. A touch does reach here — one
      // that started on a label is never registered, and its moves still bubble
      // — and left to set a readout it could never clear one: its `pointerup`
      // finds nothing to end, and `pointerleave` is exactly what a finger
      // lifting fires.
      if (e.pointerType === 'touch') {
        return;
      }

      // A pointer hovering: say how far away whatever is under it stands.
      const sample = sampleGround(e);

      if (!sample) {
        return;
      }

      setHover(hoverReading(sample));

      // The map follows the pointer, so what is under it can be found without
      // committing to it — the press is what leaves a mark behind.
      setPanoramaHover(sample.ground);
    },
    [
      degPerPx,
      dispatch,
      maxOffsetY,
      sampleGround,
      scale,
      settings.autoPan,
      zoomAt,
    ],
  );

  const endPointer = useCallback(
    (e: ReactPointerEvent) => {
      // A press that started on a label never became a pan, and must not be
      // read as a press on the terrain behind it either.
      if (!pointers.current.delete(e.pointerId)) {
        return;
      }

      if (pointers.current.size < 2) {
        pinchRef.current = null;
      }

      if (pointers.current.size > 0) {
        return;
      }

      setDragging(false);

      // A press that went nowhere asks what is there, rather than turning the
      // view: the distance buffer says how far, which with the bearing is a
      // place on the map. A pinch is not that, however still the fingers were:
      // its own branch never counts travel, so without this the lift ending a
      // zoom would mark and measure wherever the last finger sat.
      if (travelRef.current <= CLICK_SLOP_PX && !pinchedRef.current) {
        const sample = sampleGround(e);

        if (sample) {
          dispatch(panoramaSetProbe(sample.ground));

          // A finger has no hover, so the press has to say the distance as well
          // as mark it — otherwise the readout is a thing only a mouse ever
          // sees. It stays until the next press, the way the mark does.
          setHover(hoverReading(sample));
        }
      }
    },
    [dispatch, sampleGround],
  );

  /**
   * Pressing a name marks its summit on the map and carries the summit itself
   * along, which is what the marker's tooltip, the panel's footer and the
   * label's own selected colour are all drawn from — one picked thing, said in
   * the three places one might be looking.
   *
   * The mark is the same one a press on the terrain leaves — crosshair, line of
   * sight, the map centred on it where it would be off screen — so a named
   * summit and a ridge pointed at read alike.
   */
  const pickLabel = useCallback(
    (label: PanoramaLabel) => {
      // Pressing the picked one again lets it go. A highlighted name invites
      // being pressed again, and the only other way out is pressing the sky,
      // which nothing suggests.
      if (label.id === pickedId) {
        dispatch(panoramaSetProbe(null));

        return;
      }

      dispatch(
        panoramaSetProbe({
          lat: label.lat,
          lon: label.lon,
          distance: label.distance,
          azimuth: label.azimuth,
          peak: { id: label.id, name: label.name, ele: label.ele },
        }),
      );
    },
    [dispatch, pickedId],
  );

  const anchor = useCallback(
    (label: PanoramaLabel): LabelAnchor | null => {
      const y = (label.y - clampedOffsetY) * scale;

      return y < 0 || y > height ? null : { x: screenX(label.azimuth), y };
    },
    [clampedOffsetY, height, scale, screenX],
  );

  // The readout put back where its terrain now is, the same way a label is: a
  // press-set one outlives the gesture, and the view keeps turning under it.
  const hoverAt = useMemo(
    () =>
      hover && {
        x: screenX(hover.az),
        y: (hover.iy - clampedOffsetY) * scale,
        distance: hover.distance,
      },
    [clampedOffsetY, hover, scale, screenX],
  );

  const weighting = useMemo(
    () => ({
      hazeKm: settings.labelHazeKm,
      distanceWeight: settings.labelDistanceWeight,
    }),
    [settings.labelHazeKm, settings.labelDistanceWeight],
  );

  // Where the names stand against each other, which the weighting moves — so it
  // is worked out here rather than kept on the render.
  const ranked = useMemo(
    () => rankLabels(render.labels, weighting),
    [render.labels, weighting],
  );

  // Which summits count at all. The far cut is ours rather than the service's:
  // its own `range` bounds the terrain the render sees, so asking it for one
  // would take the far ridges out of the picture and cost a render.
  const candidates = useMemo(() => {
    const ceiling = hazeCutoffM(weighting);

    // `NO_DOMINANCE_FILTER` is below every real figure, so the "Any" stop needs
    // no case of its own.
    return ranked.filter(
      (label) =>
        (label.dominance ?? Infinity) >= settings.minDominance &&
        label.distance <= ceiling,
    );
  }, [ranked, settings.minDominance, weighting]);

  const limits = useMemo(
    () => labelLayoutLimits(settings.labelDensity),
    [settings.labelDensity],
  );

  // Which summits get a name. Turning the view must not change the answer, so
  // the pitch is converted to degrees of horizon and applied to every candidate
  // — not to the ones on screen. The zoom is in it because a magnified view
  // spreads the skyline out, which is what reveals more names.
  const named = useMemo(
    () =>
      limits
        ? // Four names across the view however narrow the panel is; a busiest
          // step with no pitch at all thins nothing.
          thinLabels(
            candidates,
            Math.min(limits.pitchPx ?? 0, width / 4) * degPerPx,
          )
        : [],
    [candidates, degPerPx, limits, width],
  );

  // No `limits` guard of its own: `named` is already empty without them.
  const placements = useMemo(
    (): LabelPlacement[] =>
      layoutLabels(named, {
        anchor,
        measure: (label) => measureText(label.name),
        viewportWidth: width,
        lineHeight: LINE_HEIGHT,
        minLeader: MIN_LEADER,
        minTop: COMPASS_HEIGHT + 2,
        maxClimb: limits?.maxClimbPx ?? 0,
      }),
    [anchor, limits, named, width],
  );

  // Every label the strip can carry, worked out once per language: the eight
  // compass points and a degree figure at each of the other multiples of ten.
  // The strip is redrawn on every frame of a pan, and formatting a number is
  // dear enough that doing it for thirty visible ticks sixty times a second is
  // most of what drawing the strip costs.
  const tickLabels = useMemo(() => {
    const names = [
      gm?.cardinals.n,
      gm?.cardinals.ne,
      gm?.cardinals.e,
      gm?.cardinals.se,
      gm?.cardinals.s,
      gm?.cardinals.sw,
      gm?.cardinals.w,
      gm?.cardinals.nw,
    ];

    // Indexed by fives so the strip can look a bearing up directly, but only
    // the ones it draws are filled: the sieve below takes multiples of ten and
    // of forty-five, and nothing else is ever asked for.
    return Array.from({ length: 72 }, (_, i) => {
      const at = i * 5;

      return at % 45 === 0
        ? (names[at / 45] ?? '')
        : at % 10 === 0
          ? nfDeg.format(at)
          : '';
    });
  }, [gm, nfDeg]);

  const ticks = useMemo(() => {
    const out: { deg: number; x: number; text: string; cardinal: boolean }[] =
      [];

    // Stepped by five and sieved, because the two series the strip wants don't
    // nest: every ten degrees, and the eight compass points at multiples of
    // forty-five. Walking in tens alone lands on a multiple of 45 only at the
    // multiples of 90, so NE, SE, SW and NW would never be named at all.
    const first = Math.ceil(azLeft / 5) * 5;

    for (let deg = first; deg < azLeft + width * degPerPx; deg += 5) {
      const at = mod(deg, 360);

      const cardinal = at % 45 === 0;

      if (!cardinal && at % 10 !== 0) {
        continue;
      }

      out.push({
        deg,
        x: screenX(at),
        text: tickLabels[at / 5] ?? '',
        cardinal,
      });
    }

    return out;
  }, [azLeft, degPerPx, screenX, tickLabels, width]);

  return (
    <div
      className={clsx(classes.viewport, dragging && classes.grabbing)}
      ref={viewportRef}
      style={{ width, height }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      // A touch pointer ceases to exist when the finger lifts, which fires this
      // straight after the press that set the readout. Only a pointer that can
      // actually leave takes the readout with it.
      onPointerLeave={(e) => {
        if (e.pointerType !== 'touch') {
          setHover(null);

          setPanoramaHover(null);
        }
      }}
    >
      <div
        className={classes.image}
        style={{
          backgroundImage: `url(${data.imageUrl})`,
          backgroundSize: `${render.width * scale}px ${render.height * scale}px`,
          backgroundPositionX: `${-((azLeft - render.azStart) / render.stepDeg) * scale}px`,
          backgroundPositionY: `${-clampedOffsetY * scale}px`,
        }}
      />

      {/* Each leader is drawn twice, dark under light, the way the names carry
          a shadow: a pale line alone disappears against the sky, which is
          exactly where most of them run. */}
      <svg className={classes.overlay}>
        {placements.map((p) => (
          <Fragment key={p.label.id}>
            <line
              x1={p.anchor.x}
              y1={p.anchor.y}
              x2={p.anchor.x}
              y2={p.top + LINE_HEIGHT}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth={3}
            />

            <line
              x1={p.anchor.x}
              y1={p.anchor.y}
              x2={p.anchor.x}
              y2={p.top + LINE_HEIGHT}
              stroke={p.label.id === pickedId ? PICKED_INK : '#fff'}
              strokeWidth={1}
            />

            <circle
              cx={p.anchor.x}
              cy={p.anchor.y}
              r={2}
              fill={p.label.id === pickedId ? PICKED_INK : '#fff'}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth={1}
            />
          </Fragment>
        ))}
      </svg>

      {placements.map((p) => (
        <button
          key={p.label.id}
          type="button"
          className={classes.label}
          // Colour alone marks the picked one. Bold would be the obvious
          // second signal and is the wrong one: the layout packed this name
          // against a width measured in the regular face, so a bolder one runs
          // over the neighbour the layout kept clear of it.
          style={{
            left: p.left,
            top: p.top,
            ...(p.label.id === pickedId ? { color: PICKED_INK } : {}),
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => pickLabel(p.label)}
        >
          {p.label.name}
        </button>
      ))}

      <div className={classes.compass}>
        {ticks.map((tick) => (
          <div
            key={tick.deg}
            className={clsx(classes.tick, tick.cardinal && classes.cardinal)}
            style={{ left: tick.x }}
          >
            {tick.text}
          </div>
        ))}
      </div>

      {hoverAt && !dragging && (
        // Flipped to the other side of the pointer near an edge: the viewport
        // clips what leaves it, so a readout sitting below the cursor simply
        // vanishes along the bottom of the picture.
        <div
          className={classes.readout}
          style={{
            left: hoverAt.x,
            top: hoverAt.y,
            transform: `translate(${
              hoverAt.x > width - READOUT_CLEARANCE_PX
                ? 'calc(-100% - 8px)'
                : '8px'
            }, ${
              hoverAt.y > height - LINE_HEIGHT - 12
                ? 'calc(-100% - 8px)'
                : '8px'
            })`,
          }}
        >
          {formatDistance(hoverAt.distance, language)}
        </div>
      )}
    </div>
  );
}

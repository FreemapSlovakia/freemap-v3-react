import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  GENEROUS_MARGIN_PX,
  panToUncovered,
} from '@features/map/panToUncovered.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import windowClasses from '@shared/components/FloatingWindow.module.css';
import {
  FloatingWindowGrips,
  FullscreenButton,
} from '@shared/components/FloatingWindowControls.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { downloadSvg } from '@shared/downloadSvg.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useFloatingWindow } from '@shared/hooks/useFloatingWindow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { clamp } from '@shared/mathUtils.js';
import clsx from 'clsx';
import {
  Fragment,
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, CloseButton } from 'react-bootstrap';
import { FaCog, FaDownload, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useElevationSources } from '../hooks/useElevationSources.js';
import {
  elevationChartClose,
  elevationChartSetActivePoint,
} from '../model/actions.js';
import type { ElevationProfilePoint } from '../model/reducer.js';
import { profilePointAtDistance } from '../profilePoint.js';
import { useElevationChartMessages } from '../translations/useElevationChartMessages.js';
import classes from './ElevationChart.module.css';

const ml = 50,
  mr = 30,
  mb = 44;

// Matches the SVG font-size set in the CSS module; used to estimate label size.
const FONT_PX = 12;

// Rough average glyph width as a fraction of the font size, for estimating a
// label's rendered length (top-margin sizing and centering a shorter line).
const CHAR_PX = FONT_PX * 0.6;

// Baseline-to-baseline gap for stacked waypoint label lines (name / elevation).
const LINE_HEIGHT = FONT_PX + 2;

// Gap between the plot's top edge and the nearest (lowest) waypoint label line.
const LABEL_GAP = 6;

// x-axis distance tick length below the baseline, and the offset of its rotated
// (45°) value label. Shared by the axis ticks and each waypoint's own distance
// tick so the two stay aligned when re-tuned.
const X_TICK_LEN = 4;
const X_LABEL_DX = -5;
const X_LABEL_DY = 15;

// Longest waypoint name (in characters) before it's truncated with an ellipsis,
// so one long name can't blow up the chart's top margin.
const WAYPOINT_LABEL_MAX = 16;

// Geometry of a waypoint's label: lines stacked top-to-bottom and centered on
// each other, drawn as one block rotated -45° about the top line's start.
// Because the block is tilted, a wider line's leading (left) end reaches lower
// than a narrower line below it, so the nearest and farthest points can belong
// to any line. `nearDrop`/`farRise` are those extremes' vertical distance from
// the pivot (the top line's start), used to seat the block a fixed gap above
// the plot and to reserve the top margin. `offsets` centers each line.
function labelMetrics(lines: string[]) {
  const widths = lines.map((line) => line.length * CHAR_PX);

  const maxWidth = Math.max(...widths);

  const offsets = widths.map((w) => (maxWidth - w) / 2);

  const nearDrop =
    Math.SQRT1_2 *
    Math.max(...lines.map((_, i) => i * LINE_HEIGHT - offsets[i]!));

  const farRise =
    Math.SQRT1_2 *
    Math.max(
      ...lines.map((_, i) => offsets[i]! + widths[i]! - i * LINE_HEIGHT),
    );

  return { offsets, nearDrop, farRise };
}

const ticks = new Array(11)
  .fill(0)
  .flatMap((_, k) => [1, 2.5, 2, 5].map((x) => x * 10 ** k));

const EMPTY_ARRAY: ElevationProfilePoint[] = [];

/**
 * The stretch of the profile on screen, as fractions of its whole length —
 * fractions rather than distances so a re-route keeps the same part in view.
 */
type ChartView = { from: number; to: number };

const WHOLE_VIEW: ChartView = { from: 0, to: 1 };

// Tightest the distance axis can be wound in, as a multiple of the whole.
const MAX_ZOOM = 1000;

// Farther than this in a press and it was a drag, not a click.
const CLICK_SLOP_PX = 4;

// What one wheel notch does to the zoom.
const WHEEL_FACTOR = 1.25;

export default function ElevationChart(): ReactElement | null {
  const m = useElevationChartMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const elevationProfilePoints = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints ?? EMPTY_ARRAY,
  );

  const waypoints = useAppSelector((state) => state.elevationChart.waypoints);

  const [view, setView] = useState(WHOLE_VIEW);

  // A profile of something else starts unzoomed; one redrawn for the same
  // target (a re-route, an arriving position) keeps the stretch being read.
  const target = useAppSelector((state) => state.elevationChart.target);

  const chartedRef = useRef(target);

  if (chartedRef.current !== target) {
    chartedRef.current = target;

    setView(WHOLE_VIEW);
  }

  const prm = usePremiumMessages();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const provenance = useAppSelector(
    (state) => state.elevationChart.provenance ?? undefined,
  );

  const reportedSources = useAppSelector(
    (state) => state.elevationChart.sources,
  );

  // The terrain models behind the drawn elevation, credited under the chart.
  // Recorded elevation names none, so the line disappears there.
  const sources = useElevationSources(
    provenance ?? 'recorded',
    reportedSources,
  );

  const [showWaypoints, setShowWaypoints] = usePersistentBoolean(
    'fm.elevationChart.showWaypoints',
    true,
  );

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // The label lines stacked above each waypoint, top to bottom: the name (when
  // named) sits above the elevation readout (when known). Empty when hidden, so
  // the chart neither draws waypoints nor reserves top margin for their labels.
  const labeledWaypoints = useMemo(
    () =>
      showWaypoints
        ? waypoints.map((wp) => {
            const name =
              wp.label && wp.label.length > WAYPOINT_LABEL_MAX
                ? `${wp.label.slice(0, WAYPOINT_LABEL_MAX - 1)}…`
                : wp.label;

            const ele = Number.isFinite(wp.ele)
              ? `${nf0.format(wp.ele)} m`
              : undefined;

            const lines = [name, ele].filter((l): l is string => Boolean(l));

            return {
              ...wp,
              lines,
              metrics: lines.length ? labelMetrics(lines) : null,
            };
          })
        : [],
    [waypoints, showWaypoints, nf0],
  );

  // Top margin: room for the y-axis unit label above the plot, and — when there
  // are waypoints — the tallest label. A label spans from its gap above the
  // plot up to the top line's far end, plus a glyph's ascent.
  const mt = useMemo(() => {
    let required = FONT_PX + 4;

    for (const wp of labeledWaypoints) {
      if (wp.metrics) {
        required = Math.max(
          required,
          Math.ceil(
            LABEL_GAP + wp.metrics.nearDrop + wp.metrics.farRise + FONT_PX,
          ),
        );
      }
    }

    return required;
  }, [labeledWaypoints]);

  const { climbUp, climbDown } = elevationProfilePoints.at(-1) ?? {};

  const {
    boxProps,
    bottomProps,
    fullscreen,
    toggleFullscreen,
    width,
    height,
    ...grips
  } = useFloatingWindow({
    storageKey: 'fm.elevationChart.window',
    // The axis margins; what's left over between them is the plot.
    chromeHeight: mt + mb,
    boxClassName: classes.elevationChart,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // The id goes into a `url(#…)` reference, which takes none of the punctuation
  // React wraps its own ids in.
  const clipId = `ec-plot-${useId().replace(/\W/g, '')}`;

  const plotWidth = width - ml - mr;

  const d = elevationProfilePoints.at(-1)?.distance ?? NaN;

  const vFrom = d * view.from;

  const vTo = d * view.to;

  // Distance between x-axis ticks, in metres. Out here because the label format
  // is picked from it, and formatters are hooks.
  const xStep =
    ticks.find((step) => (plotWidth * step) / (vTo - vFrom) > 25) ??
    Number.POSITIVE_INFINITY;

  // As many decimals as it takes for one tick to read differently from the
  // next: the labels are kilometres, and zoomed in a step can be a few metres.
  const xDigits = useMemo(() => {
    const step = xStep / 1000;

    for (let digits = 1; digits < 6; digits++) {
      if (Number(step.toFixed(digits)) === step) {
        return digits;
      }
    }

    return 6;
  }, [xStep]);

  const nfX = useNumberFormat({
    minimumFractionDigits: xDigits,
    maximumFractionDigits: xDigits,
  });

  const { mapX, unmapX, mapY, endX, vLines, hLines } = useMemo(() => {
    // The whole profile sets the elevation range, zoomed in or not: a scale
    // that followed the window would make two readings of the same chart
    // incomparable, and the min/max lines would name a local pair.
    const eles = elevationProfilePoints
      .map((pt) => pt.ele)
      .filter((ele) => Number.isFinite(ele));

    const min = eles.length ? Math.min(...eles) : 0;

    const max = eles.length ? Math.max(...eles) : 0;

    // Guard an empty or flat profile (no finite elevations, or all equal): a
    // zero span would make `mapY` divide by zero and emit NaN chart geometry.
    const diff = max - min || 1;

    const chartMin = min - diff / 20;

    const chartMax = max + diff / 20;

    function mapX(distance: number) {
      return ml + (plotWidth * (distance - vFrom)) / (vTo - vFrom);
    }

    function unmapX(x: number) {
      return vFrom + ((x - ml) / plotWidth) * (vTo - vFrom);
    }

    function mapY(ele: number) {
      return (
        height -
        mb -
        ((ele - chartMin) / (chartMax - chartMin)) * (height - mt - mb)
      );
    }

    const hLines: number[] = [];

    const yStep = ticks.find((step) => mapY(0) - mapY(step) > 20) ?? 10000;

    for (
      let y = Math.ceil(chartMin / yStep) * yStep;
      y < chartMax;
      y += yStep
    ) {
      hLines.push(y);
    }

    hLines.push(min);
    hLines.push(max);

    const vLines: number[] = [];

    if (Number.isFinite(xStep)) {
      for (let x = Math.ceil(vFrom / xStep) * xStep; x < vTo; x += xStep) {
        vLines.push(x);
      }
    }

    // The profile's end marks itself, whenever the view reaches it.
    const endX = vTo >= d ? d : null;

    if (endX !== null) {
      vLines.push(endX);
    }

    return { mapX, unmapX, mapY, endX, vLines, hLines };
  }, [elevationProfilePoints, plotWidth, height, mt, d, vFrom, vTo, xStep]);

  // The marked place, wherever it was pointed at: hovering the chart sets it,
  // and so does hovering the drawn line on the map, which is what puts the
  // crosshair under the map's pointer.
  const activePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  // A profile redrawn while a place is marked can end before it — a re-route
  // shortening the way, say — and the crosshair belongs inside the plot, so it
  // goes rather than reaching past its edge. Zoomed in, the same holds for a
  // place the view has left behind.
  const pointerX =
    activePoint && activePoint.distance >= vFrom && activePoint.distance <= vTo
      ? mapX(activePoint.distance)
      : undefined;

  /** What the profile holds under a pointer, wherever on the screen it is. */
  const pointAt = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();

    return rect
      ? profilePointAtDistance(
          elevationProfilePoints,
          unmapX(clientX - rect.left),
        )
      : undefined;
  };

  const scrub = (clientX: number) => {
    const point = pointAt(clientX);

    if (point) {
      dispatch(elevationChartSetActivePoint(point));
    }
  };

  // Zoom about a place rather than about the middle: whatever is under the
  // pointer, or between the fingers, stays where it is.
  const zoomAt = useCallback(
    (x: number, factor: number) => {
      setView(({ from, to }) => {
        const span = to - from;

        const next = clamp(span / factor, 1 / MAX_ZOOM, 1);

        const t = clamp((x - ml) / plotWidth, 0, 1);

        const held = from + t * span;

        const nextFrom = clamp(held - t * next, 0, 1 - next);

        return { from: nextFrom, to: nextFrom + next };
      });
    },
    [plotWidth],
  );

  const panBy = (dx: number) => {
    setView(({ from, to }) => {
      const span = to - from;

      const nextFrom = clamp(from - (dx / plotWidth) * span, 0, 1 - span);

      return { from: nextFrom, to: nextFrom + span };
    });
  };

  // Not through React's handler: it registers wheel passively, so the page
  // would scroll as well as the chart zooming.
  useEffect(() => {
    const el = svgRef.current;

    if (!el) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      zoomAt(
        e.clientX - el.getBoundingClientRect().left,
        e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR,
      );
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  /** Pressed pointers by id, each at the x it was last seen at. */
  const pointers = useRef(new Map<number, number>());

  /** Distance between the two fingers on the previous move, while pinching. */
  const pinchRef = useRef<number | null>(null);

  const travelRef = useRef(0);

  /** Whether a second finger ever joined, which makes the gesture a pinch. */
  const pinchedRef = useRef(false);

  const handlePointerDown = (e: ReactPointerEvent<SVGRectElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    pointers.current.set(e.pointerId, e.clientX);

    // Any change to who is pressing invalidates the pinch's baseline: measured
    // between one pair and applied to another, it would jump the zoom.
    pinchRef.current = null;

    if (pointers.current.size > 1) {
      pinchedRef.current = true;

      return;
    }

    travelRef.current = 0;

    pinchedRef.current = false;

    // A finger has no hover, so the press is what reads the profile.
    scrub(e.clientX);
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const previous = pointers.current.get(e.pointerId);

    if (previous === undefined) {
      scrub(e.clientX);

      return;
    }

    pointers.current.set(e.pointerId, e.clientX);

    const xs = [...pointers.current.values()];

    if (xs.length >= 2) {
      const spread = Math.abs(xs[0]! - xs[1]!);

      // Against the previous frame rather than the start of the gesture, so the
      // zoom follows the fingers as they move; their midpoint is what stays put.
      if (pinchRef.current) {
        const rect = svgRef.current?.getBoundingClientRect();

        if (rect) {
          zoomAt((xs[0]! + xs[1]!) / 2 - rect.left, spread / pinchRef.current);
        }
      }

      pinchRef.current = spread;

      return;
    }

    const dx = e.clientX - previous;

    travelRef.current += Math.abs(dx);

    // Zoomed in, a drag slides the window along the profile; at full width
    // there is nothing to slide, so it reads the profile as a hover does.
    if (view.to - view.from < 1) {
      panBy(dx);
    } else {
      scrub(e.clientX);
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!pointers.current.delete(e.pointerId)) {
      return;
    }

    pinchRef.current = null;

    if (pointers.current.size > 0) {
      return;
    }

    // A press that went nowhere asks to see the place it marks, and the panel
    // is usually sitting over it — so the map brings it out into the open. One
    // already well in view stays put: reading along a profile is a lot of
    // presses, and the map sliding under each of them helps nobody.
    if (travelRef.current <= CLICK_SLOP_PX && !pinchedRef.current) {
      const point = pointAt(e.clientX);

      if (point) {
        panToUncovered(point, {
          ifHidden: true,
          margin: GENEROUS_MARGIN_PX,
        });
      }
    }
  };

  // A gesture the system took away (an OS gesture, a call arriving) completed
  // nothing, so it is dropped rather than read as the press it never became.
  const handlePointerCancel = (e: ReactPointerEvent<SVGRectElement>) => {
    pointers.current.delete(e.pointerId);

    pinchRef.current = null;
  };

  const handlePointerOut = (e: ReactPointerEvent<SVGRectElement>) => {
    // A finger lifting fires this straight after the press that set the mark,
    // so only a pointer that can hover clears it by leaving.
    if (e.pointerType !== 'touch') {
      dispatch(elevationChartSetActivePoint(null));
    }
  };

  const visibleWaypoints = labeledWaypoints.filter(
    (wp) => wp.distance >= vFrom && wp.distance <= vTo,
  );

  const handleDownload = () => {
    downloadSvg(svgRef.current, 'elevation-chart.svg');
  };

  return (
    <div {...boxProps}>
      {/* The grips are the only way to move or resize it: the plot itself is
          left to reading, zooming and panning the profile. */}
      <FloatingWindowGrips fullscreen={fullscreen} {...grips} />

      <CloseButton onClick={() => dispatch(elevationChartClose())} />

      {/* Nothing to plot into a box with no room. `Main` hides the panels
          rather than unmounting them while a place is being picked, and a
          `display: none` box measures 0, which every width below turns
          negative. */}
      <svg ref={svgRef} width={width} height={height}>
        {width > ml + mr && height > mt + mb && (
          <>
            <defs>
              {/* Zoomed in, the profile runs past both ends of the plot. */}
              <clipPath id={clipId}>
                <rect
                  x={ml}
                  y={mt}
                  width={plotWidth}
                  height={height - mt - mb}
                />
              </clipPath>
            </defs>

            {/* Plot background. */}
            <rect
              x={ml}
              y={mt}
              width={plotWidth}
              height={height - mt - mb}
              fill="var(--bs-body-bg)"
            />

            {/* Elevation profile: an area fill with its outline, one group per run
            of points with elevation. A missing value breaks the line and its
            fill rather than dropping to the baseline. */}
            <g className="chart" clipPath={`url(#${clipId})`}>
              {(() => {
                const segments: ElevationProfilePoint[][] = [];

                let current: ElevationProfilePoint[] = [];

                for (const pt of elevationProfilePoints) {
                  if (Number.isFinite(pt.ele)) {
                    current.push(pt);
                  } else if (current.length) {
                    segments.push(current);

                    current = [];
                  }
                }

                if (current.length) {
                  segments.push(current);
                }

                return segments.map((seg, i) => {
                  const line = seg
                    .map((pt) => `${mapX(pt.distance)},${mapY(pt.ele)}`)
                    .join(' ');

                  const baseY = height - mb;

                  return (
                    <g className="chart-segment" key={`seg${i}`}>
                      <polygon
                        points={
                          `${mapX(seg[0]!.distance)},${baseY} ` +
                          line +
                          ` ${mapX(seg.at(-1)!.distance)},${baseY}`
                        }
                        fill="var(--bs-primary-bg-subtle)"
                      />

                      <polyline
                        points={line}
                        stroke="var(--bs-primary)"
                        strokeWidth={1}
                        fill="none"
                      />
                    </g>
                  );
                });
              })()}
            </g>

            {pointerX !== undefined && (
              <line
                className="crosshair"
                key="pointerx"
                x1={pointerX}
                x2={pointerX}
                y1={mt}
                y2={height - mb}
                stroke="var(--bs-danger)"
                strokeWidth={1}
              />
            )}

            {/* Dashed reference lines spanning the plot. */}
            <g className="grid">
              <g className="grid-horizontal">
                {hLines.map((y, i) => {
                  const limit = hLines.length - i < 3;

                  return (
                    <line
                      key={`gy${i}`}
                      x1={ml}
                      x2={width - mr}
                      y1={mapY(y)}
                      y2={mapY(y)}
                      strokeWidth={1}
                      stroke={
                        limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'
                      }
                      opacity={limit ? 0.6 : 0.4}
                      strokeDasharray="2 2"
                    />
                  );
                })}
              </g>

              <g className="grid-vertical">
                {vLines.map((x, i) => {
                  const limit = x === endX;

                  return (
                    <line
                      key={`gx${i}`}
                      x1={mapX(x)}
                      x2={mapX(x)}
                      y1={mt}
                      y2={height - mb}
                      strokeWidth={1}
                      stroke={
                        limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'
                      }
                      opacity={limit ? 0.6 : 0.4}
                      strokeDasharray="2 2"
                    />
                  );
                })}
              </g>
            </g>

            {/* Each axis groups its line with its tick marks and value labels. Ticks
            and labels are split into their own layers so each set can be styled
            as a whole; only the min/max/last "limit" marks override the shared
            colour to the accent. */}
            <g className="axes">
              {/* y-axis: vertical line at the left edge of the plot. */}
              <g className="axis axis-y">
                <line
                  className="axis-line"
                  x1={ml}
                  x2={ml}
                  y1={mt}
                  y2={height - mb}
                  stroke="var(--bs-body-color)"
                  strokeWidth={1}
                />

                <g
                  className="ticks"
                  stroke="var(--bs-body-color)"
                  strokeWidth={1}
                >
                  {hLines.map((y, i) => {
                    const limit = hLines.length - i < 3;

                    return (
                      <line
                        key={`ty${i}`}
                        x1={ml - 4}
                        x2={ml}
                        y1={mapY(y)}
                        y2={mapY(y)}
                        stroke={limit ? 'var(--bs-danger)' : undefined}
                      />
                    );
                  })}
                </g>

                <g
                  className="tick-labels"
                  fill="var(--bs-body-color)"
                  textAnchor="end"
                >
                  {hLines.map((y, i) => {
                    const limit = hLines.length - i < 3;

                    const show =
                      limit ||
                      (Math.abs(mapY(y) - mapY(hLines.at(-1)!)) > 14 &&
                        Math.abs(mapY(y) - mapY(hLines.at(-2)!)) > 14);

                    return show ? (
                      <text
                        key={`ly${i}`}
                        x={ml - 10}
                        y={mapY(y)}
                        dominantBaseline="middle"
                        fill={limit ? 'var(--bs-danger)' : undefined}
                      >
                        {nf0.format(y)}
                      </text>
                    ) : null;
                  })}
                </g>

                {/* Elevation unit, at the top of the axis — ending on the axis
                    rather than straddling it, so it stays over its own tick
                    labels and out of the way of a waypoint label at distance 0,
                    which leans up and to the right from just inside the plot. */}
                <text
                  className="axis-unit"
                  x={ml}
                  y={mt - 6}
                  textAnchor="end"
                  fill="var(--bs-body-color)"
                >
                  {gm?.general.masl}
                </text>
              </g>

              {/* x-axis: horizontal line along the plot's baseline. */}
              <g className="axis axis-x">
                <line
                  className="axis-line"
                  x1={ml}
                  x2={width - mr}
                  y1={height - mb}
                  y2={height - mb}
                  stroke="var(--bs-body-color)"
                  strokeWidth={1}
                />

                <g
                  className="ticks"
                  stroke="var(--bs-body-color)"
                  strokeWidth={1}
                >
                  {vLines.map((x, i) => {
                    const limit = x === endX;

                    return (
                      <line
                        key={`tx${i}`}
                        x1={mapX(x)}
                        x2={mapX(x)}
                        y1={height - mb}
                        y2={height - mb + X_TICK_LEN}
                        stroke={limit ? 'var(--bs-danger)' : undefined}
                      />
                    );
                  })}
                </g>

                <g
                  className="tick-labels"
                  fill="var(--bs-body-color)"
                  textAnchor="start"
                >
                  {vLines.map((x, i) => {
                    const limit = x === endX;

                    // Hide a regular label that would collide with the endpoint or
                    // a waypoint's own distance label (drawn in the waypoints layer).
                    const show =
                      limit ||
                      ((endX === null || Math.abs(mapX(x) - mapX(endX)) > 20) &&
                        !visibleWaypoints.some(
                          (wp) => Math.abs(mapX(wp.distance) - mapX(x)) < 20,
                        ));

                    return show ? (
                      <text
                        key={`lx${i}`}
                        x={mapX(x) + X_LABEL_DX}
                        y={height - mb + X_LABEL_DY}
                        dominantBaseline="middle"
                        transform={`rotate(45, ${mapX(x) + X_LABEL_DX}, ${height - mb + X_LABEL_DY})`}
                        fill={limit ? 'var(--bs-danger)' : undefined}
                      >
                        {nfX.format(x / 1000)}
                      </text>
                    ) : null;
                  })}
                </g>

                {/* distance unit, past the right end of the axis */}
                <text
                  className="axis-unit"
                  x={width - mr + 6}
                  y={height - mb}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill="var(--bs-body-color)"
                >
                  km
                </text>
              </g>
            </g>

            {/* Waypoints pinned along the profile: a stem, a dot on the line, the
            name and elevation on two lines angled -45° up into the top margin
            (sized to fit the tallest label above), and the distance value
            ticked on the x-axis. Same colour as the elevation line. */}
            <g className="waypoints">
              {visibleWaypoints.map((wp, i) => {
                const x = mapX(wp.distance);

                // Seat the block so its lowest point (a wide line's leading end,
                // whichever line that is) sits a fixed gap above the plot.
                const labelY = wp.metrics
                  ? mt - LABEL_GAP - wp.metrics.nearDrop
                  : mt;

                return (
                  <g className="waypoint" key={`wp${i}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={mt}
                      y2={height - mb}
                      stroke="var(--bs-primary)"
                      strokeWidth={1}
                      opacity={0.6}
                    />

                    <circle
                      cx={x}
                      cy={mapY(wp.ele)}
                      r={3}
                      fill="var(--bs-primary)"
                    />

                    {wp.metrics && (
                      <text
                        textAnchor="start"
                        transform={`rotate(-45, ${x + 3}, ${labelY})`}
                        fill="var(--bs-primary)"
                      >
                        {wp.lines.map((line, j) => (
                          // Each line centered under the widest by an equal start
                          // nudge along the (rotated) baseline; stacked by baseline.
                          <tspan
                            key={j}
                            x={x + 3 + wp.metrics!.offsets[j]!}
                            y={labelY + j * LINE_HEIGHT}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    )}

                    {/* the waypoint's own distance, ticked on the x-axis */}
                    <line
                      x1={x}
                      x2={x}
                      y1={height - mb}
                      y2={height - mb + X_TICK_LEN}
                      stroke="var(--bs-primary)"
                      strokeWidth={1}
                    />

                    <text
                      x={x + X_LABEL_DX}
                      y={height - mb + X_LABEL_DY}
                      textAnchor="start"
                      dominantBaseline="middle"
                      transform={`rotate(45, ${x + X_LABEL_DX}, ${height - mb + X_LABEL_DY})`}
                      fill="var(--bs-primary)"
                    >
                      {nfX.format(wp.distance / 1000)}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Which part of the profile the zoomed plot is showing. Informative
                only, and it sits in the clearance the waypoint labels already
                keep above the plot, so it costs no room. */}
            {view.to - view.from < 1 &&
              (() => {
                const w = Math.max(plotWidth * (view.to - view.from), 6);

                return (
                  <g className="view-indicator">
                    <rect
                      x={ml}
                      y={mt - 4}
                      width={plotWidth}
                      height={3}
                      rx={1.5}
                      fill="var(--bs-secondary)"
                      opacity={0.25}
                    />

                    <rect
                      x={Math.min(
                        ml + plotWidth * view.from,
                        ml + plotWidth - w,
                      )}
                      y={mt - 4}
                      width={w}
                      height={3}
                      rx={1.5}
                      fill="var(--bs-primary)"
                      opacity={0.8}
                    />
                  </g>
                );
              })()}

            {/* Transparent interaction overlay on top: the whole plot is one
                target, so a gesture is not interrupted by whatever it passes
                over. */}
            <rect
              x={ml}
              y={mt}
              width={plotWidth}
              height={height - mt - mb}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerOut={handlePointerOut}
              opacity={0}
            />
          </>
        )}
      </svg>

      {/* One wrapping row, measured as a whole so the SVG is sized around it
          however many lines it takes. */}
      {/* The ref alone, not `bottomProps`: this panel's bottom is the one
          wrapping row, so it wants none of the column the two-row panels do. */}
      <div
        ref={bottomProps.ref}
        className={clsx(
          windowClasses.footer,
          'd-flex flex-wrap align-items-center gap-2 mb-1 mx-2',
        )}
      >
        {typeof climbUp === 'number' && typeof climbDown === 'number' && (
          <p className="m-0">
            {m?.uphill}: {nf0.format(climbUp)}&nbsp;m, {m?.downhill}:{' '}
            {nf0.format(climbDown)}&nbsp;m
          </p>
        )}

        {sources.length > 0 && (
          // Pushed against the buttons at the right end of its line, so the one
          // auto margin belongs here rather than to them.
          <p className="m-0 ms-auto small text-body-secondary">
            {m?.elevationSource}:{' '}
            {sources.map((attr, i) => (
              <Fragment key={attr.name}>
                {i > 0 ? ', ' : null}

                {/* A model we have no link for — a country the API gained since
                    — is still named, just not as a link. */}
                {attr.url ? (
                  <a
                    href={attr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-body-emphasis"
                  >
                    {attr.name}
                  </a>
                ) : (
                  attr.name
                )}
              </Fragment>
            ))}
            {/* The finer national models are premium's; say so where they'd
                otherwise just be missing from the list. */}
            {!premium && <PremiumGem hint={prm?.higherPrecisionElevation} />}
          </p>
        )}

        <div
          className={clsx(
            'd-flex align-items-center gap-1',
            sources.length === 0 && 'ms-auto',
          )}
        >
          {waypoints.length > 0 && (
            <LongPressTooltip label={m?.showWaypoints}>
              {({ props }) => (
                <Button
                  variant="outline-primary"
                  size="sm"
                  active={showWaypoints}
                  onClick={() => setShowWaypoints((v) => !v)}
                  {...props}
                >
                  <FaMapMarkerAlt />
                </Button>
              )}
            </LongPressTooltip>
          )}

          <LongPressTooltip label={gm?.elevationChart.settings}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  dispatch(setActiveModal({ type: 'elevation-settings' }))
                }
                {...props}
              >
                <FaCog />
              </Button>
            )}
          </LongPressTooltip>

          {/* The embed is a cross-origin iframe, where the browser refuses both
                the save picker and a synthesized download. */}
          {!window.fmEmbedded && (
            <LongPressTooltip label={m?.downloadAsSvg}>
              {({ props }) => (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  {...props}
                >
                  <FaDownload />
                </Button>
              )}
            </LongPressTooltip>
          )}

          <FullscreenButton
            fullscreen={fullscreen}
            onToggle={toggleFullscreen}
            size="sm"
          />
        </div>
      </div>

      {/* Pinned to the corner instead of ending the toolbar row, which wraps
          its buttons to the left of the next line as the box narrows. Out of
          that row's flow, so it doesn't count towards the height measured for
          the chart either. */}
    </div>
  );
}

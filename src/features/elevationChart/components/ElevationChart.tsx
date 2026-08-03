import { setActiveModal } from '@app/store/actions.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
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
import { Button, CloseButton } from 'react-bootstrap';
import { FaCog, FaDownload, FaMapMarkerAlt } from 'react-icons/fa';
import { LuMoveDiagonal2 } from 'react-icons/lu';
import { useDispatch } from 'react-redux';
import { downloadChartSvg } from '../downloadChartSvg.js';
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

// Absolute floor the window can be dragged to. The height the grip actually
// stops at is at least this but grows with what the plot's chrome takes (see
// `minHeight`), because the axis margins and the footer row are not constant.
const MIN_WIDTH = 260;
const MIN_HEIGHT = 200;

// What's left for the plot itself, between the axis margins, at that floor.
const MIN_PLOT_HEIGHT = 40;

// The `m-2` margin the box keeps between its far edge and the viewport's.
const EDGE_GAP = 8;

// The `p-2` padding between the box's edges and its contents.
const BOX_PADDING = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

// A mouse held down keeps reporting its position after it leaves the browser
// window, and is released there too. Kept to the viewport, the drag stops at
// the edge instead of parking the chart where it can no longer be grabbed.
function pointerInView(e: PointerEvent) {
  return [
    clamp(e.clientX, 0, window.innerWidth),
    clamp(e.clientY, 0, window.innerHeight),
  ] as const;
}

// Where the window sat and how big it was when it was last dragged or resized.
// `left`/`top` are the offset from where it opens, which is what the drag keeps.
type ChartBox = { left: number; top: number; width: number; height: number };

const BOX_KEY = 'fm.elevationChart.box';

const serializeBox = ({ left, top, width, height }: ChartBox) =>
  [left, top, width, height].join(',');

// Anything but the four numbers written back — nothing stored yet, an entry
// tampered with — opens at the default size. A size remembered from a roomier
// window (a desktop browser since made narrow, a phone since rotated) comes
// back fitting the screen.
function deserializeBox(value: string | null): ChartBox {
  const [left, top, width, height] = (value ?? '').split(',').map(Number);

  return [left, top, width, height].every(Number.isFinite)
    ? {
        left: left!,
        top: top!,
        width: clamp(width!, MIN_WIDTH, window.innerWidth - 2 * EDGE_GAP),
        height: clamp(height!, MIN_HEIGHT, window.innerHeight - 2 * EDGE_GAP),
      }
    : {
        left: 0,
        top: 0,
        width: Math.min(
          Math.max(window.innerWidth / 2, 400),
          Math.max(window.innerWidth - 14, 40),
        ),
        height: Math.min(
          Math.max(window.innerHeight / 2, 300),
          Math.max(window.innerHeight - 130, 40),
        ),
      };
}

export default function ElevationChart(): ReactElement | null {
  const m = useElevationChartMessages();

  const dispatch = useDispatch();

  const elevationProfilePoints = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints ?? EMPTY_ARRAY,
  );

  const waypoints = useAppSelector((state) => state.elevationChart.waypoints);

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

  const nf1 = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
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

  const [width, setWidth] = useState(400);

  const [height, setHeight] = useState(300);

  const [mapX, mapY, d, vLines, hLines] = useMemo(() => {
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

    const d = elevationProfilePoints.at(-1)?.distance ?? NaN;

    function mapX(distance: number) {
      return ml + ((width - ml - mr) * distance) / d;
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

    const xStep =
      ticks.find((step) => mapX(step) - mapX(0) > 25) ??
      Number.POSITIVE_INFINITY;

    for (let x = 0; x < d; x += xStep) {
      vLines.push(x);
    }

    vLines.push(d);

    return [mapX, mapY, d, vLines, hLines];
  }, [elevationProfilePoints, width, height, mt]);

  // The marked place, wherever it was pointed at: hovering the chart sets it,
  // and so does hovering the drawn line on the map, which is what puts the
  // crosshair under the map's pointer.
  const activePoint = useAppSelector(
    (state) => state.elevationChart.activePoint,
  );

  // A profile redrawn while a place is marked can end before it — a re-route
  // shortening the way, say — and the crosshair belongs inside the plot, so it
  // goes rather than reaching past its edge.
  const pointerX =
    activePoint && activePoint.distance <= d
      ? mapX(activePoint.distance)
      : undefined;

  const handlePointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const point = profilePointAtDistance(
      elevationProfilePoints,
      (d / (width - ml - mr)) * x,
    );

    if (point) {
      dispatch(elevationChartSetActivePoint(point));
    }
  };

  const handlePointerOut = () => {
    dispatch(elevationChartSetActivePoint(null));
  };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [ref2, setRef2] = useState<HTMLDivElement | null>(null);

  // Where the window was left the last time it was moved or resized. Read as
  // it opens, and written at the end of each gesture; `chosenRef` carries it
  // in between.
  const [box, setBox] = usePersistentState<ChartBox>(
    BOX_KEY,
    serializeBox,
    deserializeBox,
  );

  const [initialBox] = useState(box);

  const svgRef = useRef<SVGSVGElement>(null);

  const startPosRef = useRef<[number, number]>(undefined);

  const posRef = useRef([initialBox.left, initialBox.top]);

  const [pos, setPos] = useState({
    top: initialBox.top,
    left: initialBox.left,
  });

  // The geometry the user chose, which is also what gets stored. The live box
  // can be smaller and shifted from it to fit a window too small to hold it,
  // and is put back to this much of it as each window afterwards has room for.
  const chosenRef = useRef<ChartBox>(initialBox);

  // Stored at the end of a gesture rather than on every move, so a drag writes
  // to storage once.
  const persistBox = useCallback(() => {
    setBox(chosenRef.current);
  }, [setBox]);

  // Neither margin is constant — the top one grows with the waypoint labels,
  // the footer rewraps as the box narrows — so the floor the height stops at
  // has to be measured, or the plot between them collapses.
  const minBoxHeight = useCallback(
    () =>
      Math.max(
        MIN_HEIGHT,
        mt + mb + MIN_PLOT_HEIGHT + (ref2?.offsetHeight ?? 0) + 2 * BOX_PADDING,
      ),
    [mt, ref2],
  );

  // Lays the chosen box out in the window there is: shrunk to fit it, then
  // nudged in. Always derived from the chosen one rather than from where the
  // box currently is, so a window that shrinks and grows back — a phone turned
  // twice, an Android URL bar sliding in and out — leaves nothing behind.
  const fitIntoView = useCallback(() => {
    if (!ref) {
      return;
    }

    const chosen = chosenRef.current;

    ref.style.width = `${clamp(
      chosen.width,
      MIN_WIDTH,
      window.innerWidth - 2 * EDGE_GAP,
    )}px`;

    ref.style.height = `${clamp(
      chosen.height,
      minBoxHeight(),
      window.innerHeight - 2 * EDGE_GAP,
    )}px`;

    // Where that size would sit at the chosen offset: the box is positioned
    // relative to where it lands on its own, which the current offset backs out
    // of the freshly laid out rectangle.
    const rect = ref.getBoundingClientRect();

    const left = rect.left - posRef.current[0]! + chosen.left;

    const top = rect.top - posRef.current[1]! + chosen.top;

    // Nudged as little as possible, and towards the top-left corner when the
    // box no longer fits at all.
    const dx = clamp(0, -left, window.innerWidth - (left + rect.width));

    const dy = clamp(0, -top, window.innerHeight - (top + rect.height));

    if (
      chosen.left + dx !== posRef.current[0] ||
      chosen.top + dy !== posRef.current[1]
    ) {
      posRef.current = [chosen.left + dx, chosen.top + dy];

      setPos({ left: posRef.current[0]!, top: posRef.current[1]! });
    }
  }, [ref, minBoxHeight]);

  // The geometry it opens with was measured against a window that may since
  // have changed, and the window keeps changing under it afterwards — rotate
  // the phone, drag the browser narrower — so it's refitted on both.
  useEffect(() => {
    if (!ref) {
      return;
    }

    fitIntoView();

    window.addEventListener('resize', fitIntoView);

    return () => window.removeEventListener('resize', fitIntoView);
  }, [ref, fitIntoView]);

  // The chart fills what the footer row leaves over, so both are watched: the
  // footer grows on its own once the elevation sources resolve, or whenever it
  // rewraps, and the chart has to give that space back instead of pushing the
  // row out of the (clipped) window.
  useEffect(() => {
    if (!ref) {
      return;
    }

    const content = { width: 0, height: 0 };

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (e.target === ref) {
          content.width = e.contentRect.width;

          content.height = e.contentRect.height;
        }
      }

      setWidth(content.width);

      setHeight(Math.max(content.height - (ref2 ? ref2.offsetHeight : 0), 0));
    });

    ro.observe(ref);

    if (ref2) {
      ro.observe(ref2);
    }

    return () => ro.disconnect();
  }, [ref, ref2]);

  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
  }>(undefined);

  const handleResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!ref) {
      return;
    }

    // Capture so the grip keeps receiving moves even when a fast drag outruns
    // it, and so the map below never sees the gesture.
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = ref.getBoundingClientRect();

    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      left: rect.left,
      top: rect.top,
    };
  };

  const handleResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;

    if (!start || !ref) {
      return;
    }

    // Room is measured from the box's own top-left corner, since it only grows
    // right and down; against the bare viewport, a pointer taken outside the
    // window would push the footer (this grip included) off the screen.
    ref.style.width = `${clamp(
      start.width + e.clientX - start.x,
      MIN_WIDTH,
      window.innerWidth - start.left - EDGE_GAP,
    )}px`;

    ref.style.height = `${clamp(
      start.height + e.clientY - start.y,
      minBoxHeight(),
      window.innerHeight - start.top - EDGE_GAP,
    )}px`;
  };

  const handleResizeEnd = () => {
    if (resizeStartRef.current && ref) {
      resizeStartRef.current = undefined;

      chosenRef.current = {
        left: posRef.current[0]!,
        top: posRef.current[1]!,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      };

      persistBox();
    }
  };

  useEffect(() => {
    // Only a move ever moves the chart, so `posRef` always holds where it is
    // now and a release is merely the end of the gesture. Reading the position
    // off the release instead would jump the chart by however far the button
    // travelled unseen — a mouse leaving the window keeps reporting itself,
    // and comes up out there.
    let moved = false;

    const handleWindowPointerDown = (e: PointerEvent) => {
      // Drag only from within the chart itself — not from the toolbar buttons,
      // whose icons are their own <svg> elements.
      if (e.target instanceof Node && svgRef.current?.contains(e.target)) {
        startPosRef.current = [e.clientX, e.clientY];

        moved = false;
      }
    };

    const handleWindowPointerUp = () => {
      if (!startPosRef.current) {
        return;
      }

      startPosRef.current = undefined;

      // A pointer that went down and up on the same spot read a value off the
      // plot rather than moving anything — nothing to store.
      if (moved) {
        persistBox();
      }
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      const start = startPosRef.current;

      if (!start) {
        return;
      }

      const [x, y] = pointerInView(e);

      // Measured from the last point seen — the clamped one — so a pointer
      // that left the window carries the chart no further, and picks it up
      // again from the edge it stopped at.
      posRef.current = [
        posRef.current[0] + x - start[0],
        posRef.current[1] + y - start[1],
      ];

      startPosRef.current = [x, y];

      chosenRef.current = {
        ...chosenRef.current,
        left: posRef.current[0]!,
        top: posRef.current[1]!,
      };

      setPos({ left: posRef.current[0], top: posRef.current[1] });

      moved = true;
    };

    window.addEventListener('pointerdown', handleWindowPointerDown);

    window.addEventListener('pointerup', handleWindowPointerUp);

    window.addEventListener('pointermove', handleWindowPointerMove);

    return () => {
      window.removeEventListener('pointerdown', handleWindowPointerDown);

      window.removeEventListener('pointerup', handleWindowPointerUp);

      window.removeEventListener('pointermove', handleWindowPointerMove);
    };
  }, [persistBox]);

  const handleDownload = () => {
    downloadChartSvg(svgRef.current, width, height);
  };

  return (
    <div
      className={clsx(classes.elevationChart, 'm-2', 'p-2', 'rounded')}
      ref={setRef}
      style={pos}
    >
      <CloseButton onClick={() => dispatch(elevationChartClose())} />

      <svg ref={svgRef} width={width} height={height}>
        {/* Plot background — also the primary pointer target. */}
        <rect
          x={ml}
          y={mt}
          width={width - ml - mr}
          height={height - mt - mb}
          onMouseMove={handlePointerMove} // for mobiles
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          fill="var(--bs-body-bg)"
        />

        {/* Elevation profile: an area fill with its outline, one group per run
            of points with elevation. A missing value breaks the line and its
            fill rather than dropping to the baseline. */}
        <g className="chart">
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
                  stroke={limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'}
                  opacity={limit ? 0.6 : 0.4}
                  strokeDasharray="2 2"
                />
              );
            })}
          </g>

          <g className="grid-vertical">
            {vLines.map((x, i) => {
              const limit = i === vLines.length - 1;

              return (
                <line
                  key={`gx${i}`}
                  x1={mapX(x)}
                  x2={mapX(x)}
                  y1={mt}
                  y2={height - mb}
                  strokeWidth={1}
                  stroke={limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'}
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

            <g className="ticks" stroke="var(--bs-body-color)" strokeWidth={1}>
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

            {/* elevation unit, at the top of the axis */}
            <text
              className="axis-unit"
              x={ml}
              y={mt - 6}
              textAnchor="middle"
              fill="var(--bs-body-color)"
            >
              m
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

            <g className="ticks" stroke="var(--bs-body-color)" strokeWidth={1}>
              {vLines.map((x, i) => {
                const limit = i === vLines.length - 1;

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
                const limit = i === vLines.length - 1;

                // Hide a regular label that would collide with the endpoint or
                // a waypoint's own distance label (drawn in the waypoints layer).
                const show =
                  limit ||
                  (Math.abs(mapX(x) - mapX(vLines.at(-1)!)) > 20 &&
                    !labeledWaypoints.some(
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
                    {nf1.format(x / 1000)}
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
          {labeledWaypoints.map((wp, i) => {
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
                  {nf1.format(wp.distance / 1000)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Transparent interaction overlay on top. */}
        <rect
          x={ml}
          y={mt}
          width={width - ml - mr}
          height={height - mt - mb}
          onPointerDown={handlePointerMove} // for mobiles
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          opacity={0}
        />
      </svg>

      {/* One wrapping row, measured as a whole so the SVG is sized around it
          however many lines it takes. */}
      <div
        className={clsx(
          classes.footer,
          'd-flex flex-wrap align-items-center gap-2 mb-1 mx-2',
        )}
        ref={setRef2}
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
            {!premium && (
              <PremiumGem
                className="ms-1"
                hint={prm?.higherPrecisionElevation}
              />
            )}
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

          <LongPressTooltip label={m?.settings}>
            {({ props }) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  dispatch(setActiveModal({ type: 'map-preferences' }))
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
        </div>
      </div>

      {/* Pinned to the corner instead of ending the toolbar row, which wraps
          its buttons to the left of the next line as the box narrows. Out of
          that row's flow, so it doesn't count towards the height measured for
          the chart either. */}
      <div
        className={classes.resizeHandle}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        // Capture can also be lost without either — the element being moved,
        // say. Ending there too keeps a later button-less hover over the grip
        // from carrying on the gesture. It follows a normal release as well,
        // where the end has already been dealt with.
        onLostPointerCapture={handleResizeEnd}
      >
        <LuMoveDiagonal2 />
      </div>
    </div>
  );
}

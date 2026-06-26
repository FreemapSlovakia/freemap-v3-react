import { useTrackViewerMessages } from '@features/trackViewer/translations/useTrackViewerMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import clsx from 'clsx';
import {
  Fragment,
  ReactElement,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CloseButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  elevationChartClose,
  elevationChartSetActivePoint,
} from '../model/actions.js';
import { ElevationProfilePoint } from '../model/reducer.js';
import classes from './ElevationChart.module.css';

const ml = 50,
  mr = 30,
  mb = 44;

// Matches the SVG font-size set in the CSS module; used to estimate label size.
const FONT_PX = 12;

// Longest waypoint name (in characters) before it's truncated with an ellipsis,
// so one long name can't blow up the chart's top margin.
const WAYPOINT_LABEL_MAX = 16;

const ticks = new Array(11)
  .fill(0)
  .flatMap((_, k) => [1, 2.5, 2, 5].map((x) => x * 10 ** k));

const EMPTY_ARRAY: ElevationProfilePoint[] = [];

export default function ElevationChart(): ReactElement | null {
  const tvm = useTrackViewerMessages();

  const dispatch = useDispatch();

  const elevationProfilePoints = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints ?? EMPTY_ARRAY,
  );

  const waypoints = useAppSelector((state) => state.elevationChart.waypoints);

  // Truncate long names so a single label can't blow up the top margin.
  const labeledWaypoints = useMemo(
    () =>
      waypoints.map((wp) => ({
        ...wp,
        label:
          wp.label && wp.label.length > WAYPOINT_LABEL_MAX
            ? wp.label.slice(0, WAYPOINT_LABEL_MAX - 1) + '…'
            : wp.label,
      })),
    [waypoints],
  );

  // Top margin: 10 px of headroom above the peak in every case, plus room for
  // the tallest angled (-45°) waypoint label when there are waypoints.
  const mt = useMemo(() => {
    const maxChars = labeledWaypoints.reduce(
      (max, wp) => Math.max(max, wp.label?.length ?? 0),
      0,
    );

    return (
      10 +
      (maxChars === 0 ? 0 : Math.ceil(maxChars * FONT_PX * 0.6 * Math.SQRT1_2))
    );
  }, [labeledWaypoints]);

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const nf1 = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

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

  const [pointerX, setPointerX] = useState<number | undefined>();

  const handlePointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;

    setPointerX(x + ml);

    for (const pt of elevationProfilePoints) {
      if (pt.distance > (d / (width - ml - mr)) * x) {
        dispatch(elevationChartSetActivePoint(pt));

        break;
      }
    }
  };

  const handlePointerOut = () => {
    setPointerX(undefined);

    dispatch(elevationChartSetActivePoint(null));
  };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [ref2, setRef2] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) {
      return;
    }

    const ro = new ResizeObserver(([e]) => {
      setWidth(e!.contentRect.width);

      setHeight(e.contentRect.height - (ref2 ? ref2.offsetHeight : 0));
    });

    ref.style.width =
      Math.min(
        Math.max(window.innerWidth / 2, 400),
        Math.max(window.innerWidth - 14, 40),
      ) + 'px';

    ref.style.height =
      Math.min(
        Math.max(window.innerHeight / 2, 300),
        Math.max(window.innerHeight - 130, 40),
      ) + 'px';

    ro.observe(ref);

    return () => ro.disconnect();
  }, [ref, ref2]);

  const startPosRef = useRef<[number, number]>(undefined);

  const posRef = useRef([0, 0]);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleWindowPointerDown = (e: PointerEvent) => {
      if (
        e.target instanceof Element &&
        e.target.matches(
          `.${classes.elevationChart} svg, .${classes.elevationChart} svg *`,
        )
      ) {
        startPosRef.current = [e.clientX, e.clientY];
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (!startPosRef.current) {
        return;
      }

      const pos = [
        e.clientX - startPosRef.current[0] + posRef.current[0],
        e.clientY - startPosRef.current[1] + posRef.current[1],
      ];

      setPos({ left: pos[0], top: pos[1] });

      posRef.current = pos;

      startPosRef.current = undefined;
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!startPosRef.current) {
        return;
      }

      setPos({
        left: posRef.current[0] + e.clientX - startPosRef.current[0],
        top: posRef.current[1] + e.clientY - startPosRef.current[1],
      });
    };

    window.addEventListener('pointerdown', handleWindowPointerDown);

    window.addEventListener('pointerup', handleWindowPointerUp);

    window.addEventListener('pointermove', handleWindowPointerMove);

    return () => {
      window.removeEventListener('pointerdown', handleWindowPointerDown);

      window.removeEventListener('pointerup', handleWindowPointerUp);

      window.removeEventListener('pointermove', handleWindowPointerMove);
    };
  }, []);

  return (
    <div
      className={clsx(classes.elevationChart, 'm-2', 'p-2', 'rounded')}
      ref={setRef}
      style={pos}
    >
      <CloseButton onClick={() => dispatch(elevationChartClose())} />

      <svg width={width} height={height}>
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

        {/* Split into runs of points with elevation; a missing value breaks
            the line and its area fill rather than dropping to the baseline. */}
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
              .map((pt) => mapX(pt.distance) + ',' + mapY(pt.ele))
              .join(' ');

            const baseY = height - mb;

            return (
              <Fragment key={'seg' + i}>
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
              </Fragment>
            );
          });
        })()}

        {pointerX !== undefined && (
          <line
            key="pointerx"
            x1={pointerX}
            x2={pointerX}
            y1={mt}
            y2={height - mb}
            stroke="var(--bs-danger)"
            strokeWidth={1}
          />
        )}

        {hLines.map((y, i) => {
          const limit = hLines.length - i < 3;

          return (
            <Fragment key={'y' + i}>
              <line
                x1={ml}
                x2={width - mr}
                y1={mapY(y)}
                y2={mapY(y)}
                strokeWidth={1}
                stroke={limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'}
                opacity={limit ? 0.6 : 0.4}
                strokeDasharray="2 2"
              />

              {/* tick */}

              <line
                x1={ml - 4}
                x2={ml}
                y1={mapY(y)}
                y2={mapY(y)}
                strokeWidth={1}
                stroke={limit ? 'var(--bs-danger)' : 'var(--bs-body-color)'}
              />

              {(limit ||
                (Math.abs(mapY(y) - mapY(hLines.at(-1)!)) > 14 &&
                  Math.abs(mapY(y) - mapY(hLines.at(-2)!)) > 14)) && (
                <text
                  x={ml - 10}
                  y={mapY(y)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={limit ? 'var(--bs-danger)' : 'var(--bs-body-color)'}
                >
                  {nf0.format(y)}
                </text>
              )}
            </Fragment>
          );
        })}

        {vLines.map((x, i) => {
          const limit = i === vLines.length - 1;

          return (
            <Fragment key={'x' + i}>
              <line
                x1={mapX(x)}
                x2={mapX(x)}
                y1={mt}
                y2={height - mb}
                strokeWidth={1}
                stroke={limit ? 'var(--bs-danger)' : 'var(--bs-secondary)'}
                opacity={limit ? 0.6 : 0.4}
                strokeDasharray="2 2"
              />

              {/* tick */}

              <line
                x1={mapX(x)}
                x2={mapX(x)}
                y1={height - mb}
                y2={height - mb + 4}
                strokeWidth={1}
                stroke={limit ? 'var(--bs-danger)' : 'var(--bs-body-color)'}
              />

              {(limit || Math.abs(mapX(x) - mapX(vLines.at(-1)!)) > 20) && (
                <text
                  x={mapX(x) - 5}
                  y={height - mb + 15}
                  textAnchor="start"
                  dominantBaseline="middle"
                  transform={`rotate(45, ${mapX(x) - 5}, ${height - mb + 15})`}
                  fill={limit ? 'var(--bs-danger)' : 'var(--bs-body-color)'}
                >
                  {nf1.format(x / 1000)}
                </text>
              )}
            </Fragment>
          );
        })}

        {/* x-axis */}
        <line
          x1={ml}
          x2={ml}
          y1={mt}
          y2={height - mb}
          stroke="var(--bs-body-color)"
          strokeWidth={1}
        />

        {/* y-axis */}
        <line
          x1={ml}
          x2={width - mr}
          y1={height - mb}
          y2={height - mb}
          stroke="var(--bs-body-color)"
          strokeWidth={1}
        />

        {/* Waypoints pinned along the profile: a stem, a dot on the line, and
            the name angled up into the top margin (sized to fit the tallest
            label above). Same colour as the elevation line. */}
        {labeledWaypoints.map((wp, i) => {
          const x = mapX(wp.distance);

          return (
            <Fragment key={'wp' + i}>
              <line
                x1={x}
                x2={x}
                y1={mt}
                y2={height - mb}
                stroke="var(--bs-primary)"
                strokeWidth={1}
                opacity={0.6}
              />

              <circle cx={x} cy={mapY(wp.ele)} r={3} fill="var(--bs-primary)" />

              {wp.label && (
                <text
                  x={x + 3}
                  y={mt - 2}
                  textAnchor="start"
                  transform={`rotate(-45, ${x + 3}, ${mt - 2})`}
                  fill="var(--bs-primary)"
                >
                  {wp.label}
                </text>
              )}
            </Fragment>
          );
        })}

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

      {typeof climbUp === 'number' && typeof climbDown === 'number' && (
        <p ref={setRef2}>
          {tvm?.details.uphill}: {nf0.format(climbUp)}&nbsp;m,{' '}
          {tvm?.details.downhill}: {nf0.format(climbDown)}&nbsp;m
        </p>
      )}
    </div>
  );
}

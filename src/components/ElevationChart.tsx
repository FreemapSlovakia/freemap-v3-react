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
} from '../actions/elevationChartActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useNumberFormat } from '../hooks/useNumberFormat.js';
import { useMessages } from '../l10nInjector.js';
import '../styles/elevationChart.scss';

const ml = 50,
  mr = 30,
  mt = 10,
  mb = 44;

const ticks = Array(11)
  .fill(0)
  .flatMap((_, k) => [1, 2.5, 2, 5].map((x) => x * 10 ** k));

export default ElevationChart;

export function ElevationChart(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const elevationProfilePoints = useAppSelector(
    (state) => state.elevationChart.elevationProfilePoints || [],
  );

  const nf0 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const nf1 = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const { climbUp, climbDown } = elevationProfilePoints.at(-1)!;

  const [width, setWidth] = useState(400);

  const [height, setHeight] = useState(300);

  const [mapX, mapY, d, vLines, hLines] = useMemo(() => {
    const eles = elevationProfilePoints.map((pt) => pt.ele);

    const min = Math.min(...eles);

    const max = Math.max(...eles);

    const diff = max - min;

    const chartMin = min - diff / 20;

    const chartMax = max + diff / 20;

    const d = elevationProfilePoints.at(-1)!.distance;

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
  }, [elevationProfilePoints, width, height]);

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

    const ro = new ResizeObserver((e) => {
      setWidth(e[0].contentRect.width);

      setHeight(e[0].contentRect.height - (ref2 ? ref2.offsetHeight : 0));
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
        e.target.matches('.fm-elevation-chart svg, .fm-elevation-chart svg *')
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
      className="fm-elevation-chart m-2 p-2 rounded"
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

        <polygon
          points={
            `${ml},${mapY(elevationProfilePoints[0].ele)} ` +
            elevationProfilePoints
              .map((pt) => mapX(pt.distance) + ',' + mapY(pt.ele))
              .join(' ') +
            ` ${width - mr},${height - mb} ${ml},${height - mb}`
          }
          fill="var(--bs-primary-bg-subtle)"
        />

        <polyline
          points={elevationProfilePoints
            .map((pt) => mapX(pt.distance) + ',' + mapY(pt.ele))
            .join(' ')}
          stroke="var(--bs-primary)"
          strokeWidth={1}
          fill="none"
        />

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
          {m?.trackViewer.details.uphill}: {nf0.format(climbUp)}&nbsp;m,{' '}
          {m?.trackViewer.details.downhill}: {nf0.format(climbDown)}&nbsp;m
        </p>
      )}
    </div>
  );
}

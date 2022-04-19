import {
  elevationChartClose,
  elevationChartSetActivePoint,
} from 'fm3/actions/elevationChartActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useNumberFormat } from 'fm3/hooks/useNumberFormat';
import { useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/elevationChart.scss';
import {
  Fragment,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

const ml = 50,
  mr = 30,
  mt = 20,
  mb = 40;

const ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((k) =>
  [1, 2.5, 2, 5].map((x) => x * 10 ** k),
);

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

  const { climbUp, climbDown } =
    elevationProfilePoints[elevationProfilePoints.length - 1];

  const [width, setWidth] = useState(300);

  const [height, setHeight] = useState(150);

  const [mapX, mapY, min, max, d, xLines, yLines] = useMemo(() => {
    const min = Math.min(...elevationProfilePoints.map((pt) => pt.ele));

    const max = Math.max(...elevationProfilePoints.map((pt) => pt.ele));

    const d =
      elevationProfilePoints[elevationProfilePoints.length - 1].distance;

    function mapX(distance: number) {
      return ml + ((width - ml - mr) * distance) / d;
    }

    function mapY(ele: number) {
      return height - mb - ((ele - min) / (max - min)) * (height - mt - mb);
    }

    const yLines: number[] = [min];

    const yStep = ticks.find((step) => mapY(0) - mapY(step) > 20) ?? 10000;

    for (let y = Math.ceil(min / yStep) * yStep; y < max; y += yStep) {
      yLines.push(y);
    }

    yLines.push(max);

    const xLines: number[] = [0];

    const xStep =
      ticks.find((step) => mapX(step) - mapX(0) > 25) ??
      Number.POSITIVE_INFINITY;

    for (let x = 0; x < d; x += xStep) {
      xLines.push(x);
    }

    xLines.push(d);

    return [mapX, mapY, min, max, d, xLines, yLines];
  }, [elevationProfilePoints, width, height]);

  const [mouseX, setMouseX] = useState<number | undefined>();

  const handleMouseMove = (e: ReactMouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;

    setMouseX(x + ml);

    for (const pt of elevationProfilePoints) {
      if (pt.distance > (d / (width - ml - mr)) * x) {
        dispatch(elevationChartSetActivePoint(pt));

        break;
      }
    }
  };

  const handleMouseOut = () => {
    setMouseX(undefined);

    dispatch(elevationChartSetActivePoint(null));
  };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const [ref2, setRef2] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const ro = new ResizeObserver((e) => {
      setWidth(e[0].contentRect.width);

      setHeight(e[0].contentRect.height - (ref2 ? ref2.offsetHeight : 0));
    });

    if (ref) {
      ref.style.width = window.innerWidth / 2 + 'px';

      ref.style.height = window.innerHeight / 2 + 'px';

      ro.observe(ref);
    }

    return () => {
      ro.disconnect();
    };
  }, [ref, ref2]);

  const startPosRef = useRef<[number, number]>();

  const posRef = useRef([0, 0]);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        e.target instanceof Element &&
        e.target.matches('.elevationChart svg, .elevationChart svg *')
      ) {
        startPosRef.current = [e.clientX, e.clientY];
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (startPosRef.current) {
        const pos = [
          e.clientX - startPosRef.current[0] + posRef.current[0],
          e.clientY - startPosRef.current[1] + posRef.current[1],
        ];

        setPos({ left: pos[0], top: pos[1] });

        posRef.current = pos;

        startPosRef.current = undefined;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (startPosRef.current) {
        setPos({
          left: posRef.current[0] + e.clientX - startPosRef.current[0],
          top: posRef.current[1] + e.clientY - startPosRef.current[1],
        });
      }
    };

    window.addEventListener('mousedown', handleMouseDown);

    window.addEventListener('mouseup', handleMouseUp);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);

      window.removeEventListener('mouseup', handleMouseUp);

      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="elevationChart m-2 p-2 rounded" ref={setRef} style={pos}>
      <Button
        variant="dark"
        size="sm"
        onClick={() => dispatch(elevationChartClose())}
      >
        <FaTimes />
      </Button>

      <svg width={width} height={height}>
        <rect
          x={ml}
          y={mt}
          width={width - ml - mr}
          height={height - mt - mb}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
          fill="white"
        />

        <polygon
          points={
            `${ml},${mapY(elevationProfilePoints[0].ele)} ` +
            elevationProfilePoints
              .map((pt) => mapX(pt.distance) + ',' + mapY(pt.ele))
              .join(' ') +
            ` ${width - mr},${height - mb} ${ml},${height - mb}`
          }
          fill="#cce5ff"
        />

        <polyline
          points={elevationProfilePoints
            .map((pt) => mapX(pt.distance) + ',' + mapY(pt.ele))
            .join(' ')}
          stroke="var(--primary)"
          strokeWidth={1}
          fill="none"
        />

        {mouseX !== undefined && (
          <line
            key="mousex"
            x1={mouseX}
            x2={mouseX}
            y1={mt}
            y2={height - mb}
            stroke="var(--red)"
            strokeWidth={1}
          />
        )}

        {yLines.map((y, i) => (
          <Fragment key={'y' + i}>
            <line
              x1={ml}
              x2={width - mr}
              y1={mapY(y)}
              y2={mapY(y)}
              stroke="black"
              strokeWidth={1}
              opacity={0.2}
              strokeDasharray="2 2"
            />

            {/* tick */}
            <line
              x1={ml - 4}
              x2={ml}
              y1={mapY(y)}
              y2={mapY(y)}
              stroke="black"
              strokeWidth={1}
            />

            {(y === min ||
              y === max ||
              (mapY(min) - mapY(y) > 12 && mapY(y) - mapY(max) > 12)) && (
              <text
                x={ml - 10}
                y={mapY(y)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {nf0.format(y)}
              </text>
            )}
          </Fragment>
        ))}

        {xLines.map((x, i) => (
          <Fragment key={'x' + i}>
            <line
              x1={mapX(x)}
              x2={mapX(x)}
              y1={mt}
              y2={height - mb + 5}
              stroke="black"
              strokeWidth={1}
              opacity={0.2}
              strokeDasharray="2 2"
            />

            {/* tick */}
            <line
              x1={mapX(x)}
              x2={mapX(x)}
              y1={height - mb}
              y2={height - mb + 4}
              stroke="black"
              strokeWidth={1}
            />

            {(x === 0 ||
              x === d ||
              (mapX(x) - mapX(0) > 20 && mapX(d) - mapX(x) > 20)) && (
              <text
                x={mapX(x) - 5}
                y={height - mb + 15}
                textAnchor="start"
                dominantBaseline="middle"
                transform={`rotate(45, ${mapX(x) - 5}, ${height - mb + 15})`}
              >
                {nf1.format(x / 1000)}
              </text>
            )}
          </Fragment>
        ))}

        {/* x-axis */}
        <line
          x1={ml}
          x2={ml}
          y1={mt}
          y2={height - mb}
          stroke="black"
          strokeWidth={1}
        />

        {/* y-axis */}
        <line
          x1={ml}
          x2={width - mr}
          y1={height - mb}
          y2={height - mb}
          stroke="black"
          strokeWidth={1}
        />

        <rect
          x={ml}
          y={mt}
          width={width - ml - mr}
          height={height - mt - mb}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
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

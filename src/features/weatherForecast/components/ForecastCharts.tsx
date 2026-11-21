import {
  CHART_AXIS,
  CHART_GRID,
  CHART_GRID_DASHED,
} from '@shared/chartStyle.js';
import { ViewIndicator } from '@shared/components/ViewIndicator.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { clamp } from '@shared/mathUtils.js';
import {
  type ReactElement,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  type Forecast,
  type ForecastDay,
  type ForecastStep,
  forecastDays,
  KMH_PER_MS,
  stepEnd,
} from '../model/forecast.js';
import { zonedHour } from '../model/timeZone.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import classes from './ForecastCharts.module.css';

// Room for the value labels, "2 000" being the widest.
const LEFT = 42;

const RIGHT = 4;

const HOUR_MS = 3_600_000;

// Zoomed in this far, precipitation shows by the hour rather than by 3 hours.
const HOURLY_PX = 8;

// The narrowest the zoom goes.
const MIN_SPAN_MS = 6 * HOUR_MS;

// What one wheel notch does to the zoom.
const WHEEL_FACTOR = 1.25;

// Rough glyph width at the charts' font size, for fitting labels.
const CHAR_PX = 7.2;

// Steps the hour labels and wind arrows thin out to, as the zoom widens.
const HOUR_STEPS = [1, 2, 3, 6, 12];

const ARROW_STEPS = [1, 2, 3, 6, 12, 24];

const ARROW_PX = 16;

const ARROW_ROW = 18;

const LINE = 16;

// cm of fresh snow per mm of water, as Open-Meteo has it.
const SNOW_CM_PER_MM = 0.7;

const WHOLE_VIEW = { from: 0, to: 1 };

type Axis = {
  x: (t: number) => number;
  days: ForecastDay[];
  /** The time span in view. */
  from: number;
  to: number;
  width: number;
  /** The plot's edges in px. */
  left: number;
  right: number;
  /** The time labels drawn under each chart. */
  labels?: ReactNode;
};

/** The whole forecast as stacked charts on one time axis, zoomed and panned together. */
export function ForecastCharts({
  forecast,
}: {
  forecast: Forecast;
}): ReactElement {
  const m = useWeatherForecastMessages();

  const timeZone = forecast.timeZone ?? undefined;

  const weekdayNarrow = useDateTimeFormat({ weekday: 'narrow', timeZone });

  const dayShort = useDateTimeFormat({
    weekday: 'short',
    day: 'numeric',
    timeZone,
  });

  const date = useDateTimeFormat({ day: 'numeric', timeZone });

  const hourFormat = useDateTimeFormat({ hour: 'numeric', timeZone });

  const ref = useRef<HTMLDivElement>(null);

  const width = useWidth(ref);

  const [view, setView] = useState(WHOLE_VIEW);

  // Another forecast starts unzoomed.
  const [shown, setShown] = useState(forecast);

  if (shown !== forecast) {
    setShown(forecast);

    setView(WHOLE_VIEW);
  }

  const { steps } = forecast;

  const t0 = steps[0]?.time.getTime() ?? 0;

  const t1 = steps.length ? stepEnd(steps.at(-1)!) : 1;

  const layers = [
    m?.charts.layers.high,
    m?.charts.layers.mid,
    m?.charts.layers.low,
  ];

  const plotWidth = width - LEFT - RIGHT;

  const minSpan = Math.min(1, MIN_SPAN_MS / (t1 - t0));

  // About a place: whatever is under the pointer, or between the fingers, stays put.
  const zoomAt = useCallback(
    (x: number, factor: number) => {
      setView(({ from, to }) => {
        const span = to - from;

        const next = clamp(span / factor, minSpan, 1);

        const t = clamp((x - LEFT) / plotWidth, 0, 1);

        const nextFrom = clamp(from + t * span - t * next, 0, 1 - next);

        return { from: nextFrom, to: nextFrom + next };
      });
    },
    [plotWidth, minSpan],
  );

  const panBy = (dx: number) => {
    setView(({ from, to }) => {
      const span = to - from;

      const nextFrom = clamp(from - (dx / plotWidth) * span, 0, 1 - span);

      return { from: nextFrom, to: nextFrom + span };
    });
  };

  // Not through React's handler: it registers wheel passively, so the panel
  // would scroll as well. Only over a plot, so the headers still scroll it.
  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const onWheel = (e: WheelEvent) => {
      // A sideways swipe or tilt has no zoom in it.
      if (
        e.deltaY === 0 ||
        !(e.target instanceof Element) ||
        !e.target.closest('svg')
      ) {
        return;
      }

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

  /** The fingers' spread on the previous move, while pinching. */
  const pinchRef = useRef<number | null>(null);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);

    pointers.current.set(e.pointerId, e.clientX);

    pinchRef.current = null;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(e.pointerId);

    if (previous === undefined) {
      return;
    }

    pointers.current.set(e.pointerId, e.clientX);

    const xs = [...pointers.current.values()];

    if (xs.length < 2) {
      panBy(e.clientX - previous);

      return;
    }

    const spread = Math.abs(xs[0]! - xs[1]!);

    if (pinchRef.current) {
      zoomAt(
        (xs[0]! + xs[1]!) / 2 - e.currentTarget.getBoundingClientRect().left,
        spread / pinchRef.current,
      );
    }

    pinchRef.current = spread || null;
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);

    pinchRef.current = null;
  };

  const zoomed = view.to - view.from < 1;

  const from = t0 + view.from * (t1 - t0);

  const to = t0 + view.to * (t1 - t0);

  const axis: Axis = {
    x: (t) => LEFT + ((t - from) / (to - from)) * plotWidth,
    days: forecastDays(forecast),
    from,
    to,
    width,
    left: LEFT,
    right: width - RIGHT,
  };

  // With a step either side, so the lines run on to the plot's edges.
  const firstIn = steps.findIndex((s) => stepEnd(s) >= from);

  const lastIn = steps.findLastIndex((s) => s.time.getTime() <= to);

  const visible = steps.slice(Math.max(0, firstIn - 1), lastIn + 2);

  // TODO a zone off the whole hour (+5:30) labels steps by an hour they aren't at.
  const hours = visible.map((s) => zonedHour(s.time, forecast.timeZone));

  const pxPerHour = plotWidth / ((to - from) / HOUR_MS);

  const binMs = (pxPerHour >= HOURLY_PX ? 1 : 3) * HOUR_MS;

  // On the clock's 3-hour marks, as the hour labels are, not on the first step.
  const binStart =
    t0 - ((zonedHour(new Date(t0), forecast.timeZone) * HOUR_MS) % binMs);

  const allBins = binned(steps, binStart, t1, binMs);

  const bins = allBins.filter((b) => b.from + binMs >= from && b.from <= to);

  const hourLabelPx =
    Math.max(
      ...steps.slice(0, 24).map((s) => hourFormat.format(s.time).length),
    ) *
      CHAR_PX +
    8;

  const hourStep = HOUR_STEPS.find((k) => k * pxPerHour >= hourLabelPx);

  const arrowStep = ARROW_STEPS.find((k) => k * pxPerHour >= ARROW_PX);

  const freezing = steps.filter((s) => s.freezingLevel !== null);

  const shortFits =
    24 * pxPerHour >=
    Math.max(...axis.days.map((day) => dayShort.format(day.date).length)) *
      CHAR_PX +
      4;

  // Always two lines, so zooming doesn't change the panel's height: the hours
  // over one-line days, or without hours the weekday over the date.
  const dayLabels = axis.days.flatMap((day) => {
    const a = Math.max(day.date.getTime(), from, t0);

    const b = Math.min(day.date.getTime() + 86_400_000, to, t1);

    const text = !hourStep
      ? null
      : shortFits
        ? dayShort.format(day.date)
        : `${weekdayNarrow.format(day.date)} ${date.format(day.date)}`;

    // From the day's start on, flush with the left of its midnight's hour
    // label; from the plot's edge for a day begun before it.
    const x =
      text !== null && a === day.date.getTime()
        ? axis.x(a) - (hourFormat.format(day.date).length * CHAR_PX) / 2
        : axis.x(a) + 2;

    return axis.x(b) - x >= (text === null ? 16 : text.length * CHAR_PX + 4)
      ? [{ day, x, text }]
      : [];
  });

  // Under every chart, so the time is at hand wherever the panel is scrolled.
  axis.labels = (
    <svg
      className={classes.days}
      width={width}
      height={2 * LINE + 6}
      role="presentation"
    >
      {hourStep &&
        visible.map((s, i) => {
          const x = axis.x(s.time.getTime());

          return (
            hours[i]! % hourStep === 0 &&
            x >= axis.left &&
            x <= axis.right && (
              <g key={s.time.getTime()}>
                <line {...CHART_AXIS} x1={x} x2={x} y1={0} y2={4} />

                <text x={x} y={LINE}>
                  {hourFormat.format(s.time)}
                </text>
              </g>
            )
          );
        })}

      <g className={classes.date}>
        {dayLabels.map(({ day, x, text }) =>
          text !== null ? (
            <text key={day.key} x={x} y={2 * LINE + 4}>
              {text}
            </text>
          ) : (
            <g key={day.key}>
              <text x={x} y={LINE}>
                {weekdayNarrow.format(day.date)}
              </text>

              <text x={x} y={2 * LINE + 4}>
                {date.format(day.date)}
              </text>
            </g>
          ),
        )}
      </g>
    </svg>
  );

  return (
    <div
      ref={ref}
      className={`${classes.charts} ${zoomed ? classes.zoomed : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {plotWidth > 0 && steps.length > 0 && (
        <>
          {/* Its room kept unzoomed too, so zooming doesn't shift the charts. */}
          <svg width={width} height={7} role="presentation">
            <ViewIndicator x={LEFT} y={2} width={plotWidth} view={view} />
          </svg>

          <Chart
            title={m?.charts.temperature}
            legend={[
              { className: classes.temperature, label: m?.charts.keys.actual },
              {
                className: classes.feelsLike,
                label: m?.charts.keys.feelsLike,
              },
            ]}
            axis={axis}
            values={steps.flatMap((s) => [
              s.temperature,
              s.apparentTemperature ?? s.temperature,
            ])}
            zero
          >
            {(y) => (
              <>
                <path
                  className={classes.feelsLike}
                  d={line(visible, axis, y, (s) => s.apparentTemperature)}
                />

                <path
                  className={classes.temperature}
                  d={line(visible, axis, y, (s) => s.temperature)}
                />
              </>
            )}
          </Chart>

          <Chart
            title={m?.charts.precipitation({ hours: binMs / HOUR_MS })}
            legend={[
              {
                className: classes.rain,
                label: m?.charts.keys.rain,
                bar: true,
              },
              {
                className: classes.snow,
                label: m?.charts.keys.snow,
                bar: true,
              },
            ]}
            axis={axis}
            values={[0, 1, ...allBins.map((b) => b.rain + b.snow)]}
          >
            {(y) =>
              bins.map((b) => {
                const x = axis.x(b.from) + 0.5;

                const w = axis.x(b.from + binMs) - axis.x(b.from) - 1;

                return (
                  <g key={b.from}>
                    <rect
                      className={classes.rain}
                      x={x}
                      width={w}
                      y={y(b.rain)}
                      height={y(0) - y(b.rain)}
                    />

                    <rect
                      className={classes.snow}
                      x={x}
                      width={w}
                      y={y(b.rain + b.snow)}
                      height={y(b.rain) - y(b.rain + b.snow)}
                    />
                  </g>
                );
              })
            }
          </Chart>

          <Chart
            title={m?.charts.chance}
            axis={axis}
            values={[0, 100]}
            size={70}
          >
            {(y) =>
              bins.map((b) => (
                <rect
                  key={b.from}
                  className={classes.chance}
                  x={axis.x(b.from) + 0.5}
                  width={axis.x(b.from + binMs) - axis.x(b.from) - 1}
                  y={y(b.chance)}
                  height={y(0) - y(b.chance)}
                />
              ))
            }
          </Chart>

          <Chart
            title={m?.charts.clouds}
            axis={axis}
            values={[]}
            size={62}
            rows={layers}
            opaque
          >
            {(y) =>
              visible.flatMap((s) =>
                [s.cloudCoverHigh, s.cloudCoverMid, s.cloudCoverLow].map(
                  (cover, i) =>
                    cover !== null &&
                    cover > 0 && (
                      // Opaque and overlapping the next by a pixel: translucent
                      // abutting rects leave hairline seams.
                      <rect
                        key={`${s.time.getTime()}-${i}`}
                        x={axis.x(s.time.getTime())}
                        width={
                          axis.x(stepEnd(s)) - axis.x(s.time.getTime()) + 1
                        }
                        y={y(3 - i)}
                        height={y(2 - i) - y(3 - i)}
                        style={{
                          fill: `color-mix(in srgb, var(--fc-cloud) ${Math.round(cover)}%, var(--bs-body-bg))`,
                        }}
                      />
                    ),
                ),
              )
            }
          </Chart>

          <Chart
            title={m?.charts.wind}
            legend={[
              { className: classes.wind, label: m?.charts.keys.average },
              { className: classes.gusts, label: m?.charts.keys.gusts },
            ]}
            axis={axis}
            values={[
              0,
              ...steps.map((s) => (s.windGust ?? s.windSpeed) * KMH_PER_MS),
            ]}
            strip={arrowStep ? ARROW_ROW : 0}
          >
            {(y) => (
              <>
                <path
                  className={classes.gusts}
                  d={line(visible, axis, y, (s) =>
                    s.windGust === null ? null : s.windGust * KMH_PER_MS,
                  )}
                />

                <path
                  className={classes.wind}
                  d={line(visible, axis, y, (s) => s.windSpeed * KMH_PER_MS)}
                />

                {arrowStep &&
                  visible.map(
                    (s, i) =>
                      s.windDirection !== null &&
                      hours[i]! % arrowStep === (arrowStep === 24 ? 12 : 0) && (
                        // Points where the wind blows to.
                        <path
                          key={s.time.getTime()}
                          className={classes.arrow}
                          d="M0,6V-6M-3.5,-2L0,-6L3.5,-2"
                          transform={`translate(${axis.x(s.time.getTime()).toFixed(1)},${y.top + y.height + BOTTOM + ARROW_ROW / 2}) rotate(${s.windDirection + 180})`}
                        />
                      ),
                  )}
              </>
            )}
          </Chart>

          {freezing.length > 0 && (
            <Chart
              title={m?.charts.freezing}
              legend={[
                { className: classes.freezing, label: '0 °C' },
                { className: classes.freezingGround, label: '≤ 0 m' },
                ...(forecast.elevation === null
                  ? []
                  : [
                      {
                        className: classes.elevation,
                        label: m?.charts.keys.place,
                      },
                    ]),
              ]}
              axis={axis}
              values={[
                ...(forecast.elevation === null ? [] : [forecast.elevation]),
                ...freezing.map((s) => Math.max(0, s.freezingLevel!)),
              ]}
            >
              {(y) => (
                <>
                  {forecast.elevation !== null && (
                    <line
                      className={classes.elevation}
                      x1={axis.left}
                      x2={axis.right}
                      y1={y(forecast.elevation)}
                      y2={y(forecast.elevation)}
                    />
                  )}

                  <path
                    className={classes.freezing}
                    d={line(visible, axis, y, (s, i) =>
                      s.freezingLevel !== null &&
                      (aloft(s) ||
                        aloft(visible[i - 1]) ||
                        aloft(visible[i + 1]))
                        ? Math.max(0, s.freezingLevel)
                        : null,
                    )}
                  />

                  {/* 0 stands for freezing down to sea level, not a height. */}
                  <path
                    className={classes.freezingGround}
                    d={line(visible, axis, y, (s) =>
                      s.freezingLevel !== null && !aloft(s) ? 0 : null,
                    )}
                  />
                </>
              )}
            </Chart>
          )}
        </>
      )}
    </div>
  );
}

function useWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new ResizeObserver(() => setWidth(el.clientWidth));

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}

type Scale = ((v: number) => number) & { top: number; height: number };

const HEIGHT = 102;

// Clear of the header for the top value label, which straddles its line.
const TOP = 12;

const BOTTOM = 6;

function initial(label: string | undefined): string {
  return label?.charAt(0).toLocaleUpperCase() ?? '';
}

type LegendKey = {
  /** The class of what it draws in the chart. */
  className: string;
  label: string | undefined;
  bar?: boolean;
};

function Chart({
  title,
  legend = [],
  axis,
  values,
  zero,
  size = HEIGHT,
  rows,
  strip = 0,
  opaque,
  children,
}: {
  title: string | undefined;
  legend?: LegendKey[];
  axis: Axis;
  values: number[];
  /** Marks 0 more strongly, as for temperature. */
  zero?: boolean;
  /** The plot's height with its margins. */
  size?: number;
  /** Labelled rows, top first, in place of a value axis; row i spans i to i + 1 from the bottom. */
  rows?: (string | undefined)[];
  /** Room under the plot for the children to draw in. */
  strip?: number;
  /** The children cover the plot: no night shading, the day lines over them. */
  opaque?: boolean;
  children: (y: Scale) => ReactNode;
}): ReactElement {
  const clipId = `fc-${useId().replace(/\W/g, '')}`;

  const ticks = rows
    ? [0, rows.length]
    : niceTicks(Math.min(...values), Math.max(...values));

  // As many decimals as the ticks have, so 0.5 doesn't round to 1 beside 1.
  const tickFormat = useNumberFormat({
    maximumFractionDigits: Math.max(
      ...ticks.map((v) => String(v).split('.')[1]?.length ?? 0),
    ),
  });

  const lo = ticks[0]!;

  const hi = ticks.at(-1)!;

  const height = size - TOP - BOTTOM;

  const y = Object.assign(
    (v: number) => TOP + (1 - (v - lo) / (hi - lo || 1)) * height,
    { top: TOP, height },
  );

  const clip = `url(#${clipId})`;

  return (
    <>
      <div className={classes.header}>
        <span className={classes.title}>{title}</span>

        {legend.map((key) => (
          <span key={key.className} className={classes.key}>
            <svg width="16" height="10" role="presentation">
              {key.bar ? (
                <rect className={key.className} width="12" height="10" />
              ) : (
                <line className={key.className} x1="0" x2="16" y1="5" y2="5" />
              )}
            </svg>
            {key.label}
          </span>
        ))}

        {/* The rows are marked by initials, for the margin to stay narrow. */}
        {rows?.map((label, i) => (
          <span key={label ?? i} className={classes.key}>
            <span className={classes.initial}>{initial(label)}</span>
            {label}
          </span>
        ))}
      </div>

      <svg width={axis.width} height={size + strip} role="presentation">
        <defs>
          <clipPath id={clipId}>
            <rect
              x={axis.left}
              width={axis.right - axis.left}
              height={size + strip}
            />
          </clipPath>
        </defs>

        {!opaque && (
          <g clipPath={clip}>
            {nights(axis).map(([from, to]) => (
              <rect
                key={from}
                className={classes.night}
                x={axis.x(from)}
                width={axis.x(to) - axis.x(from)}
                y={TOP}
                height={height}
              />
            ))}
          </g>
        )}

        {(rows ? [] : ticks).map((v) => (
          <g key={v}>
            <line
              {...(zero && v === 0 ? CHART_AXIS : CHART_GRID)}
              x1={axis.left}
              x2={axis.right}
              y1={y(v)}
              y2={y(v)}
            />

            <text className={classes.tick} x={axis.left - 4} y={y(v) + 4}>
              {tickFormat.format(v)}
            </text>
          </g>
        ))}

        <g clipPath={clip}>
          {opaque && children(y)}

          {/* Over opaque data, as light dashes between the dark ones to show
              on dark cover too; under the rest. */}
          {axis.days.slice(1).map((day) => {
            const x = axis.x(day.date.getTime());

            return (
              <g key={day.key}>
                {opaque && (
                  <line
                    className={classes.dayLight}
                    x1={x}
                    x2={x}
                    y1={TOP}
                    y2={TOP + height}
                  />
                )}

                <line
                  {...(opaque
                    ? { className: classes.dayDark }
                    : CHART_GRID_DASHED)}
                  x1={x}
                  x2={x}
                  y1={TOP}
                  y2={TOP + height}
                />
              </g>
            );
          })}

          {!opaque && children(y)}
        </g>

        {rows?.map((label, i) => (
          <text
            key={label ?? i}
            className={classes.tick}
            x={axis.left - 4}
            y={y(rows.length - i - 0.5) + 4}
          >
            {initial(label)}
          </text>
        ))}

        <path
          {...CHART_AXIS}
          fill="none"
          d={`M${axis.left},${TOP}V${TOP + height}H${axis.right}`}
        />
      </svg>

      {axis.labels}
    </>
  );
}

/** About four round ticks spanning `min` to `max`. */
function niceTicks(min: number, max: number): number[] {
  const span = max - min || 1;

  const raw = span / 3;

  const magnitude = 10 ** Math.floor(Math.log10(raw));

  const step =
    [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= raw) ??
    10 * magnitude;

  const ticks: number[] = [];

  for (
    let v = Math.floor(min / step) * step;
    v <= max + step / 2 && ticks.length < 8;
    v += step
  ) {
    ticks.push(Math.round(v * 1000) / 1000);
  }

  return ticks.at(-1)! < max ? [...ticks, ticks.at(-1)! + step] : ticks;
}

function line(
  steps: ForecastStep[],
  axis: Axis,
  y: Scale,
  value: (s: ForecastStep, i: number) => number | null,
): string {
  let d = '';

  let pen = 'M';

  for (const [i, s] of steps.entries()) {
    const v = value(s, i);

    if (v === null) {
      pen = 'M';

      continue;
    }

    d += `${pen}${axis.x(s.time.getTime()).toFixed(1)},${y(v).toFixed(1)}`;

    pen = 'L';
  }

  return d;
}

function aloft(s: ForecastStep | undefined): boolean {
  return (s?.freezingLevel ?? 0) > 0;
}

type Bin = {
  from: number;
  rain: number;
  snow: number;
  chance: number;
};

/**
 * Precipitation in bins of `binMs`, as mm of water. A step goes whole to the bin
 * it starts in: right for the API's hourly steps and finer ones.
 */
// TODO prorate a step longer than a bin across the bins it covers, as `spanStep` does.
function binned(
  steps: ForecastStep[],
  t0: number,
  t1: number,
  binMs: number,
): Bin[] {
  const bins: Bin[] = [];

  for (let from = t0; from < t1; from += binMs) {
    bins.push({ from, rain: 0, snow: 0, chance: 0 });
  }

  for (const s of steps) {
    const bin = bins[Math.floor((s.time.getTime() - t0) / binMs)];

    if (bin) {
      const snow = (s.snowfall ?? 0) / SNOW_CM_PER_MM;

      // The total holds the snow's water, which the snow bar already shows.
      bin.rain += s.rain ?? Math.max(0, s.precipitation - snow);

      bin.snow += snow;

      bin.chance = Math.max(bin.chance, s.precipitationProbability ?? 0);
    }
  }

  return bins;
}

/** From each sunset to the next sunrise. */
function nights(axis: Axis): [number, number][] {
  const { days } = axis;

  const result: [number, number][] = [];

  const start = days[0]?.steps[0]?.time.getTime();

  const end = days.at(-1)?.steps.at(-1)?.time.getTime();

  if (start === undefined || end === undefined) {
    return result;
  }

  const firstRise = days[0]?.sunrise?.getTime();

  if (firstRise !== undefined && start < firstRise) {
    result.push([start, firstRise]);
  }

  for (const [i, day] of days.entries()) {
    const set = day.sunset?.getTime();

    if (set === undefined) {
      continue;
    }

    const rise = days[i + 1]?.sunrise?.getTime() ?? end;

    result.push([Math.max(set, start), Math.min(rise, end)]);
  }

  return result.filter(([a, b]) => b > a);
}

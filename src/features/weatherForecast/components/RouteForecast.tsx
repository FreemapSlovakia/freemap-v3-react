import {
  type RouteStop,
  type TimedRoute,
  timedPositions,
} from '@features/routePlanner/model/schedule.js';
import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import { ClickableRow } from '@shared/components/ClickableRow.js';
import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { useNow } from '@shared/hooks/useNow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type ReactElement, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import {
  formatTemperature,
  spanStep,
  stepAt,
  stepEnd,
  useForecast,
} from '../model/forecast.js';
import { type RouteRow, routeRows } from '../model/routeRows.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { Precipitation } from './Precipitation.js';
import { WeatherIcon } from './WeatherIcon.js';
import { Wind } from './Wind.js';

/**
 * The weather at the route's forecast steps, start, highest point and finish,
 * leaving at `departure`. `stops[i]` holds the route after leg `i`;
 * `whenPast` says when it is all over.
 */
export function RouteForecast({
  route,
  stops,
  departure,
  whenPast,
  onHover,
  onClick,
}: {
  route: TimedRoute | null;
  stops?: readonly (RouteStop | undefined)[];
  departure: Date;
  whenPast?: boolean;
  onHover?: (row: RouteRow | null) => void;
  onClick?: (row: RouteRow) => void;
}): ReactElement | null {
  const m = useWeatherForecastMessages();

  const now = useNow();

  const departureMs = departure.getTime();

  // A pass over every coordinate: not again at each tick of the clock.
  const positions = useMemo(
    () => (route ? timedPositions(route, stops, departureMs) : null),
    [route, stops, departureMs],
  );

  if (!positions) {
    return null;
  }

  const rows = routeRows(positions, departureMs, now);

  if (rows.length === 0) {
    return whenPast ? <p className="text-muted">{m?.past}</p> : null;
  }

  return (
    <Table size="sm" hover={Boolean(onClick)} className="align-middle">
      <tbody>
        {rows.map((row) => (
          <Row
            key={`${row.kind}:${row.at}`}
            row={row}
            onHover={onHover}
            onClick={onClick}
          />
        ))}
      </tbody>
    </Table>
  );
}

function Row({
  row: sample,
  onHover,
  onClick,
}: {
  row: RouteRow;
  onHover?: (row: RouteRow | null) => void;
  onClick?: (row: RouteRow) => void;
}): ReactElement {
  const { at } = sample;

  const m = useWeatherForecastMessages();

  const loaded = useForecast(sample);

  const name = usePlaceName(sample, true);

  const timeFormat = useDateTimeFormat(WEEKDAY_TIME);

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const forecast = loaded.state === 'done' ? loaded.data : undefined;

  // A row of the last quarter hour may precede the forecast's first step.
  const from = Math.max(at, forecast?.steps[0]?.time.getTime() ?? at);

  // A stop's row speaks for its whole length.
  const step =
    forecast &&
    (sample.until === undefined
      ? stepAt(forecast.steps, from)
      : spanStep(forecast.steps, from, sample.until));

  const lastStep = forecast?.steps.at(-1);

  const elevation = sample.ele ?? forecast?.elevation ?? null;

  const kind =
    sample.kind === 'along'
      ? m?.along({
          distance: `${integerFormat.format(sample.metres / 1000)}\u00a0km`,
        })
      : sample.kind === 'stop'
        ? sample.stop && m?.[sample.stop.kind]
        : m?.[sample.kind];

  return (
    <ClickableRow
      onClick={onClick && (() => onClick(sample))}
      onHover={onHover && ((on) => onHover(on ? sample : null))}
    >
      <td className="ps-2">
        <div className="fw-semibold text-nowrap">
          {timeFormat.format(at)}
          {sample.until !== undefined &&
            ` – ${timeFormat.format(sample.until)}`}
        </div>

        <div className="small text-muted">
          {kind}
          {elevation !== null && ` · ${integerFormat.format(elevation)}\u00a0m`}
        </div>

        {name && <div className="small text-muted">{name}</div>}
      </td>

      {step ? (
        <>
          <td>
            <WeatherIcon weather={step.weather} size={32} />
          </td>

          <td className="text-end text-nowrap">
            {formatTemperature(integerFormat, step.temperature)} °C
          </td>

          <td className="text-end text-nowrap text-info">
            <Precipitation of={step} />
          </td>

          <td className="text-nowrap pe-2">
            <Wind step={step} />
          </td>
        </>
      ) : (
        <td colSpan={4} className="text-muted small pe-2">
          {loaded.state === 'error'
            ? m?.failed
            : !forecast
              ? m?.loading
              : !lastStep
                ? m?.outside
                : at >= stepEnd(lastStep)
                  ? m?.beyond
                  : null}
        </td>
      )}
    </ClickableRow>
  );
}

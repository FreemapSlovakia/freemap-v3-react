import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNow } from '@shared/hooks/useNow.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type ReactElement, useMemo } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { stepAt, stepEnd, useForecast } from '../model/forecast.js';
import {
  type RouteRow,
  routeRows,
  type TimedRoute,
  timedPositions,
} from '../model/routeRows.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { WeatherIcon } from './WeatherIcon.js';
import { Wind } from './Wind.js';

/**
 * The weather where the route is at each of the forecast's steps, and at its
 * start, highest point and finish, for a route leaving at `departure`. Premium;
 * a lock offering it otherwise, which needs no route yet. `whenPast`: say so
 * when the whole route is over, where the departure can be changed.
 */
export function RouteForecast({
  route,
  departure,
  whenPast,
}: {
  route: TimedRoute | null;
  departure: Date;
  whenPast?: boolean;
}): ReactElement | null {
  const m = useWeatherForecastMessages();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const now = useNow();

  // A pass over every coordinate: not again at each tick of the clock.
  const positions = useMemo(
    () => (route ? timedPositions(route) : null),
    [route],
  );

  if (!premium) {
    return (
      <Alert variant="warning" className="d-flex align-items-center gap-2">
        <PremiumGem />

        {m?.locked}
      </Alert>
    );
  }

  if (!positions) {
    return null;
  }

  const rows = routeRows(positions, departure.getTime(), now);

  if (rows.length === 0) {
    return whenPast ? <p className="text-muted">{m?.past}</p> : null;
  }

  return (
    <Table size="sm" className="align-middle">
      <tbody>
        {rows.map((row) => (
          <Row key={`${row.kind}:${row.at}`} row={row} />
        ))}
      </tbody>
    </Table>
  );
}

function Row({ row: sample }: { row: RouteRow }): ReactElement {
  const { at } = sample;

  const m = useWeatherForecastMessages();

  const loaded = useForecast(sample);

  const name = usePlaceName(sample, true);

  const timeFormat = useDateTimeFormat({
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const mmFormat = useNumberFormat({ maximumFractionDigits: 1 });

  const forecast = loaded.state === 'done' ? loaded.data : undefined;

  // A row of the last quarter hour may precede the forecast's first step.
  const step =
    forecast &&
    stepAt(
      forecast.steps,
      Math.max(at, forecast.steps[0]?.time.getTime() ?? at),
    );

  const lastStep = forecast?.steps.at(-1);

  const elevation = sample.ele ?? forecast?.elevation ?? null;

  const kind =
    sample.kind === 'along'
      ? m?.along({
          distance: `${integerFormat.format(sample.metres / 1000)} km`,
        })
      : m?.[sample.kind];

  return (
    <tr>
      <td className="ps-2">
        <div className="fw-semibold text-nowrap">{timeFormat.format(at)}</div>

        <div className="small text-muted">
          {kind}
          {elevation !== null && ` · ${integerFormat.format(elevation)} m`}
        </div>

        {name && <div className="small text-muted">{name}</div>}
      </td>

      {step ? (
        <>
          <td>
            <WeatherIcon weather={step.weather} size={32} />
          </td>

          <td className="text-end text-nowrap">
            {integerFormat.format(step.temperature)} °C
          </td>

          <td className="text-end text-nowrap text-info">
            {step.precipitation >= 0.1 &&
              `${mmFormat.format(step.precipitation)} mm`}
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
              : lastStep && at >= stepEnd(lastStep)
                ? m?.beyond
                : null}
        </td>
      )}
    </tr>
  );
}

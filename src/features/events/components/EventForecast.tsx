import { ForecastFailed } from '@features/weatherForecast/components/ForecastFailed.js';
import { ForecastView } from '@features/weatherForecast/components/ForecastView.js';
import { RouteForecast } from '@features/weatherForecast/components/RouteForecast.js';
import {
  FORECAST_DAYS,
  type ForecastStep,
  stepEnd,
  useForecast,
} from '@features/weatherForecast/model/forecast.js';
import { fetchMapRoute } from '@features/weatherForecast/model/mapRoute.js';
import { zonedDayKey } from '@features/weatherForecast/model/timeZone.js';
import { useWeatherForecastMessages } from '@features/weatherForecast/translations/useWeatherForecastMessages.js';
import { useCached } from '@shared/hooks/useCached.js';
import { useNow } from '@shared/hooks/useNow.js';
import type { ReactElement } from 'react';
import type { EventItem } from '../model/actions.js';

const DAY_MS = 86_400_000;

/** The `YYYY-MM-DD` days a date-only event spans, as it shows them in UTC. */
function utcDays(from: Date, to: Date): Set<string> {
  const days = new Set<string>();

  for (let t = from.getTime(); t <= to.getTime(); t += DAY_MS) {
    days.add(new Date(t).toISOString().slice(0, 10));
  }

  return days;
}

/**
 * The forecast for the event's start point and days, asked for only while the
 * event is under way or starts within the forecast's reach.
 */
export function EventForecast({
  event,
}: {
  event: EventItem;
}): ReactElement | null {
  const m = useWeatherForecastMessages();

  const now = useNow();

  const start = event.startAt.getTime();

  // A date-only end is the midnight starting its last day.
  const end = event.dateOnly
    ? (event.endAt ?? event.startAt).getTime() + DAY_MS
    : (event.endAt?.getTime() ?? start + (event.duration ?? 3600) * 1000);

  const inRange = end > now && start < now + FORECAST_DAYS * DAY_MS;

  const loaded = useForecast(inRange ? event.startPoint : null);

  // Its trip stats come from the linked map's route. A date-only event has no
  // hour to time the route from.
  const routed =
    inRange &&
    !event.dateOnly &&
    event.mapId !== null &&
    event.distance !== null;

  // Not kept: the event's map may be replaced with another route.
  const mapRoute = useCached(
    routed ? `map-route:${event.mapId}` : null,
    () => fetchMapRoute(event.mapId!),
    false,
  );

  const route = mapRoute.state === 'done' ? mapRoute.data : null;

  if (loaded.state === 'idle') {
    return null;
  }

  const heading = (
    <>
      <hr className="my-2" />

      <h6 className="fw-semibold">{m?.title}</h6>
    </>
  );

  if (loaded.state !== 'done') {
    return (
      <>
        {heading}

        {loaded.state === 'error' ? (
          <ForecastFailed retry={loaded.retry} className="py-2 small" />
        ) : (
          <p className="small text-muted">{m?.loading}</p>
        )}
      </>
    );
  }

  const eventDays = event.dateOnly
    ? utcDays(event.startAt, event.endAt ?? event.startAt)
    : undefined;

  const overlaps = (from: number, to: number) => from < end && to > start;

  const coversEvent = (step: ForecastStep) =>
    overlaps(step.time.getTime(), stepEnd(step));

  // A date-only event by its calendar days, as the forecast's days are named.
  const covered = loaded.data.steps.some((step) =>
    eventDays
      ? eventDays.has(zonedDayKey(step.time, loaded.data.timeZone))
      : coversEvent(step),
  );

  if (!covered) {
    return null;
  }

  return (
    <>
      {heading}

      {route && (
        <>
          <p className="small text-muted mb-1">{m?.alongRoute}</p>

          <RouteForecast
            route={route.route}
            stops={route.stops}
            departure={event.startAt}
          />
        </>
      )}

      <ForecastView
        key={event.id}
        forecast={loaded.data}
        collapsed
        days={(day) =>
          eventDays ? eventDays.has(day.key) : day.steps.some(coversEvent)
        }
        highlight={eventDays ? undefined : coversEvent}
      />
    </>
  );
}

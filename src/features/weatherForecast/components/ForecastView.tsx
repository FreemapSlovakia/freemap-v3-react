import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import clsx from 'clsx';
import { type ReactElement, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import {
  type Forecast,
  type ForecastDay,
  type ForecastStep,
  forecastDays,
  formatTemperature,
  MIN_SNOW_DEPTH,
} from '../model/forecast.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DayHours } from './DayHours.js';
import { ForecastFooter } from './ForecastFooter.js';
import classes from './ForecastView.module.css';
import { Precipitation } from './Precipitation.js';
import { WeatherIcon } from './WeatherIcon.js';

/**
 * The forecast by day, one day open at a time with its hours, each of which
 * opens its details; `days` keeps only some, and `highlight` marks steps such
 * as an event's hours, whose first day opens unless `collapsed`.
 */
export function ForecastView({
  forecast,
  days,
  highlight,
  collapsed,
}: {
  forecast: Forecast;
  days?: (day: ForecastDay) => boolean;
  highlight?: (step: ForecastStep) => boolean;
  collapsed?: boolean;
}): ReactElement {
  const m = useWeatherForecastMessages();

  // The place's clock, not the browser's: what one goes by there.
  const timeZone = forecast.timeZone ?? undefined;

  const dayFormat = useDateTimeFormat({
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone,
  });

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const [opened, setOpened] = useState<number | null>(null);

  // Undefined until a day is toggled: then the default below applies.
  const [activeDay, setActiveDay] = useState<string | null>();

  const [instant, setInstant] = useState(false);

  if (forecast.steps.length === 0) {
    return <p className="text-muted">{m?.outside}</p>;
  }

  const all = forecastDays(forecast);

  const shown = days ? all.filter(days) : all;

  const open =
    (highlight && shown.find((d) => d.steps.some(highlight))) ?? shown[0];

  // The default too where a refreshed forecast no longer has the day chosen.
  const chosen = activeDay === null || shown.some((d) => d.key === activeDay);

  const active =
    chosen && activeDay !== undefined
      ? activeDay
      : collapsed
        ? null
        : (open?.key ?? null);

  const temperature = (t: number) =>
    `${formatTemperature(integerFormat, t)} °C`;

  // Not closing over `opened`, so the days' tables needn't re-render on a click.
  const toggle = (time: number) =>
    setOpened((current) => (current === time ? null : time));

  // A day above closing as this one opens would slide this one's header out of
  // sight: both switch at once instead, and the header is scrolled to.
  const select = (key: string | null) => {
    const index = (k: string | null) => shown.findIndex((d) => d.key === k);

    setInstant(
      key !== null && index(active) !== -1 && index(active) < index(key),
    );

    setActiveDay(key);
  };

  const revealHeader = (collapse: HTMLElement) => {
    if (instant) {
      collapse.previousElementSibling?.scrollIntoView({ block: 'nearest' });

      setInstant(false);
    }
  };

  return (
    <>
      <Accordion
        activeKey={active}
        onSelect={(key) => select(typeof key === 'string' ? key : null)}
        className={clsx('mb-2', classes.days, instant && classes.instant)}
      >
        {shown.map((day) => (
          <Accordion.Item key={day.key} eventKey={day.key}>
            <Accordion.Header>
              <span className="w-100 me-2">
                <span className="d-flex align-items-center gap-2">
                  <WeatherIcon
                    weather={{ ...day.weather, day: true }}
                    size={32}
                  />

                  <span className="flex-grow-1 fw-semibold text-nowrap">
                    {dayFormat.format(day.date)}
                  </span>

                  <span
                    className={clsx(
                      'text-info text-end',
                      classes.precipitation,
                    )}
                  >
                    <Precipitation of={day} />
                  </span>

                  <span className={clsx('text-end', classes.temperatures)}>
                    {temperature(day.min)} / {temperature(day.max)}
                  </span>
                </span>

                {day.snowDepth !== null && day.snowDepth >= MIN_SNOW_DEPTH && (
                  <span
                    className={clsx('d-block small text-muted', classes.info)}
                  >
                    {m?.snowDepth({
                      depth: `${integerFormat.format(day.snowDepth)} cm`,
                    })}
                  </span>
                )}
              </span>
            </Accordion.Header>

            {/* A day's hours are built once it first opens, not all 16 days' up front. */}
            <Accordion.Collapse
              eventKey={day.key}
              mountOnEnter
              onEntered={revealHeader}
            >
              <div className="accordion-body p-0">
                <DayHours
                  day={day}
                  opened={
                    opened !== null &&
                    day.steps.some((s) => s.time.getTime() === opened)
                      ? opened
                      : null
                  }
                  onToggle={toggle}
                  highlight={highlight}
                  timeZone={timeZone}
                />
              </div>
            </Accordion.Collapse>
          </Accordion.Item>
        ))}
      </Accordion>

      <ForecastFooter forecast={forecast} />
    </>
  );
}

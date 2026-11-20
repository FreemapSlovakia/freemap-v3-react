import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Accordion, Table } from 'react-bootstrap';
import {
  type Forecast,
  type ForecastDay,
  type ForecastStep,
  forecastDays,
  formatTemperature,
  stepEnd,
} from '../model/forecast.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import classes from './ForecastView.module.css';
import { WeatherIcon } from './WeatherIcon.js';
import { Wind } from './Wind.js';

/**
 * The forecast by day, one day open at a time with its hours; `days` keeps only
 * some, and `highlight` marks steps such as an event's hours, whose first day
 * opens unless `collapsed`.
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

  const dayFormat = useDateTimeFormat({
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });

  const timeFormat = useDateTimeFormat({ hour: '2-digit', minute: '2-digit' });

  const updatedFormat = useDateTimeFormat(WEEKDAY_TIME);

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const mmFormat = useNumberFormat({ maximumFractionDigits: 1 });

  const all = forecastDays(forecast.steps);

  const shown = days ? all.filter(days) : all;

  const open =
    (highlight && shown.find((d) => d.steps.some(highlight))) ?? shown[0];

  const temperature = (t: number) =>
    `${formatTemperature(integerFormat, t)} °C`;

  return (
    <>
      <Accordion
        defaultActiveKey={collapsed ? undefined : open?.key}
        className={`mb-2 ${classes.days}`}
      >
        {shown.map((day) => (
          <Accordion.Item key={day.key} eventKey={day.key}>
            <Accordion.Header>
              <span className="d-flex align-items-center gap-2 w-100 me-2">
                <WeatherIcon
                  weather={{ ...day.weather, day: true }}
                  size={32}
                />

                <span className="fw-semibold flex-grow-1">
                  {dayFormat.format(day.date)}
                </span>

                {day.precipitation >= 0.1 && (
                  <span className="text-info text-nowrap">
                    {mmFormat.format(day.precipitation)} mm
                  </span>
                )}

                <span className="text-nowrap">
                  {temperature(day.min)} / {temperature(day.max)}
                </span>
              </span>
            </Accordion.Header>

            <Accordion.Body className="p-0">
              <Table size="sm" className="mb-0 align-middle">
                <tbody>
                  {day.steps.map((step) => (
                    <tr
                      key={step.time.getTime()}
                      className={
                        highlight?.(step) ? 'table-primary' : undefined
                      }
                    >
                      <td className="text-nowrap ps-2">
                        {timeFormat.format(step.time)}
                        {step.hours > 1 &&
                          `–${timeFormat.format(new Date(stepEnd(step)))}`}
                      </td>

                      <td>
                        <WeatherIcon weather={step.weather} size={28} />
                      </td>

                      <td className="text-end text-nowrap">
                        {temperature(step.temperature)}
                      </td>

                      <td className="text-end text-nowrap text-info">
                        {step.precipitation >= 0.1 &&
                          `${mmFormat.format(step.precipitation)} mm`}
                        {step.precipitationProbability !== null &&
                          step.precipitationProbability > 0 &&
                          ` ${integerFormat.format(step.precipitationProbability)} %`}
                      </td>

                      <td className="text-nowrap pe-2">
                        <Wind step={step} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <p className="small text-body-secondary mb-0">
        {forecast.elevation !== null && (
          <>
            {m?.elevation({
              elevation: integerFormat.format(forecast.elevation),
            })}
            {' · '}
          </>
        )}
        {m?.updated({ time: updatedFormat.format(forecast.updatedAt) })}
        {' · '}
        {m?.source}:{' '}
        <a
          href={forecast.attribution.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {forecast.attribution.name}
        </a>
      </p>
    </>
  );
}

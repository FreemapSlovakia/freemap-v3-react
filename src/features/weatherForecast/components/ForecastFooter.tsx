import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import type { Forecast } from '../model/forecast.js';
import { zoneDifference } from '../model/timeZone.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DetailItems } from './DetailItems.js';

/** What the forecast is for, how fresh it is, and whose it is. */
export function ForecastFooter({
  forecast,
}: {
  forecast: Forecast;
}): ReactElement {
  const m = useWeatherForecastMessages();

  const updatedFormat = useDateTimeFormat({
    ...WEEKDAY_TIME,
    timeZone: forecast.timeZone ?? undefined,
  });

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const first = forecast.steps[0];

  const difference = first && zoneDifference(forecast.timeZone, first.time);

  return (
    <p className="small text-body-secondary mb-0">
      <DetailItems
        items={[
          forecast.elevation !== null &&
            m?.elevation({
              elevation: integerFormat.format(forecast.elevation),
            }),
          difference && m?.localTime({ difference }),
          m?.updated({ time: updatedFormat.format(forecast.updatedAt) }),
          <>
            {m?.source}:{' '}
            <a
              href={forecast.attribution.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {forecast.attribution.name}
            </a>
          </>,
        ]}
      />
    </p>
  );
}

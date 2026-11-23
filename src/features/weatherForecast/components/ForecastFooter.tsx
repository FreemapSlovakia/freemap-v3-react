import type { Loaded } from '@shared/hooks/useCached.js';
import {
  useDateTimeFormat,
  WEEKDAY_TIME,
} from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { Fragment, type ReactElement } from 'react';
import type { Forecast } from '../model/forecast.js';
import type { TerrainSun } from '../model/terrainSun.js';
import { zoneDifference } from '../model/timeZone.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DetailItems } from './DetailItems.js';

/** What the forecast is for, how fresh it is, and whose it is. */
export function ForecastFooter({
  forecast,
  terrainSun,
}: {
  forecast: Forecast;
  terrainSun?: Loaded<TerrainSun>;
}): ReactElement {
  const m = useWeatherForecastMessages();

  const updatedFormat = useDateTimeFormat({
    ...WEEKDAY_TIME,
    timeZone: forecast.timeZone ?? undefined,
  });

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const first = forecast.steps[0];

  const difference = first && zoneDifference(forecast.timeZone, first.time);

  const terrainCredits =
    terrainSun?.state === 'done' ? terrainSun.data.credits : [];

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
          terrainCredits.length > 0 && (
            <>
              {m?.terrainSource}:{' '}
              {terrainCredits.map((credit, i) => (
                <Fragment key={`${credit.name} ${credit.url ?? ''}`}>
                  {i > 0 && ', '}
                  {credit.url ? (
                    <a
                      href={credit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {credit.name}
                    </a>
                  ) : (
                    credit.name
                  )}
                </Fragment>
              ))}
            </>
          ),
        ]}
      />
    </p>
  );
}

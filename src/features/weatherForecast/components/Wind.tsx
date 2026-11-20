import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { WiDirectionUp } from 'react-icons/wi';
import type { ForecastStep } from '../model/forecast.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';

const KMH_PER_MS = 3.6;

/** The wind's arrow, pointing where it goes, its speed and any gusts. */
export function Wind({ step }: { step: ForecastStep }): ReactElement {
  const m = useWeatherForecastMessages();

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const kmh = (ms: number) => integerFormat.format(ms * KMH_PER_MS);

  return (
    <>
      {step.windDirection !== null && (
        <WiDirectionUp
          className="fs-5"
          style={{ transform: `rotate(${step.windDirection + 180}deg)` }}
        />
      )}{' '}
      {kmh(step.windSpeed)} km/h
      {step.windGust !== null && ` (${m?.gusts} ${kmh(step.windGust)})`}
    </>
  );
}

import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { WiDirectionUp } from 'react-icons/wi';
import { type ForecastStep, KMH_PER_MS } from '../model/forecast.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { gustLook } from './hazardLook.js';

/**
 * The wind's arrow, pointing where it goes, its speed and, under it, any
 * gusts, coloured by their strength.
 */
export function Wind({ step }: { step: ForecastStep }): ReactElement {
  const m = useWeatherForecastMessages();

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const kmh = (ms: number) => integerFormat.format(ms * KMH_PER_MS);

  const look = gustLook(step.windGust);

  return (
    <>
      {step.windDirection !== null && (
        <WiDirectionUp
          className="fs-5"
          style={{ transform: `rotate(${step.windDirection + 180}deg)` }}
        />
      )}{' '}
      {kmh(step.windSpeed)} km/h
      {step.windGust !== null && (
        <div className={clsx('small', look.className)} style={look.style}>
          {m?.gusts} {kmh(step.windGust)} km/h
        </div>
      )}
    </>
  );
}

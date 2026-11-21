import { formatDistance } from '@shared/distanceFormatter.js';
import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import {
  type ForecastStep,
  formatTemperature,
  isWet,
  MIN_SNOW_DEPTH,
} from '../model/forecast.js';
import { thunderHazard, thunderLevel } from '../model/hazard.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DetailItems } from './DetailItems.js';
import { hazardClass } from './hazardLook.js';

/** A step's mountain details, each only where it says something. */
export function StepDetails({ step }: { step: ForecastStep }): ReactElement {
  const m = useWeatherForecastMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const int = (v: number, unit: string) => `${integerFormat.format(v)} ${unit}`;

  // A layer the model doesn't give is unknown, not clear.
  const pct = (v: number | null) => (v === null ? '–' : int(v, '%'));

  const thunder = thunderLevel(step.cape);

  return (
    <DetailItems
      items={[
        step.apparentTemperature !== null &&
          Math.abs(step.apparentTemperature - step.temperature) >= 2 &&
          m?.feelsLike({
            temperature: `${formatTemperature(integerFormat, step.apparentTemperature)} °C`,
          }),
        step.snowDepth !== null &&
          step.snowDepth >= MIN_SNOW_DEPTH &&
          m?.snowDepth({ depth: int(step.snowDepth, 'cm') }),
        // Only while something falls.
        step.snowLine !== null &&
          isWet(step) &&
          m?.snowLine({ elevation: int(step.snowLine, 'm') }),
        step.freezingLevel !== null &&
          m?.freezingLevel({ elevation: int(step.freezingLevel, 'm') }),
        (step.cloudCoverLow !== null ||
          step.cloudCoverMid !== null ||
          step.cloudCoverHigh !== null) &&
          m?.clouds({
            low: pct(step.cloudCoverLow),
            mid: pct(step.cloudCoverMid),
            high: pct(step.cloudCoverHigh),
          }),
        step.humidity !== null && m?.humidity({ value: pct(step.humidity) }),
        thunder && (
          <span className={hazardClass(thunderHazard(thunder))}>
            {m?.thunderRisk({ level: m.thunderLevels[thunder] })}
          </span>
        ),
        step.sunshine !== null &&
          step.sunshine > 0 &&
          m?.sunshine({
            duration: formatDuration(step.sunshine * 60, language),
          }),
        step.uvIndex !== null &&
          step.uvIndex >= 1 &&
          m?.uvIndex({ index: integerFormat.format(step.uvIndex) }),
        step.visibility !== null &&
          step.visibility < 10_000 &&
          m?.visibility({
            distance: formatDistance(step.visibility, language),
          }),
      ]}
    />
  );
}

import { formatDuration } from '@shared/durationFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import {
  type ForecastDay,
  isWet,
  KMH_PER_MS,
  maxKnown,
  sumKnown,
} from '../model/forecast.js';
import { gustScale } from '../model/hazard.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DetailItems } from './DetailItems.js';
import { gustLook } from './hazardLook.js';

/**
 * What a day's header doesn't say and its hours would have to be scanned for:
 * sunshine, the strongest gusts, the hours with precipitation and their
 * highest chance, and a UV index worth protecting from.
 */
export function DaySummary({ day }: { day: ForecastDay }): ReactElement | null {
  const m = useWeatherForecastMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const { steps } = day;

  const sunMinutes = sumKnown(steps.map((s) => s.sunshine));

  const gust = maxKnown(steps.map((s) => s.windGust));

  const wetHours = steps.filter(isWet).reduce((sum, s) => sum + s.hours, 0);

  const chance = maxKnown(steps.map((s) => s.precipitationProbability));

  const uv = maxKnown(steps.map((s) => s.uvIndex));

  return (
    <DetailItems
      className="small text-muted px-2 py-1 border-bottom"
      items={[
        day.sunHidden && m?.sunHidden,
        sunMinutes !== null &&
          sunMinutes >= 30 &&
          m?.sunshine({ duration: formatDuration(sunMinutes * 60, language) }),
        // Calm days say nothing of gusts.
        gust !== null && gustScale(gust) && (
          <span {...gustLook(gust)}>
            {m?.gustsMax({
              speed: `${integerFormat.format(gust * KMH_PER_MS)} km/h`,
            })}
          </span>
        ),
        wetHours > 0 &&
          [
            m?.wetHours({ hours: formatDuration(wetHours * 3600, language) }),
            chance !== null &&
              chance > 0 &&
              m?.chanceMax({
                probability: `${integerFormat.format(chance)} %`,
              }),
          ]
            .filter(Boolean)
            .join(', '),
        uv !== null &&
          uv >= 3 &&
          m?.uvIndex({ index: integerFormat.format(uv) }),
      ]}
    />
  );
}

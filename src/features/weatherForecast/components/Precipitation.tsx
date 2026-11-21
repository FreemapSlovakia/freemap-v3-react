import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { FaSnowflake, FaTint, FaUmbrella } from 'react-icons/fa';
import { type ForecastStep, MIN_AMOUNT } from '../model/forecast.js';
import classes from './Precipitation.module.css';

// rem, so the smaller probability line's icon is no smaller.
const ICON_SIZE = '0.7rem';

/**
 * Fresh snow in cm, rain in mm and a chance of precipitation in smaller type,
 * a line each, its icon after it in a slot of its own so the values line up;
 * the total in mm where the forecast doesn't split it. `of` is a step or a day.
 */
export function Precipitation({
  of: { rain, snowfall, precipitation: total },
  probability,
}: {
  of: Pick<ForecastStep, 'rain' | 'snowfall' | 'precipitation'>;
  probability?: number | null;
}): ReactElement | null {
  const format = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const integerFormat = useNumberFormat({ maximumFractionDigits: 0 });

  const line = (value: string, icon: ReactNode, className?: string) => (
    // Spans: the day header puts them in a button, which takes no divs.
    <span className={clsx('d-block', classes.line, className)}>
      {value}
      <span className={classes.icon}>{icon}</span>
    </span>
  );

  const snow = snowfall !== null && snowfall >= MIN_AMOUNT;

  const wet = rain !== null && rain >= MIN_AMOUNT;

  // A forecast that doesn't split the total.
  const unsplit = rain === null && snowfall === null && total >= MIN_AMOUNT;

  const chance = probability != null && probability > 0;

  if (!snow && !wet && !unsplit && !chance) {
    return null;
  }

  return (
    <>
      {snow &&
        line(`${format.format(snowfall)} cm`, <FaSnowflake size={ICON_SIZE} />)}
      {(wet || unsplit) &&
        line(
          `${format.format(wet ? rain : total)} mm`,
          <FaTint size={ICON_SIZE} />,
        )}
      {chance &&
        line(
          `${integerFormat.format(probability)} %`,
          <FaUmbrella size={ICON_SIZE} />,
          'small',
        )}
    </>
  );
}

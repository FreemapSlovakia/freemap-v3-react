import { ClickableRow } from '@shared/components/ClickableRow.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ComponentType, ReactElement } from 'react';
import { Spinner, Table } from 'react-bootstrap';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { WiSunrise, WiSunset } from 'react-icons/wi';
import {
  type ForecastDay,
  type ForecastStep,
  formatTemperature,
  stepEnd,
} from '../model/forecast.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { DaySummary } from './DaySummary.js';
import classes from './ForecastView.module.css';
import { Precipitation } from './Precipitation.js';
import { StepDetails } from './StepDetails.js';
import { WeatherIcon } from './WeatherIcon.js';
import { Wind } from './Wind.js';

type Formats = {
  time: Intl.DateTimeFormat;
  hour: Intl.DateTimeFormat;
  integer: Intl.NumberFormat;
};

/**
 * An open day: its summary, then its hours, each opening its details on a
 * click (`opened`, the open hour if it is one of this day's), with a slim row
 * after the hour the sun rises or sets in; times by the place's `timeZone`.
 */
export function DayHours({
  day,
  opened,
  onToggle,
  highlight,
  timeZone,
  sunLoading = false,
}: {
  day: ForecastDay;
  opened: number | null;
  onToggle: (time: number) => void;
  highlight?: (step: ForecastStep) => boolean;
  timeZone: string | undefined;
  /** The times over the terrain are on their way. */
  sunLoading?: boolean;
}): ReactElement {
  // Shared by the day's rows rather than built in each.
  const formats: Formats = {
    time: useDateTimeFormat({
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    }),
    // The hour a row starts; its sums cover the hour from it.
    hour: useDateTimeFormat({ hour: 'numeric', timeZone }),
    integer: useNumberFormat({ maximumFractionDigits: 0 }),
  };

  return (
    <>
      <DaySummary day={day} />

      <Table size="sm" className="mb-0 align-middle">
        <tbody>
          {day.steps.map((step) => (
            <HourRow
              key={step.time.getTime()}
              step={step}
              day={day}
              open={opened === step.time.getTime()}
              highlighted={highlight?.(step) ?? false}
              onToggle={onToggle}
              formats={formats}
              sunLoading={sunLoading}
            />
          ))}
        </tbody>
      </Table>
    </>
  );
}

/** Whether `at` falls in the hour a step starts. */
function within(at: Date | null, step: ForecastStep): at is Date {
  const t = at?.getTime() ?? Number.NaN;

  return t >= step.time.getTime() && t < stepEnd(step);
}

function HourRow({
  step,
  day,
  open,
  highlighted,
  onToggle,
  formats,
  sunLoading,
}: {
  step: ForecastStep;
  day: ForecastDay;
  open: boolean;
  highlighted: boolean;
  onToggle: (time: number) => void;
  formats: Formats;
  sunLoading: boolean;
}): ReactElement {
  const rowClass = highlighted ? 'table-primary' : undefined;

  // A day the terrain hides the sun still has the level horizon's times.
  const sunrise = day.sunHidden ? day.level.sunrise : day.sunrise;

  const sunset = day.sunHidden ? day.level.sunset : day.sunset;

  return (
    <>
      <ClickableRow
        className={rowClass}
        onClick={() => {
          if (!open) {
            trackMatomo(['trackEvent', 'Weather', 'details']);
          }

          onToggle(step.time.getTime());
        }}
      >
        <td className="text-nowrap ps-2">{formats.hour.format(step.time)}</td>

        <td>
          <WeatherIcon weather={step.weather} size={28} />
        </td>

        <td className="text-end text-nowrap">
          {formatTemperature(formats.integer, step.temperature)} °C
        </td>

        <td className="text-end text-nowrap text-info">
          <Precipitation
            of={step}
            probability={step.precipitationProbability}
          />
        </td>

        <td className="text-nowrap">
          <Wind step={step} />
        </td>

        <td className="text-muted pe-2">
          {open ? <FaAngleUp /> : <FaAngleDown />}
        </td>
      </ClickableRow>

      {open && (
        <tr className={rowClass}>
          <td colSpan={6} className="small ps-2 pe-2">
            <StepDetails step={step} />
          </td>
        </tr>
      )}

      {within(sunrise, step) && (
        <SunRow
          at={sunrise}
          level={day.level.sunrise}
          levelOnly={day.sunHidden}
          loading={sunLoading}
          Icon={WiSunrise}
          format={formats.time}
          className={rowClass}
        />
      )}

      {within(sunset, step) && (
        <SunRow
          at={sunset}
          level={day.level.sunset}
          levelOnly={day.sunHidden}
          loading={sunLoading}
          Icon={WiSunset}
          format={formats.time}
          className={rowClass}
        />
      )}
    </>
  );
}

/** A slim row among the hours where the sun rises or sets. */
function SunRow({
  at,
  level,
  levelOnly,
  loading,
  Icon,
  format,
  className,
}: {
  at: Date;
  /** Over a level horizon; `at` is over the terrain where it differs. */
  level: Date | null;
  /** `at` is over a level horizon: the terrain hides the sun all day. */
  levelOnly: boolean;
  loading: boolean;
  Icon: ComponentType<{ className?: string }>;
  format: Intl.DateTimeFormat;
  /** The hour's, so a highlighted stretch isn't broken by it. */
  className?: string;
}): ReactElement {
  const m = useWeatherForecastMessages();

  const shown = format.format(at);

  // Said only where the terrain moves it by a minute or more.
  const levelShown = level && format.format(level);

  return (
    <tr className={className}>
      <td colSpan={6} className="small text-muted ps-2 py-0">
        <Icon className={classes.sunIcon} /> {shown}
        {levelOnly ? (
          <> {m?.overLevel}</>
        ) : (
          levelShown &&
          levelShown !== shown && <> {m?.overTerrain({ level: levelShown })}</>
        )}
        {loading && (
          <>
            {' '}
            <Spinner size="sm" />
          </>
        )}
      </td>
    </tr>
  );
}

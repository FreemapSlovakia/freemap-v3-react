import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { selectRecorderSegments } from '../model/selectors.js';
import { computeRecorderStats } from '../stats.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';

/** `h:mm:ss`, dropping the hours until there are any. */
function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));

  const seconds = String(total % 60).padStart(2, '0');

  const minutes =
    total >= 3600
      ? String(Math.floor(total / 60) % 60).padStart(2, '0')
      : String(Math.floor(total / 60));

  return total >= 3600
    ? `${Math.floor(total / 3600)}:${minutes}:${seconds}`
    : `${minutes}:${seconds}`;
}

type ItemProps = { label: string | undefined; value: string };

function Item({ label, value }: ItemProps): ReactElement {
  return (
    <span className="text-nowrap">
      <span className="text-body-secondary">{label}</span>{' '}
      <strong>{value}</strong>
    </span>
  );
}

/**
 * The live readout. Everything here is derived from the points already held, so
 * it needs nothing from the recorder beyond the fixes themselves — it keeps
 * updating (and stays correct) even when the live view is gone.
 */
export function GpsRecorderStats(): ReactElement | null {
  const m = useGpsRecorderMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const segments = useAppSelector(selectRecorderSegments);

  const stats = useMemo(() => computeRecorderStats(segments), [segments]);

  const speedFormat = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        style: 'unit',
        unit: 'kilometer-per-hour',
        maximumFractionDigits: 1,
      }),
    [language],
  );

  // `formatDistance` keeps five significant digits, which reads as noise on
  // values that change every second and are only good to a metre anyway.
  const metersFormat = useMemo(
    () =>
      new Intl.NumberFormat(language, {
        style: 'unit',
        unit: 'meter',
        maximumFractionDigits: 0,
      }),
    [language],
  );

  if (stats.points === 0) {
    return null;
  }

  const latest = segments.at(-1)?.at(-1);

  return (
    <div className="d-flex flex-wrap column-gap-3 align-self-center ms-2 small">
      <Item
        label={m?.stats.distance}
        value={formatDistance(stats.distance, language)}
      />

      <Item
        label={m?.stats.duration}
        value={formatDuration(stats.recordedDuration)}
      />

      {stats.ascent > 0 && (
        <Item
          label={m?.stats.ascent}
          value={metersFormat.format(stats.ascent)}
        />
      )}

      {stats.speed !== null && (
        <Item
          label={m?.stats.speed}
          value={speedFormat.format(stats.speed * 3.6)}
        />
      )}

      {latest?.acc != null && (
        <Item
          label={m?.stats.accuracy}
          value={metersFormat.format(latest.acc)}
        />
      )}

      <Item label={m?.stats.points} value={String(stats.points)} />

      {stats.segments > 1 && (
        <Item label={m?.stats.segments} value={String(stats.segments)} />
      )}
    </div>
  );
}

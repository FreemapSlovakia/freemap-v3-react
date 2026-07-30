import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
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

type Row = { label: string | undefined; value: string };

/**
 * The live readout: distance and time in the toolbar, everything else a tap
 * away.
 *
 * The toolbar is a single row of controls in every other tool, so the metrics
 * cannot all sit in it — seven of them wrap onto three lines on a phone and push
 * the toolbar down over the map. Only the two worth a glance stay inline; the
 * rest live in a dropdown, which keeps updating while it is open because it
 * reads the same state.
 *
 * Everything here is derived from the points already held, so it needs nothing
 * from the recorder beyond the fixes themselves — it stays correct even when the
 * live view is gone.
 */
export function GpsRecorderReadout(): ReactElement {
  const m = useGpsRecorderMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const paused = useAppSelector((state) => state.gpsRecorder.paused);

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

  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(language, { timeStyle: 'medium' }),
    [language],
  );

  // Paused is checked first: the recorder keeps `recording` true across a pause,
  // so it says which of the two live states this is.
  const stateLabel = paused
    ? m?.state.paused
    : status?.recording
      ? m?.state.recording
      : status
        ? m?.state.stopped
        : m?.state.unknown;

  const connectionLabel =
    connection === 'live'
      ? m?.connection.live
      : connection === 'connecting'
        ? m?.connection.connecting
        : connection === 'syncing'
          ? m?.connection.syncing
          : connection === 'reconnecting'
            ? m?.connection.reconnecting
            : m?.connection.offline;

  const state: ReactNode = (
    <>
      {stateLabel}
      <span className="text-body-secondary"> · {connectionLabel}</span>
    </>
  );

  // Nothing recorded yet: the state is short enough to say in the row itself,
  // and a dropdown whose only content is that same line would be a tap for
  // nothing.
  if (stats.points === 0) {
    return (
      <span className="align-self-center ms-2 text-nowrap small">{state}</span>
    );
  }

  const latest = segments.at(-1)?.at(-1);

  const rows: Row[] = [
    {
      label: m?.stats.distance,
      value: formatDistance(stats.distance, language),
    },
    { label: m?.stats.duration, value: formatDuration(stats.recordedDuration) },
  ];

  if (stats.ascent > 0) {
    rows.push({
      label: m?.stats.ascent,
      value: metersFormat.format(stats.ascent),
    });
  }

  if (stats.speed !== null) {
    rows.push({
      label: m?.stats.speed,
      value: speedFormat.format(stats.speed * 3.6),
    });
  }

  if (stats.averageSpeed !== null) {
    rows.push({
      label: m?.stats.avgSpeed,
      value: speedFormat.format(stats.averageSpeed * 3.6),
    });
  }

  if (latest?.acc != null) {
    rows.push({
      label: m?.stats.accuracy,
      value: metersFormat.format(latest.acc),
    });
  }

  rows.push({ label: m?.stats.points, value: String(stats.points) });

  if (stats.segments > 1) {
    rows.push({ label: m?.stats.segments, value: String(stats.segments) });
  }

  if (latest) {
    rows.push({
      label: m?.stats.lastFix,
      value: timeFormat.format(latest.ts),
    });
  }

  return (
    <Dropdown align="start" className="ms-1">
      {/* The summary must never wrap — it is what keeps the toolbar one row tall. */}
      <Dropdown.Toggle
        variant="secondary"
        className="text-nowrap"
        aria-label={m?.details}
      >
        {/* Says how the live view is doing without spending words on it; the
            dropdown spells the same thing out. */}
        <FaCircle
          size={8}
          className={clsx(
            'align-middle',
            connection === 'live'
              ? 'text-success'
              : connection === 'idle'
                ? 'text-body-secondary'
                : 'text-warning',
          )}
          aria-hidden
        />{' '}
        {formatDistance(stats.distance, language)}
        {' · '}
        {formatDuration(stats.recordedDuration)}
      </Dropdown.Toggle>

      <FmDropdownMenu>
        {/* A minimum width so the box doesn't twitch as the numbers change. */}
        <div className="px-3 py-1" style={{ minWidth: '15rem' }}>
          <div className="mb-2">{state}</div>

          {rows.map((row) => (
            <div
              key={row.label}
              className="d-flex justify-content-between gap-4"
            >
              <span className="text-body-secondary">{row.label}</span>

              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </FmDropdownMenu>
    </Dropdown>
  );
}

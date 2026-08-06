import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import clsx from 'clsx';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { FaCircle } from 'react-icons/fa';
import { recorderBackendKind } from '../backend.js';
import {
  selectLatestRecorderPoint,
  selectRecorderStats,
} from '../model/selectors.js';
import { gpsRecorderPlatformSupported } from '../support.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';
import classes from './GpsRecorderReadout.module.css';

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

// `id` rather than the label: the labels come from a lazily loaded bundle and are
// all `undefined` until it lands, which would make them the same React key.
type Row = { id: string; label: string | undefined; value: string };

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

  const stats = useAppSelector(selectRecorderStats);

  const latest = useAppSelector(selectLatestRecorderPoint);

  // Only where the recorder app was an alternative. Off Android there is nothing
  // to contrast it with, and a badge that can only ever read one way is noise —
  // what browser recording costs is said when the ride starts instead.
  const browserBadge = useAppSelector(
    (state) =>
      gpsRecorderPlatformSupported && recorderBackendKind(state) === 'browser',
  );

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

  /**
   * Said out loud only when it is *not* what the user expects. `Recording` is
   * already on the transport button, `Stopped` adds nothing to a button that says
   * Record, and `Live` is only worth a word when it stops being true — the dot on
   * the chip carries that at a glance. What is left is the states the user can act
   * on: nothing connected yet, a connection being made, or a live view that has
   * gone away while the recorder carries on regardless.
   */
  const notice: ReactNode = !status
    ? m?.state.unknown
    : connection === 'connecting'
      ? m?.connection.connecting
      : connection === 'syncing'
        ? m?.connection.syncing
        : connection === 'reconnecting'
          ? m?.connection.reconnecting
          : connection === 'idle'
            ? m?.connection.offline
            : null;

  // Nothing recorded yet: there are no figures to summarize, so the row carries
  // whatever there is to say — often nothing at all.
  if (stats.points === 0) {
    return notice === null ? (
      <></>
    ) : (
      <span className="align-self-center ms-2 text-nowrap small">{notice}</span>
    );
  }

  const rows: Row[] = [
    {
      id: 'distance',
      label: m?.stats.distance,
      value: formatDistance(stats.distance, language),
    },
    {
      id: 'duration',
      label: m?.stats.duration,
      value: formatDuration(stats.recordedDuration),
    },
  ];

  // Above mean sea level, which is the elevation a map reads in — `alt` is
  // metres above the ellipsoid and sits some 42 m higher over Slovakia. The
  // fallback is not cosmetic: `altMsl` is null below Android 14 and until a GNSS
  // fix has been seen, so the opening fixes of a recording carry only `alt`.
  const elevation = latest ? (latest.altMsl ?? latest.alt) : null;

  if (elevation !== null) {
    rows.push({
      id: 'elevation',
      label: m?.stats.elevation,
      value: metersFormat.format(elevation),
    });
  }

  if (stats.ascent > 0) {
    rows.push({
      id: 'ascent',
      label: m?.stats.ascent,
      value: metersFormat.format(stats.ascent),
    });
  }

  if (stats.speed !== null) {
    rows.push({
      id: 'speed',
      label: m?.stats.speed,
      value: speedFormat.format(stats.speed * 3.6),
    });
  }

  if (stats.averageSpeed !== null) {
    rows.push({
      id: 'avgSpeed',
      label: m?.stats.avgSpeed,
      value: speedFormat.format(stats.averageSpeed * 3.6),
    });
  }

  if (latest?.acc != null) {
    rows.push({
      id: 'accuracy',
      label: m?.stats.accuracy,
      value: metersFormat.format(latest.acc),
    });
  }

  // Absent whenever the receiver hasn't reported recently enough to speak for
  // this fix — a network fix, or a duty-cycled receiver between sparse fixes —
  // so the row goes away rather than claiming zero satellites.
  if (latest?.sat != null) {
    rows.push({
      id: 'satellites',
      label: m?.stats.satellites,
      value: String(latest.sat),
    });
  }

  rows.push({
    id: 'points',
    label: m?.stats.points,
    value: String(stats.points),
  });

  if (stats.segments > 1) {
    rows.push({
      id: 'segments',
      label: m?.stats.segments,
      value: String(stats.segments),
    });
  }

  if (latest) {
    rows.push({
      id: 'lastFix',
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
            dropdown spells the same thing out. A dot for the two settled states,
            and a spinner for the ones in between — the figures next to it have
            stopped advancing then, and a still dot over frozen numbers reads as a
            live recording that has merely stood still. */}
        {connection === 'live' || connection === 'idle' ? (
          <FaCircle
            size={8}
            className={clsx(
              'align-middle',
              connection === 'live' ? 'text-success' : 'text-body-secondary',
            )}
            aria-hidden
          />
        ) : (
          <Spinner
            animation="border"
            size="sm"
            className={clsx('align-middle', classes.connectingSpinner)}
            aria-hidden
          />
        )}{' '}
        {formatDistance(stats.distance, language)}
        {' · '}
        {formatDuration(stats.recordedDuration)}
      </Dropdown.Toggle>

      <FmDropdownMenu>
        {/* A minimum width so the box doesn't twitch as the numbers change. */}
        <div className="px-3 py-1" style={{ minWidth: '15rem' }}>
          {/* The details view is where spelling it out belongs, so the state and
              the live view are named here even when they are nominal. */}
          <div className="mb-2">
            {status?.recording ? m?.state.recording : m?.state.stopped}
            <span className="text-body-secondary">
              {' · '}
              {connection === 'live'
                ? m?.connection.live
                : connection === 'connecting'
                  ? m?.connection.connecting
                  : connection === 'syncing'
                    ? m?.connection.syncing
                    : connection === 'reconnecting'
                      ? m?.connection.reconnecting
                      : m?.connection.offline}

              {browserBadge && (
                <>
                  {' · '}
                  {m?.browserBadge}
                </>
              )}
            </span>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="d-flex justify-content-between gap-4">
              <span className="text-body-secondary">{row.label}</span>

              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </FmDropdownMenu>
    </Dropdown>
  );
}

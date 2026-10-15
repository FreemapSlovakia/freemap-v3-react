import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type ReactElement, useMemo } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { moonIllumination, type SkyBody } from '../sky/astro.js';
import type { TrackSample } from '../sky/track.js';
import type { SkyTrack } from '../sky/useSky.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

const SKY_INK: Record<SkyBody, string> = {
  sun: '#ffd34d',
  moon: '#dfe8ff',
};

const HALO = 'rgba(0, 0, 0, 0.55)';

/** How far under the frame a path is still followed before it is dropped. */
const BELOW_FRAME_DEG = 2;

/** Smallest a disc is drawn, so a fit view still shows one. */
const MIN_DISC_PX = 3;

/**
 * The crossings as times, beside the toolbar — the one place they still hold
 * under a lifted picture, which draws no paths.
 */
export function PanoramaSkyTimes({
  tracks,
}: {
  tracks: SkyTrack[];
}): ReactElement | null {
  const timeFormat = useDateTimeFormat({ timeStyle: 'short' });

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  const m = usePanoramaMessages();

  return (
    <>
      {tracks.map(
        // The moon's phase is worth saying on a day it crosses nothing.
        (track) =>
          (track.events.length > 0 || track.body === 'moon') && (
            <span
              key={track.body}
              className="d-inline-flex align-items-center gap-1"
            >
              {track.body === 'sun' ? <FaSun /> : <FaMoon />}

              {track.events.map((event) => (
                <span key={event.time}>
                  {event.kind === 'rise' ? '↑' : '↓'}
                  {timeFormat.format(event.time)}
                </span>
              ))}

              {/* At noon of the day shown, which is near enough for a phase. */}
              {track.body === 'moon' && (
                <span className="text-body-secondary">
                  (
                  {m?.sky.lit(
                    nfPercent.format(
                      moonIllumination(track.dayStart + 12 * 3_600_000),
                    ),
                  )}
                  )
                </span>
              )}
            </span>
          ),
      )}
    </>
  );
}

/** A stretch of path in one style, keyed by when it starts. */
type Segment = { key: number; visible: boolean; samples: TrackSample[] };

/**
 * The path split where it leaves the frame, the picture cannot say, or the
 * centre goes behind terrain — none of which a pan changes.
 */
function segmentsOf(samples: TrackSample[], altMin: number): Segment[] {
  const segments: Segment[] = [];

  let current: Segment | null = null;

  for (const sample of samples) {
    const visible = sample.centreVisible;

    if (visible === null || sample.altitude < altMin - BELOW_FRAME_DEG) {
      current = null;

      continue;
    }

    if (current && current.visible !== visible) {
      // Shared, so the solid and the dashed parts meet.
      current.samples.push(sample);

      current = null;
    }

    if (!current) {
      current = { key: sample.time, visible, samples: [] };

      segments.push(current);
    }

    current.samples.push(sample);
  }

  return segments.filter((segment) => segment.samples.length > 1);
}

type Props = {
  tracks: SkyTrack[];
  /** Where a bearing lands in the viewport; see `PanoramaView`. */
  screenX: (azimuth: number) => number;
  /** Where an altitude lands in the viewport. */
  screenY: (altitude: number) => number;
  width: number;
  altMin: number;
};

/**
 * The day's paths over the picture: solid where the body's centre clears the
 * skyline, dashed behind terrain, with the hours, the crossings and — today —
 * where it is now.
 */
export function PanoramaSky({
  tracks,
  screenX,
  screenY,
  width,
  altMin,
}: Props): ReactElement {
  const hourFormat = useDateTimeFormat({ hour: 'numeric' });

  const timeFormat = useDateTimeFormat({ timeStyle: 'short' });

  // What a pan leaves alone, worked out once per day rather than per frame.
  const layout = useMemo(
    () =>
      tracks.map((track) => ({
        track,
        segments: segmentsOf(track.samples, altMin),
        // Whole minutes from midnight: crossing samples fall between them, and
        // counted from the epoch an old zone's offset with seconds has none.
        hours: track.samples
          .filter(
            (s) =>
              s.centreVisible !== null &&
              s.altitude >= altMin - BELOW_FRAME_DEG &&
              (s.time - track.dayStart) % 60_000 === 0 &&
              new Date(s.time).getMinutes() === 0,
          )
          .map((sample) => ({ sample, text: hourFormat.format(sample.time) })),
        events: track.events.map((event) => ({
          ...event,
          text: timeFormat.format(event.time),
        })),
      })),
    [altMin, hourFormat, timeFormat, tracks],
  );

  const disc = (altitude: number, radius: number) =>
    Math.max(MIN_DISC_PX, screenY(altitude - radius) - screenY(altitude));

  return (
    <g>
      {layout.map(({ track, segments, hours, events }) => {
        const ink = SKY_INK[track.body];

        const now = track.now;

        return (
          <g key={track.body} fill="none">
            {segments.flatMap((segment) =>
              wrapRuns(segment, screenX, screenY, width).map((run) => (
                <g key={run.key} opacity={segment.visible ? 1 : 0.5}>
                  <polyline points={run.points} stroke={HALO} strokeWidth={3} />

                  <polyline
                    points={run.points}
                    stroke={ink}
                    strokeWidth={1.5}
                    strokeDasharray={segment.visible ? undefined : '4 4'}
                  />
                </g>
              )),
            )}

            {hours.map(({ sample, text }) => {
              const x = screenX(sample.azimuth);

              const y = screenY(sample.altitude);

              return (
                <g key={sample.time}>
                  <circle cx={x} cy={y} r={2.5} fill={ink} stroke={HALO} />

                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill={ink}
                    stroke={HALO}
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {text}
                  </text>
                </g>
              );
            })}

            {/* The disc at its true size, so at a crossing its top edge is what
                touches the skyline. */}
            {events.map((event) => {
              const x = screenX(event.azimuth);

              const y = screenY(event.altitude);

              const r = disc(event.altitude, event.radius);

              return (
                <g key={event.time}>
                  <circle cx={x} cy={y} r={r} stroke={ink} strokeWidth={1.5} />

                  <text
                    x={x}
                    y={y + r + 13}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="bold"
                    fill={ink}
                    stroke={HALO}
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {event.kind === 'rise' ? '↑' : '↓'} {event.text}
                  </text>
                </g>
              );
            })}

            {/* Solid only where the path is: the centre over a readable skyline. */}
            {now && (
              <circle
                cx={screenX(now.azimuth)}
                cy={screenY(now.altitude)}
                r={disc(now.altitude, now.radius)}
                fill={now.centreVisible ? ink : 'none'}
                stroke={now.centreVisible ? HALO : ink}
                strokeWidth={1.5}
                opacity={now.centreVisible ? 1 : 0.5}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * A segment's points on screen, split where a full turn wraps — a jump across
 * the panel is the path leaving one edge and coming in at the other.
 */
function wrapRuns(
  segment: Segment,
  screenX: (azimuth: number) => number,
  screenY: (altitude: number) => number,
  width: number,
): { key: string; points: string }[] {
  const runs: { key: string; points: string }[] = [];

  let points: string[] = [];

  let lastX = 0;

  const close = () => {
    if (points.length > 1) {
      runs.push({
        key: `${segment.key}-${runs.length}`,
        points: points.join(' '),
      });
    }

    points = [];
  };

  for (const sample of segment.samples) {
    const x = screenX(sample.azimuth);

    if (points.length && Math.abs(x - lastX) > width / 2) {
      close();
    }

    points.push(`${x.toFixed(1)},${screenY(sample.altitude).toFixed(1)}`);

    lastX = x;
  }

  close();

  return runs;
}

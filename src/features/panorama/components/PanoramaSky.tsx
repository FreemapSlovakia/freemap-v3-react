import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { LatLon } from '@shared/types/common.js';
import { type ReactElement, useMemo } from 'react';
import { FaSun } from 'react-icons/fa';
import {
  brightLimbAngle,
  moonAge,
  moonIllumination,
  type SkyBody,
} from '../sky/astro.js';
import type { TrackSample } from '../sky/track.js';
import type { SkyTrack } from '../sky/useSky.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import { MoonPhase, moonLitPath } from './MoonPhase.js';

const SKY_INK: Record<SkyBody, string> = {
  sun: '#ffd34d',
  moon: '#dfe8ff',
};

const HALO = 'rgba(0, 0, 0, 0.55)';

const RAD = Math.PI / 180;

/** A crossing's disc stays see-through: the skyline across it is the point. */
const CROSSING_FILL: Record<SkyBody, number> = {
  sun: 0.35,
  moon: 0.45,
};

const NOW_FILL = 0.8;

const MOON_DARK_FILL = 0.3;

/** How far under the frame a path is still followed before it is dropped. */
const BELOW_FRAME_DEG = 2;

/** Smallest a disc is drawn, so a fit view still shows one. */
const MIN_DISC_PX = 3;

/** The crossings as times, beside the toolbar, with the moon's phase. */
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
        (track) => {
          if (track.events.length === 0 && track.body !== 'moon') {
            return null;
          }

          // Noon of the day shown, which is near enough for a phase.
          const noon = track.dayStart + 12 * 3_600_000;

          return (
            <span
              key={track.body}
              className="d-inline-flex align-items-center gap-1"
            >
              {track.body === 'sun' ? (
                <FaSun />
              ) : (
                <MoonPhase
                  age={moonAge(noon)}
                  south={track.viewpoint.lat < 0}
                />
              )}

              {track.events.map((event) => (
                <span key={event.time}>
                  {event.kind === 'rise' ? '↑' : '↓'}
                  {timeFormat.format(event.time)}
                </span>
              ))}

              {track.body === 'moon' && (
                <span className="text-body-secondary">
                  ({m?.sky.lit(nfPercent.format(moonIllumination(noon)))})
                </span>
              )}
            </span>
          );
        },
      )}
    </>
  );
}

/** Lit fraction below which the moon is left as its outline alone. */
const MIN_LIT = 0.01;

type MoonFace = { d: string; rotate: number };

/**
 * The moon's lit part as the picture draws it, or `null` near new moon, where
 * the terminator's stroke would trace a crescent that isn't there.
 */
function moonFace(
  time: number,
  altitude: number,
  { lat, lon }: LatLon,
): MoonFace | null {
  const age = moonAge(time);

  if ((1 - Math.cos(age * RAD)) / 2 < MIN_LIT) {
    return null;
  }

  const limb = brightLimbAngle(time, lat, lon) * RAD;

  // The picture is equirectangular: east-west is stretched by 1/cos(altitude).
  const onScreen = Math.atan2(
    Math.sin(limb) / Math.cos(altitude * RAD),
    Math.cos(limb),
  );

  return { d: moonLitPath(age), rotate: onScreen / RAD - 90 };
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
          moon:
            track.body === 'moon'
              ? moonFace(event.time, event.altitude, track.viewpoint)
              : null,
        })),
        nowMoon:
          track.body === 'moon' && track.now
            ? moonFace(track.now.time, track.now.altitude, track.viewpoint)
            : null,
      })),
    [altMin, hourFormat, timeFormat, tracks],
  );

  const disc = (altitude: number, radius: number) =>
    Math.max(MIN_DISC_PX, screenY(altitude - radius) - screenY(altitude));

  return (
    <g>
      {layout.map(({ track, segments, hours, events, nowMoon }) => {
        const ink = SKY_INK[track.body];

        const now = track.now;

        // The lit face: the whole disc for the sun, the phase for the moon.
        // `ring` is the disc's outline colour, which the terminator matches.
        const face = (
          moon: MoonFace | null,
          x: number,
          y: number,
          r: number,
          fillOpacity: number,
          ring: string,
        ) =>
          track.body === 'sun' ? (
            <circle cx={x} cy={y} r={r} fill={ink} fillOpacity={fillOpacity} />
          ) : (
            <>
              {/* The dark side, which hides the sky behind it as the real one does. */}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill="black"
                fillOpacity={MOON_DARK_FILL}
              />

              {moon && (
                <path
                  d={moon.d}
                  transform={`translate(${x} ${y}) rotate(${moon.rotate}) scale(${r})`}
                  fill={ink}
                  fillOpacity={fillOpacity}
                  // The terminator drawn like the ring, or a pale phase is lost.
                  stroke={ring}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </>
          );

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
                  {face(event.moon, x, y, r, CROSSING_FILL[track.body], ink)}

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

            {/* Filled only where the path is solid: the centre over a readable
                skyline. */}
            {now && (
              <g opacity={now.centreVisible ? 1 : 0.5}>
                {now.centreVisible &&
                  face(
                    nowMoon,
                    screenX(now.azimuth),
                    screenY(now.altitude),
                    disc(now.altitude, now.radius),
                    NOW_FILL,
                    HALO,
                  )}

                <circle
                  cx={screenX(now.azimuth)}
                  cy={screenY(now.altitude)}
                  r={disc(now.altitude, now.radius)}
                  stroke={now.centreVisible ? HALO : ink}
                  strokeWidth={1.5}
                />
              </g>
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

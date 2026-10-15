import type { LatLon } from '@shared/types/common.js';
import type { PanoramaRenderInfo } from '../model/reducer.js';
import { type SkyBody, skyPosition } from './astro.js';
import { type HorizonProfile, limbVisible } from './horizon.js';

const MINUTE_MS = 60_000;

export type TrackSample = {
  time: number;
  azimuth: number;
  altitude: number;
  radius: number;
  /** Upper limb over the skyline; `null` where the picture cannot say. */
  visible: boolean | null;
  /** The centre, which is what the drawn path follows. */
  centreVisible: boolean | null;
};

export type SkyEvent = {
  time: number;
  /** `rise` is the first sliver clearing the skyline, `set` the last one gone. */
  kind: 'rise' | 'set';
  azimuth: number;
  altitude: number;
  radius: number;
};

/** Local midnight to midnight of an ISO `YYYY-MM-DD` date, in this browser's zone. */
export function localDay(date: string): [number, number] {
  const [y = 1970, m = 1, d = 1] = date.split('-').map(Number);

  // `setFullYear`, since the constructor reads years 0–99 as 1900–1999.
  const at = (day: number) => new Date(0, 0).setFullYear(y, m - 1, day);

  return [at(d), at(d + 1)];
}

/** Today as `YYYY-MM-DD`, in this browser's zone. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Bisection steps that narrow a minute to under a second. */
const BISECT_STEPS = 7;

/** A body against a picture's skyline at any instant. */
export function skyObserver(
  body: SkyBody,
  viewpoint: LatLon,
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width' | 'fov'>,
  profile: HorizonProfile,
): (time: number) => TrackSample {
  return (time) => {
    const { azimuth, altitude, radius } = skyPosition(
      body,
      time,
      viewpoint.lat,
      viewpoint.lon,
    );

    return {
      time,
      azimuth,
      altitude,
      radius,
      visible: limbVisible(render, profile, azimuth, altitude + radius),
      centreVisible: limbVisible(render, profile, azimuth, altitude),
    };
  };
}

/** A body's path over a day, a sample a minute, the next midnight excluded. */
export function dayTrack(
  observe: (time: number) => TrackSample,
  [start, end]: [number, number],
): TrackSample[] {
  const samples: TrackSample[] = [];

  for (let time = start; time < end; time += MINUTE_MS) {
    samples.push(observe(time));
  }

  return samples;
}

/**
 * The track with a sample added wherever the centre crosses the skyline, so
 * the drawn path changes from solid to dashed there rather than at the next
 * whole minute — a minute is a few dozen pixels zoomed in.
 */
export function withCentreCrossings(
  samples: TrackSample[],
  observe: (time: number) => TrackSample,
): TrackSample[] {
  return samples.flatMap((sample, i) => {
    const prev = samples[i - 1];

    if (
      !prev ||
      prev.centreVisible === null ||
      sample.centreVisible === null ||
      prev.centreVisible === sample.centreVisible
    ) {
      return [sample];
    }

    let lo = prev;

    let hi = sample;

    for (let step = 0; step < BISECT_STEPS; step++) {
      const mid = observe((lo.time + hi.time) / 2);

      // Off a slice's edge or a clipped column: keep the readable bound.
      if (mid.centreVisible === null) {
        break;
      }

      if (mid.centreVisible === lo.centreVisible) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Carries the new state, so the path ends the old run on it.
    return [{ ...hi, centreVisible: sample.centreVisible }, sample];
  });
}

/**
 * Where the limb crosses the skyline, bisected with `observe` when given. Only
 * between readable neighbours: across a stretch the picture cannot read — off
 * a slice, for hours — a change says nothing about where it happened.
 */
export function skyEvents(
  track: TrackSample[],
  observe?: (time: number) => TrackSample,
): SkyEvent[] {
  const events: SkyEvent[] = [];

  let last: TrackSample | null = null;

  for (const sample of track) {
    if (sample.visible === null) {
      last = null;

      continue;
    }

    if (last && last.visible !== sample.visible) {
      let at = sample;

      if (observe) {
        let lo = last;

        for (let i = 0; i < BISECT_STEPS; i++) {
          const mid = observe((lo.time + at.time) / 2);

          // Off a slice's edge or a clipped column: keep the readable bound.
          if (mid.visible === null) {
            break;
          }

          if (mid.visible === lo.visible) {
            lo = mid;
          } else {
            at = mid;
          }
        }
      } else {
        at = { ...sample, time: (last.time + sample.time) / 2 };
      }

      events.push({
        time: at.time,
        kind: sample.visible ? 'rise' : 'set',
        azimuth: at.azimuth,
        altitude: at.altitude,
        radius: at.radius,
      });
    }

    last = sample;
  }

  return events;
}

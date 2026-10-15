import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import { useEffect, useMemo, useState } from 'react';
import type { PanoramaDepth } from '../depth.js';
import type { PanoramaRenderInfo } from '../model/reducer.js';
import type { PanoramaRenderData } from '../renderHolder.js';
import type { SkyBody } from './astro.js';
import { horizonProfile } from './horizon.js';
import {
  dayTrack,
  localDay,
  localToday,
  type SkyEvent,
  skyEvents,
  skyObserver,
  type TrackSample,
  withCentreCrossings,
} from './track.js';

export type SkyTrack = {
  body: SkyBody;
  samples: TrackSample[];
  events: SkyEvent[];
  /** Local midnight the day shown starts at. */
  dayStart: number;
  /** Where it stands now, while the day shown is today. */
  now: TrackSample | null;
  /** Where it is seen from, which turns the moon's lit side. */
  viewpoint: LatLon;
};

const NOW_TICK_MS = 60_000;

/** The current time, re-read once a minute. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), NOW_TICK_MS);

    return () => clearInterval(timer);
  }, []);

  return now;
}

/** Today as `YYYY-MM-DD`, rolling over at midnight. */
export function useToday(): string {
  return localToday(new Date(useNow()));
}

/**
 * The day's paths of whichever bodies are switched on, against the picture's
 * skyline. Empty without a distance buffer: there is no skyline to cross.
 */
export function useSkyTracks(
  render: PanoramaRenderInfo | null,
  data: PanoramaRenderData | null,
): SkyTrack[] {
  const showSun = useAppSelector((state) => state.panoramaSettings.showSun);

  const showMoon = useAppSelector((state) => state.panoramaSettings.showMoon);

  const skyDate = useAppSelector((state) => state.panorama.skyDate);

  const now = useNow();

  const today = localToday(new Date(now));

  const date = skyDate ?? today;

  const depth = render && data?.id === render.id ? data.depth : null;

  // Per body, so ticking one leaves the other's day alone.
  const sun = useMemo(
    () => (showSun ? bodyDay('sun', render, depth, date) : null),
    [date, depth, render, showSun],
  );

  const moon = useMemo(
    () => (showMoon ? bodyDay('moon', render, depth, date) : null),
    [date, depth, render, showMoon],
  );

  // Only today's paths move with the clock.
  const nowToday = date === today ? now : null;

  return useMemo(
    () =>
      [sun, moon]
        .filter((day) => day !== null)
        .map(({ observe, ...track }) => ({
          ...track,
          now: nowToday === null ? null : observe(nowToday),
        })),
    [moon, nowToday, sun],
  );
}

function bodyDay(
  body: SkyBody,
  render: PanoramaRenderInfo | null,
  depth: PanoramaDepth | null,
  date: string,
) {
  if (!render || !depth) {
    return null;
  }

  const observe = skyObserver(
    body,
    render.viewpoint,
    render,
    horizonProfile(render, depth),
  );

  const day = localDay(date);

  const samples = dayTrack(observe, day);

  return {
    body,
    observe,
    viewpoint: render.viewpoint,
    dayStart: day[0],
    samples: withCentreCrossings(samples, observe),
    events: skyEvents(samples, observe),
  };
}

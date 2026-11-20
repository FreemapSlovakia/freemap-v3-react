import { nextQuarter } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNow } from '@shared/hooks/useNow.js';
import { useMemo } from 'react';
import { legStops, waypointTimes } from '../model/schedule.js';

export type RouteSchedule = {
  /** The set departure; null when unset. */
  departure: number | null;
  /** The departure in effect: the set one, or the next quarter hour. */
  from: number;
  hasStops: boolean;
  /** Each waypoint's times, in a route in order whose legs match its points. */
  times: { arrival: number; leave: number }[] | undefined;
  /** At the finish, stops included. */
  end: number;
};

/** The active route's timing, from its departure. */
export function useRouteSchedule(): RouteSchedule | undefined {
  const departure = useAppSelector((state) => state.routePlanner.departure);

  const mode = useAppSelector((state) => state.routePlanner.mode);

  const points = useAppSelector((state) => state.routePlanner.points);

  const alternative = useAppSelector(
    (state) =>
      state.routePlanner.alternatives[
        state.routePlanner.activeAlternativeIndex
      ],
  );

  // Ticks by the minute so the default never lags behind a passed quarter.
  const quarter = nextQuarter(useNow());

  return useMemo(() => {
    if (!alternative) {
      return undefined;
    }

    const from = departure ?? quarter;

    const stops = legStops(mode, points);

    // Legs not yet recomputed for added or removed points would pair with the
    // wrong waypoints and stops.
    const times =
      mode === 'route' && alternative.legs.length === points.length - 1
        ? waypointTimes(
            alternative.legs.map((leg) => leg.duration),
            stops,
            from,
          )
        : undefined;

    const hasStops = times !== undefined && stops.some(Boolean);

    return {
      departure,
      from,
      hasStops,
      times,
      end:
        hasStops && times
          ? times.at(-1)!.arrival
          : from + alternative.duration * 1000,
    };
  }, [alternative, departure, mode, points, quarter]);
}

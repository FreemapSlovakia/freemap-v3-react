import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import { legStops, waypointTimes } from '../model/schedule.js';

export type RouteSchedule = {
  /** Epoch ms. */
  departure: number;
  /** Each waypoint's times, in a route in order whose legs match its points. */
  times: { arrival: number; leave: number }[] | undefined;
  /** The whole trip in seconds, where a stop makes it more than the moving time. */
  withStops: number | undefined;
  /** At the finish, stops included. */
  end: number;
};

/** The active route's timing; none without a set departure. */
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

  return useMemo(() => {
    if (!alternative || departure === null) {
      return undefined;
    }

    const stops = legStops(mode, points);

    // Legs not yet recomputed for added or removed points would pair with the
    // wrong waypoints and stops.
    const times =
      mode === 'route' && alternative.legs.length === points.length - 1
        ? waypointTimes(
            alternative.legs.map((leg) => leg.duration),
            stops,
            departure,
          )
        : undefined;

    const end = times
      ? times.at(-1)!.arrival
      : departure + alternative.duration * 1000;

    return {
      departure,
      times,
      withStops:
        times && stops.some(Boolean) ? (end - departure) / 1000 : undefined,
      end,
    };
  }, [alternative, departure, mode, points]);
}

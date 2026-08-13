import { authSetUser } from '@features/auth/model/actions.js';
import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  routeKey,
  routePlannerAddPoint,
  routePlannerDelete,
  routePlannerRecompute,
  routePlannerRemovePoint,
  routePlannerRestoreSavedRoute,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetMode,
  routePlannerSetPoint,
  routePlannerSetResult,
  routePlannerSetRoundtripParams,
  routePlannerSetTransportType,
  routePlannerSupersedeSavedRoute,
  routePlannerSwapEnds,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleMilestones,
} from './actions.js';
import {
  routePlannerInitialState,
  routePlannerReducer,
  standingSavedRoute,
  storedRouteIsShowing,
} from './reducer.js';
import { alternative, sampledLine } from './routeFixtures.js';

/**
 * Pure reducer tests for the route-planner slice. Transport-type APIs (see
 * `src/shared/transportTypeDefs.tsx`): `hiking`/`car` → `gh`,
 * `foot-osrm`/`car-osrm` → `osrm`. Several cases branch on whether two
 * transport types share an API.
 */

const pt = (lat: number, lon: number, transport?: string) =>
  ({ lat, lon, transport }) as never;

describe('routePlannerReducer — point editing', () => {
  it('addPoint inserts after the given position, inheriting transport', () => {
    const state = {
      ...routePlannerInitialState,
      points: [pt(0, 0, 'hiking'), pt(2, 2, 'hiking')],
    };

    const next = routePlannerReducer(
      state,
      routePlannerAddPoint({ position: 0, point: pt(1, 1) }),
    );

    expect(next.points).toHaveLength(3);
    expect(next.points[1]).toMatchObject({ lat: 1, lon: 1 });
    // Inherits the transport of the point it was inserted after.
    expect(next.points[1].transport).toBe('hiking');
  });

  it('addPoint keeps an explicit transport on the new point', () => {
    const state = { ...routePlannerInitialState, points: [pt(0, 0, 'hiking')] };

    const next = routePlannerReducer(
      state,
      routePlannerAddPoint({ position: 0, point: pt(1, 1, 'car') }),
    );

    expect(next.points[1].transport).toBe('car');
  });

  it('setPoint replaces the point at the position', () => {
    const state = {
      ...routePlannerInitialState,
      points: [pt(0, 0), pt(2, 2)],
    };

    const next = routePlannerReducer(
      state,
      routePlannerSetPoint({ position: 1, point: pt(9, 9) }),
    );

    expect(next.points[1]).toMatchObject({ lat: 9, lon: 9 });
  });

  it('removePoint drops the point at the index', () => {
    const state = {
      ...routePlannerInitialState,
      points: [pt(0, 0), pt(1, 1), pt(2, 2)],
    };

    const next = routePlannerReducer(state, routePlannerRemovePoint(1));

    expect(next.points.map((p) => p.lat)).toEqual([0, 2]);
  });
});

describe('routePlannerReducer — swapEnds', () => {
  it('reverses points and shifts transports down, clearing the last', () => {
    const state = {
      ...routePlannerInitialState,
      points: [pt(0, 0, 'hiking'), pt(1, 1, 'car'), pt(2, 2, 'foot')],
    };

    const next = routePlannerReducer(state, routePlannerSwapEnds());

    // Coordinates reversed…
    expect(next.points.map((p) => p.lat)).toEqual([2, 1, 0]);
    // …transports shifted so each leg keeps its mode; last point loses it.
    expect(next.points[0].transport).toBe('car');
    expect(next.points[1].transport).toBe('hiking');
    expect(next.points[2].transport).toBeUndefined();
  });
});

describe('routePlannerReducer — milestones', () => {
  it('sets the milestone type', () => {
    const next = routePlannerReducer(
      routePlannerInitialState,
      routePlannerToggleMilestones({ type: 'abs' }),
    );

    expect(next.milestones).toBe('abs');
  });

  it('toggle:true on the active type turns milestones off', () => {
    const state = { ...routePlannerInitialState, milestones: 'abs' as const };

    const next = routePlannerReducer(
      state,
      routePlannerToggleMilestones({ type: 'abs', toggle: true }),
    );

    expect(next.milestones).toBe(false);
  });

  it('toggle:true on a different type switches to it', () => {
    const state = { ...routePlannerInitialState, milestones: 'abs' as const };

    const next = routePlannerReducer(
      state,
      routePlannerToggleMilestones({ type: 'rel', toggle: true }),
    );

    expect(next.milestones).toBe('rel');
  });
});

describe('routePlannerReducer — mode & transport type', () => {
  it('setMode to a non-route gh mode trims to a single point', () => {
    // hiking → gh API; non-route modes only support one point.
    const state = {
      ...routePlannerInitialState,
      transportType: 'hiking' as const,
      finishOnly: true,
      points: [pt(0, 0), pt(1, 1), pt(2, 2)],
    };

    const next = routePlannerReducer(state, routePlannerSetMode('isochrone'));

    expect(next.mode).toBe('isochrone');
    expect(next.points).toHaveLength(1);
    expect(next.finishOnly).toBe(false);
  });

  it('setMode isochrone is coerced to route for a non-gh API', () => {
    const state = {
      ...routePlannerInitialState,
      transportType: 'car-osrm' as const,
    };

    const next = routePlannerReducer(state, routePlannerSetMode('isochrone'));

    expect(next.mode).toBe('route');
  });

  it('setTransportType within the same API keeps the mode', () => {
    const state = {
      ...routePlannerInitialState,
      transportType: 'foot-osrm' as const,
      mode: 'trip' as const,
    };

    const next = routePlannerReducer(
      state,
      routePlannerSetTransportType('car-osrm'),
    );

    expect(next.transportType).toBe('car-osrm');
    expect(next.mode).toBe('trip'); // osrm → osrm, mode preserved
  });

  it('setTransportType across APIs resets the mode to route', () => {
    const state = {
      ...routePlannerInitialState,
      transportType: 'foot-osrm' as const,
      mode: 'trip' as const,
    };

    const next = routePlannerReducer(
      state,
      routePlannerSetTransportType('hiking'),
    );

    expect(next.transportType).toBe('hiking');
    expect(next.mode).toBe('route'); // osrm → gh, mode reset
  });
});

describe('routePlannerReducer — reset & misc', () => {
  it('delete resets to initial but preserves transport/mode/milestones', () => {
    const state = {
      ...routePlannerInitialState,
      transportType: 'car' as const,
      mode: 'trip' as const,
      milestones: 'rel' as const,
      points: [pt(0, 0), pt(1, 1)],
    };

    const next = routePlannerReducer(state, routePlannerDelete());

    expect(next.points).toEqual([]);
    expect(next.pickMode).toBe('start');
    expect(next.transportType).toBe('car');
    expect(next.mode).toBe('trip');
    expect(next.milestones).toBe('rel');
  });

  it('toggleItineraryVisibility flips the flag', () => {
    const next = routePlannerReducer(
      routePlannerInitialState,
      routePlannerToggleItineraryVisibility(),
    );

    expect(next.itineraryIsVisible).toBe(true);
  });

  it('setActiveAlternativeIndex stores the index', () => {
    const next = routePlannerReducer(
      routePlannerInitialState,
      routePlannerSetActiveAlternativeIndex(3),
    );

    expect(next.activeAlternativeIndex).toBe(3);
  });

  it('setRoundtripParams merges over the existing params', () => {
    const next = routePlannerReducer(
      routePlannerInitialState,
      routePlannerSetRoundtripParams({ distance: 12000 }),
    );

    expect(next.roundtripParams).toEqual({
      ...routePlannerInitialState.roundtripParams,
      distance: 12000,
    });
  });
});

// The sampled line costs elevation requests and is what a saved map carries, so
// what does and doesn't drop it decides both when the service is asked again and
// whether a map still has a profile offline.
describe('routePlannerReducer — the sampled elevation line', () => {
  const sampled = (saved: boolean) => ({
    line: sampledLine([
      [17.1, 48.1, 100],
      [17.2, 48.2, 200],
    ]),
    saved,
  });

  const withLine = (saved: boolean) => ({
    ...routePlannerInitialState,
    sampledGeojson: sampled(saved),
    renderGeojson: sampled(saved).line,
  });

  it('drops both lines with the result', () => {
    const next = routePlannerReducer(
      withLine(true),
      routePlannerSetResult({
        timestamp: 1,
        transportType: 'hiking',
        key: 'k',
        alternatives: [],
        waypoints: [],
      }),
    );

    expect(next.sampledGeojson).toBeNull();
    expect(next.renderGeojson).toBeNull();
  });

  it('drops both lines when another alternative is picked', () => {
    const next = routePlannerReducer(
      withLine(true),
      routePlannerSetActiveAlternativeIndex(1),
    );

    expect(next.sampledGeojson).toBeNull();
    expect(next.renderGeojson).toBeNull();
  });

  it('re-derives only the render line when smoothing changes', () => {
    const next = routePlannerReducer(
      withLine(false),
      elevationSetSettings({ despikeWindow: 50 }),
    );

    // Kept, so the chart follows the new preference without a single request.
    expect(next.sampledGeojson).not.toBeNull();
    expect(next.renderGeojson).toBeNull();
  });

  it('re-samples for the tier the user signs in as', () => {
    const next = routePlannerReducer(
      withLine(false),
      authSetUser(null as never),
    );

    expect(next.sampledGeojson).toBeNull();
  });

  it('keeps a line that came with a saved map when the tier changes', () => {
    const next = routePlannerReducer(
      withLine(true),
      authSetUser(null as never),
    );

    expect(next.sampledGeojson).not.toBeNull();
    expect(next.renderGeojson).toBeNull();
  });
});

// The map's stored route outlives the live result, so an edit — or a request
// that failed offline — can't lose it. Coming back to the waypoints it names
// puts it on screen again without asking the router.
describe('routePlannerReducer — the map’s stored route', () => {
  const points = [
    { lat: 48.1, lon: 17.1 },
    { lat: 48.2, lon: 17.2 },
  ] as never[];

  const route = alternative([
    [17.1, 48.1],
    [17.2, 48.2],
  ]);

  const loaded = routePlannerReducer(
    routePlannerInitialState,
    mapsLoaded({
      meta: {} as never,
      data: {
        routePlanner: {
          points,
          result: {
            key: routeKey({
              points,
              mode: 'route',
              transportType: 'hiking',
              roundtripParams: routePlannerInitialState.roundtripParams,
            }),
            timestamp: 1000,
            alternative: route,
            waypoints: [],
          },
        },
      },
    }),
  );

  it('draws the stored route on load, and says so', () => {
    expect(loaded.alternatives).toEqual([route]);
    expect(storedRouteIsShowing(loaded)).toBe(true);
  });

  it('survives a transport switched away, and comes back with it', () => {
    const away = routePlannerReducer(
      loaded,
      routePlannerSetTransportType('car'),
    );

    // The result is gone but the map's own answer is not.
    expect(away.alternatives).toEqual([]);
    expect(away.savedRoute).not.toBeNull();
    expect(standingSavedRoute(away)).toBeUndefined();

    const back = routePlannerReducer(
      away,
      routePlannerSetTransportType('hiking'),
    );

    expect(standingSavedRoute(back)).toBeDefined();

    // Which is what the processor acts on, since it isn't on screen yet.
    expect(storedRouteIsShowing(back)).toBe(false);

    const restored = routePlannerReducer(back, routePlannerRestoreSavedRoute());

    expect(restored.alternatives).toEqual([route]);
    expect(storedRouteIsShowing(restored)).toBe(true);
  });

  it('is not showing once a waypoint has moved, so the route is asked for', () => {
    const moved = routePlannerReducer(
      loaded,
      routePlannerSetPoint({ position: 1, point: { lat: 48.5, lon: 17.5 } }),
    );

    expect(storedRouteIsShowing(moved)).toBe(false);
  });

  it('refuses to restore a route that names other waypoints', () => {
    const moved = routePlannerReducer(
      loaded,
      routePlannerSetPoint({ position: 1, point: { lat: 48.5, lon: 17.5 } }),
    );

    const next = routePlannerReducer(moved, routePlannerRestoreSavedRoute());

    expect(next).toBe(moved);
  });

  // A recompute that fails — offline, or a router that won't answer — must leave
  // the map with the route it had, so the stored one is given up only once
  // another has actually arrived to replace it.
  it('steps aside for a recompute without being given up', () => {
    const next = routePlannerReducer(loaded, routePlannerRecompute());

    // Off screen, so nothing short-circuits the request…
    expect(next.alternatives).toEqual([]);
    expect(storedRouteIsShowing(next)).toBe(false);

    // …but still there, ready to be put back if nothing comes.
    expect(next.savedRoute).not.toBeNull();
    expect(standingSavedRoute(next)).toBeDefined();
  });

  it('is given up once a route arrives to replace it', () => {
    const next = routePlannerReducer(
      routePlannerReducer(loaded, routePlannerRecompute()),
      routePlannerSupersedeSavedRoute(),
    );

    expect(next.savedRoute).toBeNull();
  });

  it('is given up with the route itself', () => {
    expect(routePlannerReducer(loaded, routePlannerDelete()).savedRoute).toBe(
      null,
    );
  });
});

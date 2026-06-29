import { describe, expect, it } from 'vitest';
import {
  routePlannerAddPoint,
  routePlannerDelete,
  routePlannerRemovePoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetMode,
  routePlannerSetPoint,
  routePlannerSetRoundtripParams,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleMilestones,
} from './actions.js';
import { routePlannerInitialState, routePlannerReducer } from './reducer.js';

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

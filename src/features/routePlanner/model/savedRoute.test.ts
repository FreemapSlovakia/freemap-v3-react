import { describe, expect, it } from 'vitest';
import { type RoutePoint, routeKey, SavedRouteSchema } from './actions.js';
import {
  type RoutePlannerState,
  routePlannerFromMapData,
  routePlannerInitialState,
} from './reducer.js';
import { alternative, sampledLine as line } from './routeFixtures.js';
import { savedRouteFromState } from './savedRoute.js';

const points: RoutePoint[] = [
  { lat: 48.1, lon: 17.1 },
  { lat: 48.2, lon: 17.2 },
];

function state(over: Partial<RoutePlannerState> = {}): RoutePlannerState {
  const merged = {
    ...routePlannerInitialState,
    points,
    timestamp: 1000,
    alternatives: [
      alternative([
        [17.1, 48.1, 100],
        [17.2, 48.2, 200],
      ]),
    ],
    ...over,
  };

  // The result was computed for these very waypoints, as it is whenever no
  // request is in flight.
  return { ...merged, resultKey: over.resultKey ?? routeKey(merged) };
}

describe('savedRouteFromState — what a map stores', () => {
  it('stores the active alternative under the key of its own route', () => {
    const saved = savedRouteFromState(state({ activeAlternativeIndex: 1 }));

    expect(saved).toBeUndefined();

    const one = savedRouteFromState(state())!;

    expect(one.key).toBe(routeKey(state()));
    expect(one.timestamp).toBe(1000);
    expect(one.alternative.legs[0]!.steps[0]!.geometry.coordinates).toEqual([
      [17.1, 48.1, 100],
      [17.2, 48.2, 200],
    ]);
  });

  it('has nothing to store without a computed route', () => {
    expect(savedRouteFromState(routePlannerInitialState)).toBeUndefined();
  });

  // Saving between an edit and the route it asks for: the line on screen joins
  // the waypoints as they were. Storing it under the new ones would draw a route
  // that misses them, and stop the re-route that would fix it.
  it('refuses a result the waypoints have moved past', () => {
    expect(
      savedRouteFromState(state({ resultKey: 'for-other-waypoints' })),
    ).toBeUndefined();
  });

  // Straight `error` legs stand in for segments the router never answered for.
  // Stored, they would replay the failure on every open — and being what the map
  // holds, stop the re-route that would fix it.
  it('refuses a route the router failed to find', () => {
    const failed = alternative([
      [17.1, 48.1],
      [17.2, 48.2],
    ]);

    failed.legs[0]!.steps[0]!.mode = 'error';

    expect(
      savedRouteFromState(state({ alternatives: [failed] })),
    ).toBeUndefined();
  });

  it('keeps the router’s own precision', () => {
    const saved = savedRouteFromState(
      state({
        alternatives: [alternative([[17.123456789, 48.987654321, 123.456789]])],
      }),
    )!;

    expect(saved.alternative.legs[0]!.steps[0]!.geometry.coordinates).toEqual([
      [17.123456789, 48.987654321, 123.456789],
    ]);
  });

  it('omits a sampled line that only repeats the route', () => {
    const saved = savedRouteFromState(
      state({
        sampledGeojson: {
          line: line([
            [17.1, 48.1, 100],
            [17.2, 48.2, 200],
          ]),
          saved: false,
        },
      }),
    )!;

    expect(saved.geometry).toBeUndefined();
  });

  it('stores a densified or re-sampled line', () => {
    const densified = savedRouteFromState(
      state({
        sampledGeojson: {
          line: line([
            [17.1, 48.1, 100],
            [17.15, 48.15, 150],
            [17.2, 48.2, 200],
          ]),
          saved: false,
        },
      }),
    )!;

    expect(densified.geometry?.geometry.coordinates).toHaveLength(3);

    // Same vertices, elevation overridden from the terrain model.
    const resampled = savedRouteFromState(
      state({
        sampledGeojson: {
          line: line([
            [17.1, 48.1, 111],
            [17.2, 48.2, 222],
          ]),
          saved: false,
        },
      }),
    )!;

    expect(resampled.geometry?.geometry.coordinates).toEqual([
      [17.1, 48.1, 111],
      [17.2, 48.2, 222],
    ]);
  });

  it('writes what the schema reads back', () => {
    const saved = savedRouteFromState(
      state({
        sampledGeojson: {
          line: line([
            [17.1, 48.1, 100],
            [17.15, 48.15, 150],
            [17.2, 48.2, 200],
          ]),
          saved: false,
        },
      }),
    );

    expect(SavedRouteSchema.parse(saved)).toEqual(saved);
  });

  // The terrain models that answered ride on the line, so the chart can credit
  // them offline — the schema has to let them through.
  it('keeps the elevation-source stamp on the line', () => {
    const stamped = line([
      [17.1, 48.1, 100],
      [17.15, 48.15, 150],
      [17.2, 48.2, 200],
    ]);

    stamped.properties = { 'fm:elevationSources': ['dmr5', 'gedtm30'] };

    const saved = savedRouteFromState(
      state({ sampledGeojson: { line: stamped, saved: false } }),
    );

    expect(SavedRouteSchema.parse(saved).geometry?.properties).toEqual({
      'fm:elevationSources': ['dmr5', 'gedtm30'],
    });
  });
});

describe('routePlannerFromMapData — a document carrying its route', () => {
  const saved = savedRouteFromState(state())!;

  it('puts the stored route on screen instead of leaving it to be routed', () => {
    const next = routePlannerFromMapData({ points, result: saved });

    expect(next.alternatives).toEqual([saved.alternative]);
    expect(next.timestamp).toBe(1000);
  });

  it('marks a stored elevation line as the map’s own', () => {
    const withLine = savedRouteFromState(
      state({
        sampledGeojson: {
          line: line([
            [17.1, 48.1, 100],
            [17.15, 48.15, 150],
            [17.2, 48.2, 200],
          ]),
          saved: false,
        },
      }),
    )!;

    const next = routePlannerFromMapData({ points, result: withLine });

    // `saved` is what keeps it from being dropped when the tier changes.
    expect(next.sampledGeojson?.saved).toBe(true);
    expect(next.sampledGeojson?.line.geometry.coordinates).toHaveLength(3);
  });

  it('ignores a result left behind by an edit to the waypoints', () => {
    const next = routePlannerFromMapData({
      points: [...points, { lat: 48.3, lon: 17.3 }],
      result: saved,
    });

    expect(next.alternatives).toEqual([]);
    expect(next.timestamp).toBeNull();
  });

  it('ignores a result computed for another transport type', () => {
    const next = routePlannerFromMapData({
      points,
      transportType: 'car',
      result: saved,
    });

    expect(next.alternatives).toEqual([]);
  });

  it('leaves a document without a result to be routed, as before', () => {
    expect(routePlannerFromMapData({ points }).alternatives).toEqual([]);
  });

  // The reducer hands out points carrying keys set to `undefined`, which storage
  // and the URL both drop. Hashing the objects themselves made every saved route
  // read as one computed for other waypoints, so no map ever used the route it
  // had stored.
  it('survives the round trip through storage', () => {
    const live = [
      { manual: undefined, transport: undefined, lat: 48.1, lon: 17.1 },
      { lat: 48.2, lon: 17.2 },
    ] as unknown as RoutePoint[];

    const result = savedRouteFromState(state({ points: live }))!;

    const document = JSON.parse(
      JSON.stringify({ points: live, result }),
    ) as Parameters<typeof routePlannerFromMapData>[0];

    expect(routePlannerFromMapData(document).alternatives).toHaveLength(1);
  });

  it('keeps a result that names other waypoints, to wait for them', () => {
    const next = routePlannerFromMapData({
      points: [...points, { lat: 48.3, lon: 17.3 }],
      result: saved,
    });

    expect(next.alternatives).toEqual([]);
    expect(next.savedRoute).toEqual(saved);
  });

  // A history entry carries waypoints at six decimals, a document at whatever the
  // map click gave. The same route has to read as the same route either way, or a
  // back-navigation would route it afresh.
  it('survives the round trip through the URL', () => {
    const result = savedRouteFromState(
      state({ points: [{ lat: 48.123456789, lon: 17.987654321 }] }),
    )!;

    const asTheUrlCarriesThem = [
      { lat: 48.123457, lon: 17.987654 },
    ] as RoutePoint[];

    expect(
      routePlannerFromMapData({ points: asTheUrlCarriesThem, result })
        .alternatives,
    ).toHaveLength(1);
  });

  it('reads an absent transport and an empty one as the same route', () => {
    const result = savedRouteFromState(state())!;

    const asUrlSpellsIt = [
      { transport: '', lat: 48.1, lon: 17.1 },
      { transport: '', lat: 48.2, lon: 17.2 },
    ] as unknown as RoutePoint[];

    expect(
      routePlannerFromMapData({ points: asUrlSpellsIt, result }).alternatives,
    ).toHaveLength(1);
  });
});

// The key decides when a stored route is reused, so it has to cover everything
// that shapes the route — otherwise the find-route processor sees the stored one
// as still standing and swallows the change.
describe('routeKey — what counts as a different route', () => {
  const roundtrip = (roundtripParams: { distance: number; seed: number }) =>
    routeKey({
      points,
      mode: 'roundtrip',
      transportType: 'hiking',
      roundtripParams,
    });

  // The URL spells a finish-only route with a leading empty point and tolerates a
  // trailing one, so a point can be absent. Reading one used to throw, from a
  // reducer and from the URL writer alike.
  it('reads a route with an absent point', () => {
    expect(() =>
      routeKey({
        points: [null, { lat: 48.1, lon: 17.1 }] as unknown as RoutePoint[],
        mode: 'route',
        transportType: 'hiking',
        roundtripParams: routePlannerInitialState.roundtripParams,
      }),
    ).not.toThrow();
  });

  it('separates roundtrips by distance and seed', () => {
    expect(roundtrip({ distance: 5000, seed: 0 })).not.toBe(
      roundtrip({ distance: 8000, seed: 0 }),
    );

    expect(roundtrip({ distance: 5000, seed: 0 })).not.toBe(
      roundtrip({ distance: 5000, seed: 3 }),
    );
  });

  // They shape nothing outside roundtrip mode, so a trip distance left over from
  // one shouldn't make an ordered route read as a different one.
  it('ignores them in the modes they do not apply to', () => {
    const ordered = (roundtripParams: { distance: number; seed: number }) =>
      routeKey({
        points,
        mode: 'route',
        transportType: 'hiking',
        roundtripParams,
      });

    expect(ordered({ distance: 5000, seed: 0 })).toBe(
      ordered({ distance: 8000, seed: 3 }),
    );
  });
});

import type { RootState } from '@app/store/store.js';
import { routeKey } from '@features/routePlanner/model/actions.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
import { alternative } from '@features/routePlanner/model/routeFixtures.js';
import { describe, expect, it } from 'vitest';
import {
  fingerprintDocument,
  fingerprintState,
  getMapDataFromState,
  mapContentString,
} from './mapDocument.js';

const line = (
  points: { lat: number; lon: number; id: number }[],
  rest: Record<string, unknown> = {},
) => ({ type: 'line', points, ...rest });

/** A state holding only what the map document and its serialization read. */
function state(over: Record<string, unknown> = {}): RootState {
  return {
    drawingLines: { lines: [] },
    drawingPoints: { points: [] },
    tracking: { trackedDevices: [] },
    routePlanner: { points: [], transportType: 'car', mode: 'route' },
    objects: { active: [] },
    search: { selectedResults: [], previewId: null },
    gallery: { filter: {} },
    trackViewer: { trackGeojson: null, trackUID: null, gpxUrl: null },
    // Saved with the document but deliberately outside the comparison, so the
    // values only have to exist.
    map: { lat: 48, lon: 17, zoom: 12, layers: ['X'] },
    ...over,
  } as unknown as RootState;
}

// The unsaved-changes comparison digests this string, so whatever a URL round
// trip preserves must survive it unchanged, and whatever it drops must be absent
// from it. These pin both halves.
describe('mapContentString — what counts as a change', () => {
  it('ignores the coordinate precision the URL drops', () => {
    const exact = state({
      drawingLines: {
        lines: [line([{ lat: 48.1234567, lon: 17.7654321, id: 1 }])],
      },
    });

    const restored = state({
      drawingLines: {
        lines: [line([{ lat: 48.123457, lon: 17.765432, id: 9 }])],
      },
    });

    expect(mapContentString(restored)).toBe(mapContentString(exact));
  });

  it('ignores line-point ids, which are regenerated on restore', () => {
    expect(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 77 }])] },
        }),
      ),
    ).toBe(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 1 }])] },
        }),
      ),
    );
  });

  it('ignores style defaults the URL leaves out', () => {
    // `urlProcessor` writes only non-default cap/join/marker, so a restore comes
    // back without them. Reading that as a change would mark every map holding a
    // drawn feature as unsaved forever after a reload.
    const explicit = state({
      drawingLines: {
        lines: [line([{ lat: 48, lon: 17, id: 1 }], { lineCap: 'round' })],
      },
      drawingPoints: {
        points: [{ coords: { lat: 48, lon: 17 }, markerType: 'pin' }],
      },
    });

    const restored = state({
      drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 2 }])] },
      drawingPoints: { points: [{ coords: { lat: 48, lon: 17 } }] },
    });

    expect(mapContentString(restored)).toBe(mapContentString(explicit));
  });

  it('ignores an empty dash array, which means the same as none', () => {
    // A drawn line carries `dashArray: []`; the URL writes no `D` field for it,
    // so a restore comes back without one.
    expect(
      mapContentString(
        state({
          drawingLines: {
            lines: [line([{ lat: 48, lon: 17, id: 1 }], { dashArray: [] })],
          },
        }),
      ),
    ).toBe(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 1 }])] },
        }),
      ),
    );
  });

  it('ignores an unset gallery filter however it is spelled', () => {
    expect(
      mapContentString(state({ gallery: { filter: { tag: undefined } } })),
    ).toBe(mapContentString(state()));
  });

  it('notices a moved point, a new feature and a changed label', () => {
    const base = state({
      drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 1 }])] },
    });

    expect(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48.5, lon: 17, id: 1 }])] },
        }),
      ),
    ).not.toBe(mapContentString(base));

    expect(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 1 }])] },
          drawingPoints: { points: [{ coords: { lat: 49, lon: 18 } }] },
        }),
      ),
    ).not.toBe(mapContentString(base));

    expect(
      mapContentString(
        state({
          drawingLines: {
            lines: [line([{ lat: 48, lon: 17, id: 1 }], { label: 'hi' })],
          },
        }),
      ),
    ).not.toBe(mapContentString(base));
  });

  it('notices a non-default style', () => {
    expect(
      mapContentString(
        state({
          drawingLines: {
            lines: [line([{ lat: 48, lon: 17, id: 1 }], { lineCap: 'square' })],
          },
        }),
      ),
    ).not.toBe(
      mapContentString(
        state({
          drawingLines: { lines: [line([{ lat: 48, lon: 17, id: 1 }])] },
        }),
      ),
    );
  });

  it('notices the track source changing', () => {
    expect(
      mapContentString(
        state({
          trackViewer: { trackGeojson: null, trackUID: 'abc', gpxUrl: null },
        }),
      ),
    ).not.toBe(mapContentString(state()));
  });
});

/** A route as the slice actually holds it, with the result fields the URL ignores. */
function routePlanner(over: Record<string, unknown> = {}) {
  return { ...routePlannerInitialState, ...over };
}

// A map that has just been saved must read as saved when it is later compared
// against its own document. That only holds while every field the content
// serialization emits survives the round trip through `MapData`, so these pin
// the fields most easily left out of it.
describe('fingerprintDocument — a saved map matches its own document', () => {
  const matchesItsDocument = (over: Record<string, unknown>) => {
    const current = state(over);

    expect(fingerprintDocument(getMapDataFromState(current), current)).toBe(
      fingerprintState(current),
    );
  };

  it('matches for a plain route', () => {
    matchesItsDocument({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        transportType: 'car',
      }),
    });
  });

  it('matches for a route started from its finish', () => {
    matchesItsDocument({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        finishOnly: true,
      }),
    });
  });

  // `trip-distance` / `trip-seed` are in the URL, so they have to be in the
  // document too — otherwise every roundtrip map reads as changed forever.
  it('matches for a roundtrip with non-default parameters', () => {
    matchesItsDocument({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        transportType: 'car',
        mode: 'roundtrip',
        roundtripParams: { distance: 8000, seed: 3 },
      }),
    });
  });

  it('matches for an isochrone with non-default parameters', () => {
    matchesItsDocument({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        transportType: 'car',
        mode: 'isochrone',
        isochroneParams: { buckets: 4, distanceLimit: 0, timeLimit: 1800 },
      }),
    });
  });

  // The route the document stores is a cache, built lazily once the map is on
  // screen and rebuilt from the URL on every restore. Digesting it would report
  // a map as changed for merely having been opened.
  it('is blind to the computed route the document carries', () => {
    const routePoints = [
      { lat: 48, lon: 17 },
      { lat: 49, lon: 18 },
    ];

    const routed = state({
      routePlanner: routePlanner({
        points: routePoints,
        timestamp: 1000,
        resultKey: routeKey({
          points: routePoints,
          mode: routePlannerInitialState.mode,
          transportType: routePlannerInitialState.transportType,
          roundtripParams: routePlannerInitialState.roundtripParams,
        }),
        alternatives: [
          alternative([
            [17, 48],
            [18, 49],
          ]),
        ],
      }),
    });

    const unrouted = state({
      routePlanner: routePlanner({ points: routePoints }),
    });

    expect(getMapDataFromState(routed).routePlanner?.result).toBeDefined();

    expect(fingerprintState(routed)).toBe(fingerprintState(unrouted));

    matchesItsDocument({ routePlanner: routed.routePlanner });
  });

  it('notices a roundtrip parameter that really did change', () => {
    const saved = state({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        transportType: 'car',
        mode: 'roundtrip',
        roundtripParams: { distance: 8000, seed: 3 },
      }),
    });

    const edited = state({
      routePlanner: routePlanner({
        points: [{ lat: 48, lon: 17 }],
        transportType: 'car',
        mode: 'roundtrip',
        roundtripParams: { distance: 12000, seed: 3 },
      }),
    });

    expect(fingerprintDocument(getMapDataFromState(saved), edited)).not.toBe(
      fingerprintState(edited),
    );
  });
});

// `toISOString()` throws on an Invalid Date, and this runs during render through
// the unsaved-changes comparison — so a bad date must degrade, not blow up.
describe('mapContentString — a date that is not one', () => {
  const invalid = new Date('xyz');

  it('leaves out an invalid gallery filter date instead of throwing', () => {
    expect(() =>
      mapContentString(
        state({ gallery: { filter: { takenAtFrom: invalid } } }),
      ),
    ).not.toThrow();

    expect(
      mapContentString(
        state({ gallery: { filter: { takenAtFrom: invalid } } }),
      ),
    ).not.toContain('gallery-taken-at-from');
  });

  it('leaves out an invalid tracked-device time instead of throwing', () => {
    const withDevice = (fromTime: Date | undefined) =>
      state({ tracking: { trackedDevices: [{ token: 'd1', fromTime }] } });

    expect(() => mapContentString(withDevice(invalid))).not.toThrow();

    expect(mapContentString(withDevice(invalid))).toBe(
      mapContentString(withDevice(undefined)),
    );
  });
});

// Pinned results are stored with the map, so pinning one is an edit. What the
// digest can see of them is what the URL round-trips, which is their OSM ids —
// the payload is a cache, and a restore rebuilds it from the network.
describe('the results pinned to a map', () => {
  const pin = (
    id: Record<string, unknown>,
    over: Record<string, unknown> = {},
  ) => ({
    source: 'osm',
    id,
    geojson: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [17, 48] },
      properties: {},
    },
    ...over,
  });

  const osmPin = (id: number, elementType = 'node') =>
    pin({ type: 'osm', elementType, id });

  const withPins = (results: Record<string, unknown>[]) =>
    state({
      search: { selectedResults: results, previewId: null },
      routePlanner: routePlanner(),
    });

  it('stores them in the document', () => {
    expect(getMapDataFromState(withPins([osmPin(1)])).search?.results).toEqual([
      osmPin(1),
    ]);
  });

  it('counts pinning one as a change', () => {
    expect(fingerprintState(withPins([osmPin(1)]))).not.toBe(
      fingerprintState(withPins([])),
    );
  });

  it('reads a document as the state it restores to', () => {
    const data = getMapDataFromState(withPins([osmPin(1), osmPin(2)]));

    expect(fingerprintDocument(data, withPins([]))).toBe(
      fingerprintState(withPins([osmPin(1), osmPin(2)])),
    );
  });

  it('leaves the previewed one out, as the URL does', () => {
    const previewed = state({
      routePlanner: routePlanner(),
      search: {
        selectedResults: [osmPin(1), osmPin(2)],
        previewId: { type: 'osm', elementType: 'node', id: 2 },
      },
    });

    expect(fingerprintState(previewed)).toBe(
      fingerprintState(withPins([osmPin(1)])),
    );
  });

  // A restore reads the pins back grouped by element type, so a map pinned in
  // any other order has to digest the same as the one it comes back as — or it
  // reads as changed forever and is never re-read from the backend.
  it('reads pins the same whichever order the map holds them in', () => {
    const wayFirst = withPins([osmPin(7, 'way'), osmPin(1)]);

    const asRestored = withPins([osmPin(1), osmPin(7, 'way')]);

    expect(fingerprintState(wayFirst)).toBe(fingerprintState(asRestored));

    expect(fingerprintDocument(getMapDataFromState(wayFirst), state())).toBe(
      fingerprintState(asRestored),
    );
  });

  // A map saved before pins were stored says nothing about them, so it is read
  // as holding whatever the URL put on screen — exactly as the load treats it.
  it('does not read a map saved before pins as having lost them', () => {
    const restored = withPins([osmPin(1)]);

    expect(fingerprintDocument({ objectsV2: { active: [] } }, restored)).toBe(
      fingerprintState(restored),
    );
  });

  // A restore starts the fetches for the elements the URL names before the map
  // is read, so the comparison that decides whether to re-read it runs while
  // they are still standing in for their elements. Counting those differently
  // would make a clean map read as changed on every reload, and it would never
  // be re-read from the backend.
  it('reads a pin whose fetch is in flight as the pin it becomes', () => {
    const placeholder = {
      source: 'osm',
      id: { type: 'osm', elementType: 'node', id: 1 },
      incomplete: true,
      loading: true,
      geojson: { type: 'Feature', geometry: null, properties: {} },
    };

    expect(fingerprintState(withPins([placeholder]))).toBe(
      fingerprintState(withPins([osmPin(1)])),
    );
  });

  // Only OSM elements are named in the URL, so only they survive a restore —
  // and only what survives a restore may count towards the digest, or a map
  // holding one would read as changed forever.
  it('does not count one the URL cannot name', () => {
    const nominatim = pin(
      { type: 'other', id: 7 },
      { source: 'nominatim-forward', displayName: 'Ganek' },
    );

    expect(fingerprintState(withPins([nominatim]))).toBe(
      fingerprintState(withPins([])),
    );

    expect(
      getMapDataFromState(withPins([nominatim])).search?.results,
    ).toHaveLength(1);
  });
});

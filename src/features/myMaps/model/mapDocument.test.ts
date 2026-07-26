import type { RootState } from '@app/store/store.js';
import { routePlannerInitialState } from '@features/routePlanner/model/reducer.js';
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

import type { RootState } from '@app/store/store.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { fetchElevations } from '@shared/elevation.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import { lineString, point } from '@turf/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ObjectDetailsData, objectsSetDetails } from './actions.js';
import { objectDetailsProcessor } from './objectDetailsProcessor.js';
import { wantedKey, wantedTarget } from './selectors.js';

vi.mock('@shared/elevation.js', () => ({
  fetchElevations: vi.fn(),
  newElevationCredits: () => ({ sources: new Set(), attributions: new Map() }),
  creditedAttributions: (credits: { attributions: Map<string, unknown> }) => [
    ...credits.attributions.values(),
  ],
}));

const fetchElevationsMock = vi.mocked(fetchElevations);

beforeEach(() => {
  fetchElevationsMock.mockReset().mockResolvedValue([null]);
});

// `wantedTarget` names the details' subject; the processor turns a change of
// subject into new details or none. A minimal cast state is enough for both.

const anObject = (
  id: number,
  tags: Record<string, string> = { amenity: 'pub' },
) => ({
  id: { type: 'osm', elementType: 'node', id } as OsmFeatureId,
  coords: { lat: 48, lon: 17 },
  tags,
});

const state = ({
  selection,
  objects = [],
  selectedResults = [],
  detailsShown = true,
  shown = false,
}: {
  selection?: { type: string; id?: unknown };
  objects?: ReturnType<typeof anObject>[];
  selectedResults?: SearchResult[];
  detailsShown?: boolean;
  shown?: boolean;
}): RootState => {
  const s = {
    main: { selection, detailsShown },
    objects: { objects, details: null as { key?: string } | null },
    search: { selectedResults },
  } as unknown as RootState;

  if (shown) {
    s.objects.details = { key: wantedKey(s) } as ObjectDetailsData;
  }

  return s;
};

describe('wantedTarget', () => {
  it('keys an object by its feature id, not by the instance in the store', () => {
    // Every pan and zoom re-runs the search and rebuilds the object list, so
    // an identity-based key would report a new subject for an object the user
    // is still looking at — and read its details anew.
    const selection = { type: 'objects', id: anObject(1).id };

    const before = wantedTarget(state({ selection, objects: [anObject(1)] }));
    const after = wantedTarget(state({ selection, objects: [anObject(1)] }));

    expect(before?.key).toBe(after?.key);
    expect(before?.result).not.toBe(after?.result);
  });

  it('changes the key when another object is selected', () => {
    const objects = [anObject(1), anObject(2)];

    expect(
      wantedTarget(
        state({ selection: { type: 'objects', id: objects[0].id }, objects }),
      )?.key,
    ).not.toBe(
      wantedTarget(
        state({ selection: { type: 'objects', id: objects[1].id }, objects }),
      )?.key,
    );
  });

  it('follows a search result through its incomplete → loaded upgrade', () => {
    const selection = { type: 'search', id: { type: 'other' } };

    const incomplete = {
      id: { type: 'other' },
      incomplete: true,
      geojson: point([17, 48]),
    } as unknown as SearchResult;

    const loaded = {
      id: { type: 'other' },
      geojson: point([17, 48]),
    } as unknown as SearchResult;

    expect(
      wantedTarget(state({ selection, selectedResults: [incomplete] }))?.key,
    ).not.toBe(
      wantedTarget(state({ selection, selectedResults: [loaded] }))?.key,
    );
  });

  it('wants nothing of an element whose fetch is still in flight', () => {
    const selection = { type: 'search', id: { type: 'other' } };

    const loading = {
      id: { type: 'other' },
      incomplete: true,
      loading: true,
      geojson: { type: 'Feature', properties: {}, geometry: null },
    } as unknown as SearchResult;

    expect(
      wantedTarget(state({ selection, selectedResults: [loading] })),
    ).toBeNull();
  });

  it('wants nothing of a result that is shown but not the active one', () => {
    const shown = {
      id: { type: 'other', id: 'a' },
      geojson: point([17, 48]),
    } as unknown as SearchResult;

    expect(
      wantedTarget(
        state({
          selection: { type: 'search', id: { type: 'other', id: 'b' } },
          selectedResults: [shown],
        }),
      ),
    ).toBeNull();
  });

  it('wants nothing while the details are hidden, or with no selection', () => {
    const selection = { type: 'objects', id: anObject(1).id };

    expect(
      wantedTarget(
        state({ selection, objects: [anObject(1)], detailsShown: false }),
      ),
    ).toBeNull();

    expect(wantedTarget(state({}))).toBeNull();
  });
});

describe('objectDetailsProcessor', () => {
  // Mirrors the middleware: the subject changing is what runs the handler.
  const run = (prevState: RootState, nextState: RootState) => {
    const dispatch = vi.fn();

    const { stateChangePredicate, handle } = objectDetailsProcessor;

    const done =
      (stateChangePredicate?.(nextState) !== stateChangePredicate?.(prevState)
        ? handle?.({
            prevState,
            getState: () => nextState,
            dispatch,
            action: { type: 'WHATEVER', payload: undefined },
            toastError: async () => {},
          })
        : undefined) ?? Promise.resolve();

    return { dispatch, done };
  };

  const selection = { type: 'objects', id: anObject(1).id };

  const searched = {
    selection: { type: 'search', id: { type: 'other' } },
    selectedResults: [
      {
        id: { type: 'other' },
        geojson: { type: 'Feature', properties: {}, geometry: null },
      } as unknown as SearchResult,
    ],
  };

  it('gives a selected object its details', () => {
    const { dispatch } = run(
      state({}),
      state({ selection, objects: [anObject(1)] }),
    );

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].type).toBe(objectsSetDetails.type);
  });

  it('gives a selected search result its details', () => {
    const { dispatch } = run(state({}), state(searched));

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].type).toBe(objectsSetDetails.type);
  });

  it('leaves the details alone while the subject is unchanged', () => {
    const before = state({ selection, objects: [anObject(1)], shown: true });

    const after = state({ selection, objects: [anObject(1)] });

    expect(run(before, after).dispatch).not.toHaveBeenCalled();
  });

  it('drops the details when the subject is dismissed', () => {
    const { dispatch } = run(
      state({ selection, objects: [anObject(1)], shown: true }),
      state({
        selection,
        objects: [anObject(1)],
        detailsShown: false,
        shown: true,
      }),
    );

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toEqual(objectsSetDetails(null));
  });

  it('drops the details when the selection goes away', () => {
    const next = state({});

    next.objects.details = { key: 'objects:x' } as ObjectDetailsData;

    const { dispatch } = run(
      state({ selection, objects: [anObject(1)], shown: true }),
      next,
    );

    expect(dispatch.mock.calls[0][0]).toEqual(objectsSetDetails(null));
  });

  it('shows the tags at once and the elevation when it arrives', async () => {
    fetchElevationsMock.mockImplementation(
      async (_latLons, _getState, _c, credits) => {
        credits?.sources.add('sk');

        credits?.attributions.set('DMR 5.0', {
          type: 'data',
          name: 'DMR 5.0: ÚGKK SR',
        });

        return [512];
      },
    );

    // `shown` because the details the handler just set are what the arriving
    // elevation updates — the stub dispatch can't put them there itself.
    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], shown: true }),
    );

    expect(dispatch.mock.calls[0][0].payload.elevation).toEqual({
      elevation: undefined,
      loading: true,
      sources: [],
      attributions: [],
    });

    await done;

    expect(fetchElevationsMock.mock.calls[0][0]).toEqual([[48, 17]]);

    expect(dispatch.mock.calls[1][0].payload.elevation).toEqual({
      elevation: 512,
      loading: false,
      sources: ['sk'],
      attributions: [{ type: 'data', name: 'DMR 5.0: ÚGKK SR' }],
    });
  });

  it('answers a failed read in the elevation line, not with a spinner', async () => {
    // The tags stand without an elevation, so the failure — being offline, most
    // of all — is reported where the value would be.
    const err = new Error('nope');

    fetchElevationsMock.mockRejectedValue(err);

    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], shown: true }),
    );

    await done;

    expect(dispatch.mock.calls[1][0].payload.elevation).toEqual({
      elevation: undefined,
      loading: false,
      error: err,
      sources: [],
      attributions: [],
    });
  });

  it('drops an elevation that arrives for a subject already gone', async () => {
    let current = state({ selection, objects: [anObject(1)] });

    const dispatch = vi.fn();

    const done = objectDetailsProcessor.handle?.({
      prevState: state({}),
      getState: () => current,
      dispatch,
      action: { type: 'WHATEVER', payload: undefined },
      toastError: async () => {},
    });

    // Dismissed while the read is in flight.
    current = state({ selection, objects: [anObject(1)], detailsShown: false });

    await done;

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('cancels the read on a changed subject, not on the same one announced again', async () => {
    // A reload restores the same pin twice — once from the element the URL
    // names, once from the map document — so the second announcement carries a
    // subject identical to the first. Aborting on it would leave the spinner up
    // for good: this handler is edge-triggered on the subject, so nothing would
    // start another read.
    const { done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], shown: true }),
    );

    await done;

    const cancel = fetchElevationsMock.mock.calls[0][2];

    const changed =
      cancel && 'stateChangePredicate' in cancel
        ? cancel.stateChangePredicate
        : undefined;

    expect(changed?.(state({ selection, objects: [anObject(1)] }))).toBe(
      changed?.(state({ selection, objects: [anObject(1)] })),
    );

    expect(changed?.(state({ selection, objects: [anObject(1)] }))).not.toBe(
      changed?.(state({ objects: [anObject(1)] })),
    );
  });

  it('leaves the details to whoever aborted the read', async () => {
    // The abort says the subject moved on, and the run for the new one owns the
    // details from here; overwriting it would describe what is no longer shown.
    fetchElevationsMock.mockRejectedValue(
      new DOMException('canceled', 'AbortError'),
    );

    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], shown: true }),
    );

    await done;

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('shows the details of a result without geometry, minus the elevation', async () => {
    // Nominatim answers plenty of hits with no geometry at all, and turf reports
    // that with a throw.
    const selectedResult = {
      id: { type: 'other' },
      geojson: { type: 'Feature', properties: {}, geometry: null },
    } as unknown as SearchResult;

    const { dispatch, done } = run(
      state({}),
      state({
        selection: { type: 'search', id: { type: 'other' } },
        selectedResults: [selectedResult],
        shown: true,
      }),
    );

    await done;

    expect(fetchElevationsMock).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);

    expect(dispatch.mock.calls[0][0].payload.elevation).toEqual({
      elevation: undefined,
      loading: false,
      sources: [],
      attributions: [],
    });
  });

  it('reads a line at its midpoint, not at its bbox centre', async () => {
    // An L-shaped way: the bbox centre lies in the empty quadrant beside it.
    const selectedResult = {
      id: { type: 'other' },
      geojson: lineString([
        [17, 48],
        [17, 48.001],
        [17.001, 48.001],
      ]),
    } as unknown as SearchResult;

    const { done } = run(
      state({}),
      state({
        selection: { type: 'search', id: { type: 'other' } },
        selectedResults: [selectedResult],
        shown: true,
      }),
    );

    await done;

    const [[lat, lon]] = fetchElevationsMock.mock.calls[0][0];

    // Halfway along, so still on the longer (vertical) leg — where the bbox
    // centre would be off at 17.0005, 48.0005.
    expect(lon).toBeCloseTo(17, 6);
    expect(lat).toBeCloseTo(48.000835, 5);
  });

  it('leaves the elevation out of an object too large to have one', async () => {
    // A railway relation: one reading would name a point of it rather than the
    // object.
    const selectedResult = {
      id: { type: 'other' },
      geojson: lineString([
        [19.6, 48.8],
        [20, 48.7],
      ]),
    } as unknown as SearchResult;

    const { dispatch, done } = run(
      state({}),
      state({
        selection: { type: 'search', id: { type: 'other' } },
        selectedResults: [selectedResult],
        shown: true,
      }),
    );

    await done;

    expect(fetchElevationsMock).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);

    expect(dispatch.mock.calls[0][0].payload.elevation).toEqual({
      elevation: undefined,
      loading: false,
      sources: [],
      attributions: [],
    });
  });
});

import type { RootState } from '@app/store/store.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { fetchElevations } from '@shared/elevation.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import { lineString, point } from '@turf/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  objectDetailsProcessor,
  wantedTarget,
} from './objectDetailsProcessor.js';

vi.mock('@shared/elevation.js', () => ({ fetchElevations: vi.fn() }));

const fetchElevationsMock = vi.mocked(fetchElevations);

beforeEach(() => {
  fetchElevationsMock.mockReset().mockResolvedValue([null]);
});

/**
 * The details toast is derived from the selection and the `showDetails`
 * preference. `wantedTarget` names its subject; the processor turns a *change*
 * of subject into an add or a remove. Both read a handful of slices, so a
 * minimal cast state is enough.
 */

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
  selectedResult = null,
  searchResultSeq = 0,
  showDetails = true,
  toasted = false,
}: {
  selection?: { type: string; id?: OsmFeatureId };
  objects?: ReturnType<typeof anObject>[];
  selectedResult?: SearchResult | null;
  searchResultSeq?: number;
  showDetails?: boolean;
  toasted?: boolean;
}): RootState =>
  ({
    main: { selection },
    objects: { objects },
    search: { selectedResult, searchResultSeq },
    objectsSettings: { showDetails },
    toasts: { toasts: toasted ? { 'mapDetails.tags': {} } : {} },
  }) as unknown as RootState;

describe('wantedTarget', () => {
  it('keys an object by its feature id, not by the instance in the store', () => {
    // Every pan and zoom re-queries Overpass and rebuilds the object list, so
    // an identity-based key would report a new subject for an object the user
    // is still looking at — and bounce the toast to the top of the column.
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
    const selection = { type: 'search' };

    const incomplete = {
      id: { type: 'other' },
      geojson: point([17, 48]),
    } as unknown as SearchResult;

    const loaded = {
      id: { type: 'other' },
      geojson: point([17, 48]),
    } as unknown as SearchResult;

    expect(
      wantedTarget(
        state({ selection, selectedResult: incomplete, searchResultSeq: 3 }),
      )?.key,
    ).not.toBe(
      wantedTarget(
        state({ selection, selectedResult: loaded, searchResultSeq: 4 }),
      )?.key,
    );
  });

  it('wants nothing while the preference is off, or with no selection', () => {
    const selection = { type: 'objects', id: anObject(1).id };

    expect(
      wantedTarget(
        state({ selection, objects: [anObject(1)], showDetails: false }),
      ),
    ).toBeNull();

    expect(wantedTarget(state({}))).toBeNull();
  });
});

describe('objectDetailsProcessor', () => {
  const run = (prevState: RootState, nextState: RootState) => {
    const dispatch = vi.fn();

    const done =
      objectDetailsProcessor.handle?.({
        prevState,
        getState: () => nextState,
        dispatch,
        action: { type: 'WHATEVER', payload: undefined },
        toastError: async () => {},
      }) ?? Promise.resolve();

    return { dispatch, done };
  };

  const selection = { type: 'objects', id: anObject(1).id };

  it('opens the toast when a subject is selected', () => {
    const { dispatch } = run(
      state({}),
      state({ selection, objects: [anObject(1)] }),
    );

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].type).toBe(toastsAdd.type);
  });

  it('leaves the toast alone while the subject is unchanged', () => {
    // Notably after the user's × closed it: re-opening a toast the user just
    // dismissed would make its close button a no-op.
    const before = state({ selection, objects: [anObject(1)], toasted: true });

    const after = state({ selection, objects: [anObject(1)] });

    expect(run(before, after).dispatch).not.toHaveBeenCalled();
  });

  it('closes the toast when the preference goes off', () => {
    const { dispatch } = run(
      state({ selection, objects: [anObject(1)], toasted: true }),
      state({
        selection,
        objects: [anObject(1)],
        showDetails: false,
        toasted: true,
      }),
    );

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toEqual(toastsRemove('mapDetails.tags'));
  });

  it('closes the toast when the selection goes away', () => {
    const { dispatch } = run(
      state({ selection, objects: [anObject(1)], toasted: true }),
      state({ toasted: true }),
    );

    expect(dispatch.mock.calls[0][0]).toEqual(toastsRemove('mapDetails.tags'));
  });

  it('shows the tags at once and the elevation when it arrives', async () => {
    fetchElevationsMock.mockImplementation(
      async (_latLons, _getState, _c, s) => {
        s?.add('sk');

        return [512];
      },
    );

    // `toasted` because the toast the handler just added is what the arriving
    // elevation updates — the stub dispatch can't put it there itself.
    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], toasted: true }),
    );

    expect(dispatch.mock.calls[0][0].payload.messageParams.elevation).toEqual({
      elevation: undefined,
      loading: true,
      sources: [],
    });

    await done;

    expect(fetchElevationsMock.mock.calls[0][0]).toEqual([[48, 17]]);

    expect(dispatch.mock.calls[1][0].payload.messageParams.elevation).toEqual({
      elevation: 512,
      loading: false,
      sources: ['sk'],
    });
  });

  it('stops the elevation spinner when the read fails', async () => {
    fetchElevationsMock.mockRejectedValue(new Error('nope'));

    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], toasted: true }),
    );

    await done;

    expect(dispatch.mock.calls[1][0].payload.messageParams.elevation).toEqual({
      elevation: undefined,
      loading: false,
      sources: [],
    });
  });

  it('drops an elevation that arrives for a subject already gone', async () => {
    const nextState = state({ selection, objects: [anObject(1)] });

    const { dispatch, done } = run(state({}), nextState);

    await done;

    // The toast is not in the state, so the user dismissed it meanwhile.
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('leaves the toast to whoever aborted the read', async () => {
    // Re-selecting the same feature cancels the read in flight while the
    // subject — and so the toast — stays; overwriting it would blank the
    // elevation for good, since the newer run finds nothing to do.
    fetchElevationsMock.mockRejectedValue(
      new DOMException('canceled', 'AbortError'),
    );

    const { dispatch, done } = run(
      state({}),
      state({ selection, objects: [anObject(1)], toasted: true }),
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
      state({ selection: { type: 'search' }, selectedResult, toasted: true }),
    );

    await done;

    expect(fetchElevationsMock).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);

    expect(dispatch.mock.calls[0][0].payload.messageParams.elevation).toEqual({
      elevation: undefined,
      loading: false,
      sources: [],
    });
  });

  it('reads a line at its midpoint, not at its bbox centre', async () => {
    // An L-shaped way: the bbox centre lies in the empty quadrant beside it.
    const selectedResult = {
      id: { type: 'other' },
      geojson: lineString([
        [17, 48],
        [17, 48.1],
        [17.1, 48.1],
      ]),
    } as unknown as SearchResult;

    const { done } = run(
      state({}),
      state({ selection: { type: 'search' }, selectedResult, toasted: true }),
    );

    await done;

    const [[lat, lon]] = fetchElevationsMock.mock.calls[0][0];

    // Halfway along, so still on the longer (vertical) leg — where the bbox
    // centre would be off at 17.05, 48.05.
    expect(lon).toBeCloseTo(17, 6);
    expect(lat).toBeCloseTo(48.083, 3);
  });
});

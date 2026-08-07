import type { RootState } from '@app/store/store.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import { describe, expect, it, vi } from 'vitest';
import {
  objectDetailsProcessor,
  wantedTarget,
} from './objectDetailsProcessor.js';

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

    const incomplete = { id: { type: 'other' } } as SearchResult;

    const loaded = { id: { type: 'other' } } as SearchResult;

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

    objectDetailsProcessor.handle?.({
      prevState,
      getState: () => nextState,
      dispatch,
      action: { type: 'WHATEVER', payload: undefined },
      toastError: async () => {},
    });

    return dispatch;
  };

  const selection = { type: 'objects', id: anObject(1).id };

  it('opens the toast when a subject is selected', () => {
    const dispatch = run(
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

    expect(run(before, after)).not.toHaveBeenCalled();
  });

  it('closes the toast when the preference goes off', () => {
    const dispatch = run(
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
    const dispatch = run(
      state({ selection, objects: [anObject(1)], toasted: true }),
      state({ toasted: true }),
    );

    expect(dispatch.mock.calls[0][0]).toEqual(toastsRemove('mapDetails.tags'));
  });
});

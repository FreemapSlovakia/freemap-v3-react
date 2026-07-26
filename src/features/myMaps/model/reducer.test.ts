import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import {
  type MapMeta,
  mapsDisconnect,
  mapsLoad,
  mapsLoaded,
  mapsLoadFailed,
  mapsRestore,
  mapsSetMeta,
} from './actions.js';
import { type MapsState, mapsReducer } from './reducer.js';
import { urlMapIdSelector } from './selectors.js';

/** Pure reducer tests for the my-maps slice. */

const meta = (id: string) => ({ id, name: id, public: true }) as MapMeta;

const initial = mapsReducer(undefined, { type: '@@INIT' });

/** The selectors read only this slice, so the rest of the state can stay away. */
const asState = (myMaps: MapsState) => ({ myMaps }) as RootState;

// `loadMeta` and `restoring` say a map is on its way in. Everything that reads
// them — the URL's `id=`, the check that a navigation isn't already in flight,
// and the guard that keeps the working copy off a map being left — is wrong for
// as long as one outlives the load it describes, so these pin the release.
describe('mapsReducer — what is pending', () => {
  const loadingB = mapsReducer(
    { ...initial, activeMap: meta('A'), savedFingerprint: 'fpA' },
    mapsLoad({ id: 'B' }),
  );

  it('marks a load pending without disturbing the open map', () => {
    expect(loadingB.loadMeta).toEqual({ id: 'B' });

    expect(loadingB.activeMap).toEqual(meta('A'));
  });

  it('releases the load that put the map on screen', () => {
    expect(
      mapsReducer(loadingB, mapsLoaded({ meta: meta('B'), data: {} })).loadMeta,
    ).toBeUndefined();
  });

  it('releases a load that failed, leaving the open map alone', () => {
    const next = mapsReducer(loadingB, mapsLoadFailed());

    expect(next.loadMeta).toBeUndefined();

    // The map that was open never went anywhere, so it keeps its baseline.
    expect(next.activeMap).toEqual(meta('A'));

    expect(next.savedFingerprint).toBe('fpA');
  });

  it('lets a restore withdraw a pending load of another map', () => {
    const next = mapsReducer(
      loadingB,
      mapsRestore({ mapId: 'C', hasRestoredContent: true }),
    );

    expect(next.loadMeta).toBeUndefined();

    expect(next.restoring?.mapId).toBe('C');
  });

  it('releases both once a map becomes the active one', () => {
    const restoring = mapsReducer(
      loadingB,
      mapsRestore({ mapId: 'C', hasRestoredContent: true }),
    );

    const next = mapsReducer(restoring, mapsSetMeta(meta('C')));

    expect(next.loadMeta).toBeUndefined();

    expect(next.restoring).toBeUndefined();

    expect(next.activeMap).toEqual(meta('C'));
  });

  // The `id=` the URL carries is derived from exactly these fields, so a pending
  // marker that outlives its load leaves the address bar naming a map that is
  // not open. Driven through the selector `urlProcessor` itself uses.
  describe('the map the URL names', () => {
    it('follows a load from start to failure and back to the open map', () => {
      expect(urlMapIdSelector(asState(loadingB))).toBe('B');

      expect(
        urlMapIdSelector(asState(mapsReducer(loadingB, mapsLoadFailed()))),
      ).toBe('A');
    });

    it('is the map a load opened', () => {
      expect(
        urlMapIdSelector(
          asState(
            mapsReducer(loadingB, mapsLoaded({ meta: meta('B'), data: {} })),
          ),
        ),
      ).toBe('B');
    });

    it('is claimed by a restore before the map is read', () => {
      expect(
        urlMapIdSelector(
          asState(
            mapsReducer(
              initial,
              mapsRestore({ mapId: 'C', hasRestoredContent: true }),
            ),
          ),
        ),
      ).toBe('C');
    });

    it('is nothing once no map is connected', () => {
      expect(urlMapIdSelector(asState(initial))).toBeUndefined();
    });
  });

  // A save refreshes the meta of the map already open, so it must not take a
  // load of a different map down with it — that load would simply never open.
  it('leaves a pending load of another map alone when meta is refreshed', () => {
    const next = mapsReducer(loadingB, mapsSetMeta(meta('A')));

    expect(next.loadMeta).toEqual({ id: 'B' });

    expect(next.activeMap).toEqual(meta('A'));
  });

  it('releases a restore on disconnect', () => {
    const restoring = mapsReducer(
      initial,
      mapsRestore({ mapId: 'C', hasRestoredContent: true }),
    );

    expect(mapsReducer(restoring, mapsDisconnect()).restoring).toBeUndefined();
  });
});

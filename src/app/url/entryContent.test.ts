import type { RootState } from '@app/store/store.js';
import {
  dataViewerAddFeatures,
  dataViewerDownloadTrack,
  dataViewerGpxLoad,
  dataViewerSetData,
  dataViewerSetGpxUrl,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { mapsLoad, mapsLoadFailed } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { FeatureCollection } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  currentEntry,
  type EntryRequest,
  entryLoading,
  entrySettled,
  hasOwnContent,
  importRemote,
  isCurrentEntry,
  openEntry,
} from './entryContent.js';
import { isReplacingEntry } from './urlUpdating.js';

const getSnapshot = vi.hoisted(() => vi.fn());

const fetchRemoteTrack = vi.hoisted(() => vi.fn());

vi.mock('@features/dataViewer/trackStore.js', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@features/dataViewer/trackStore.js')
  >()),
  getSnapshot,
}));

vi.mock('@features/dataViewer/remoteTrack.js', () => ({ fetchRemoteTrack }));

const track = (lon: number): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [lon, 48] },
    },
  ],
});

const request = (over: Partial<EntryRequest>): EntryRequest => ({
  items: [],
  tr: undefined,
  remote: undefined,
  mapId: undefined,
  ...over,
});

/** Lets the reads' `then` callbacks run. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

let state: {
  trackViewer: {
    trackUID: string | null;
    gpxUrl: string | null;
    [key: string]: unknown;
  };
  myMaps: object;
};

/** What was dispatched with the URL set to replace the entry. */
let replacing: unknown[] = [];

/** Only the source the entry's reads claim by is reduced. */
const dispatch = vi.fn((action: unknown) => {
  if (isReplacingEntry()) {
    replacing.push(action);
  }

  const { trackViewer } = state;

  if (dataViewerDownloadTrack.match(action)) {
    trackViewer.trackUID = action.payload;
  } else if (dataViewerSetTrackUID.match(action)) {
    trackViewer.trackUID = action.payload;
  } else if (dataViewerGpxLoad.match(action)) {
    trackViewer.gpxUrl = action.payload;
  } else if (dataViewerSetGpxUrl.match(action)) {
    trackViewer.gpxUrl = action.payload;
  }
});

const store = {
  getState: () => state as unknown as RootState,
  dispatch: dispatch as never,
};

const dispatched = <T>(creator: { match: (a: unknown) => a is T }) =>
  dispatch.mock.calls.map(([a]) => a).filter(creator.match);

beforeEach(() => {
  state = {
    trackViewer: {
      trackGeojson: null,
      trackUID: null,
      gpxUrl: null,
      restoringStored: null,
    },
    myMaps: { loadMeta: null },
  };

  dispatch.mockClear();

  replacing = [];

  getSnapshot.mockReset();

  fetchRemoteTrack.mockReset();
});

describe('entry content', () => {
  it('applies a snapshot and holds the URL until it is here', async () => {
    const { promise, resolve } = Promise.withResolvers();

    getSnapshot.mockReturnValue(promise);

    openEntry(store, request({ tr: 'a' }));

    expect(entryLoading()).toBe(true);

    resolve({ geojson: track(1) });

    await settle();

    expect(entryLoading()).toBe(false);

    expect(dispatched(dataViewerSetData)).toEqual([
      dataViewerSetData({ trackGeojson: track(1) }),
    ]);
  });

  it('joins a read already under way rather than repeating it', async () => {
    const { promise, resolve } = Promise.withResolvers();

    getSnapshot.mockReturnValue(promise);

    openEntry(store, request({ tr: 'a' }));

    openEntry(store, request({ tr: 'a' }));

    resolve({ geojson: track(1) });

    await settle();

    expect(getSnapshot).toHaveBeenCalledTimes(1);

    // Only the entry still shown applies it.
    expect(dispatched(dataViewerSetData)).toHaveLength(1);
  });

  it('drops the read of an entry the user has left', async () => {
    const { promise, resolve } = Promise.withResolvers();

    getSnapshot.mockReturnValue(promise);

    openEntry(store, request({ tr: 'a' }));

    openEntry(store, request({}));

    expect(entryLoading()).toBe(false);

    const stored = track(1);

    resolve({ geojson: stored });

    await settle();

    expect(
      dispatched(dataViewerSetData).some(
        (a) => a.payload.trackGeojson === stored,
      ),
    ).toBe(false);
  });

  it('stands down for a map opened while the snapshot was read', async () => {
    getSnapshot.mockResolvedValue({ geojson: track(1) });

    openEntry(store, request({ tr: 'a' }));

    state.myMaps = { loadMeta: { id: 'm' } };

    await settle();

    expect(dispatched(dataViewerSetData)).toEqual([]);
  });

  it("opens a map's saved version for its snapshot that is gone", async () => {
    getSnapshot.mockResolvedValue(undefined);

    openEntry(store, request({ tr: 'a', mapId: 'm' }));

    await settle();

    expect(dispatched(mapsLoad)).toEqual([
      mapsLoad({
        id: 'm',
        ignoreMap: true,
        ignoreLayers: true,
        replaceEntry: true,
      }),
    ]);

    expect(dispatched(toastsAdd).map((a) => a.payload.messageKey)).toContain(
      'snapshotGone',
    );
  });

  it("adds an older build's track to the drawings its params gave", async () => {
    getSnapshot.mockResolvedValue({ geojson: track(1) });

    openEntry(store, request({ tr: true }));

    await settle();

    expect(dispatched(dataViewerAddFeatures)).toEqual([
      dataViewerAddFeatures({ features: track(1).features }),
    ]);
  });

  it('imports a remote track as local content, replacing the entry', async () => {
    fetchRemoteTrack.mockResolvedValue(track(2));

    openEntry(store, request({ remote: { trackUID: 'u' } }));

    // A download may take long; the user's acts meanwhile are history steps.
    expect(entryLoading()).toBe(false);

    await settle();

    expect(replacing).toEqual([
      dataViewerSetTrackUID(null),
      dataViewerSetGpxUrl(null),
      dataViewerSetData({ trackGeojson: track(2) }),
    ]);
  });

  it('drops a download the user has acted over', async () => {
    const { promise, resolve } = Promise.withResolvers();

    fetchRemoteTrack.mockReturnValue(promise);

    openEntry(store, request({ remote: { trackUID: 'u' } }));

    // Opening a map, importing, editing or clearing all drop the source.
    dispatch(dataViewerSetTrackUID(null));

    resolve(track(2));

    await settle();

    expect(dispatched(dataViewerSetData)).toEqual([]);
  });

  it('settles once the snapshot is applied', async () => {
    const { promise, resolve } = Promise.withResolvers();

    getSnapshot.mockReturnValue(promise);

    openEntry(store, request({ tr: 'a' }));

    let applied: unknown[] | undefined;

    const settled = entrySettled().then(() => {
      applied = dispatched(dataViewerSetData);
    });

    resolve({ geojson: track(1) });

    await settled;

    expect(applied).toEqual([dataViewerSetData({ trackGeojson: track(1) })]);
  });

  it('replaces the entry of a link whose download failed', async () => {
    fetchRemoteTrack.mockRejectedValue(new Error('offline'));

    vi.spyOn(console, 'error').mockImplementation(() => {});

    openEntry(store, request({ remote: { gpxUrl: 'https://x/t.gpx' } }));

    await settle();

    expect(replacing).toEqual([
      dataViewerSetTrackUID(null),
      dataViewerSetGpxUrl(null),
    ]);
  });

  it('leaves a source already on screen alone', () => {
    state.trackViewer = { ...state.trackViewer, trackUID: 'u' };

    openEntry(store, request({ remote: { trackUID: 'u' } }));

    expect(fetchRemoteTrack).not.toHaveBeenCalled();

    expect(dispatched(dataViewerSetTrackUID)).toEqual([]);
  });

  it('downloads nothing a map entry names: its track is its features', () => {
    openEntry(store, request({ remote: { trackUID: 'u' }, mapId: 'm' }));

    expect(fetchRemoteTrack).not.toHaveBeenCalled();
  });

  it('drops a download whose data the user replaced meanwhile', async () => {
    const { promise, resolve } = Promise.withResolvers();

    fetchRemoteTrack.mockReturnValue(promise);

    openEntry(store, request({ remote: { gpxUrl: 'https://x/u.gpx' } }));

    // A file import sets the data but leaves `gpxUrl` alone.
    state.trackViewer = { ...state.trackViewer, trackGeojson: track(5) };

    resolve(track(2));

    await settle();

    expect(dispatched(dataViewerSetData)).toEqual([]);

    // Nor does the name it leaves keep that data out of the link.
    expect(state.trackViewer.gpxUrl).toBeNull();
  });

  it('withdraws a map load standing in for the entry left', () => {
    state.myMaps = { loadMeta: { id: 'm', replaceEntry: true } };

    openEntry(store, request({}));

    expect(dispatched(mapsLoadFailed)).toHaveLength(1);
  });

  it("leaves that withdrawal to a map entry's own restore", () => {
    state.myMaps = { loadMeta: { id: 'm', replaceEntry: true } };

    openEntry(store, request({ mapId: 'm' }));

    expect(dispatched(mapsLoadFailed)).toEqual([]);
  });

  it('drops a source the entry does not name', () => {
    state.trackViewer = { ...state.trackViewer, trackUID: 'x' };

    getSnapshot.mockReturnValue(new Promise(() => {}));

    openEntry(store, request({ tr: true }));

    expect(dispatched(dataViewerSetTrackUID)).toEqual([
      dataViewerSetTrackUID(null),
    ]);
  });

  it('drops an import asked for by an entry the user has left', async () => {
    const { promise, resolve } = Promise.withResolvers();

    fetchRemoteTrack.mockReturnValue(promise);

    const e = currentEntry();

    importRemote(store, e, { gpxUrl: 'https://x/t.gpx' });

    openEntry(store, request({}));

    expect(isCurrentEntry(e)).toBe(false);

    const remote = track(3);

    resolve(remote);

    await settle();

    expect(
      dispatched(dataViewerSetData).some(
        (a) => a.payload.trackGeojson === remote,
      ),
    ).toBe(false);
  });

  it("tells the entry's own features from none", () => {
    expect(hasOwnContent(request({}))).toBe(false);

    expect(hasOwnContent(request({ tr: 'a' }))).toBe(true);

    expect(hasOwnContent(request({ remote: { trackUID: 'u' } }))).toBe(false);
  });
});

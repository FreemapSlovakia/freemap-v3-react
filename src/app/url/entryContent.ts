import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { fromWire, type WireItem } from '@features/dataViewer/drawingWire.js';
import {
  dataViewerAddFeatures,
  dataViewerDownloadTrack,
  dataViewerGpxLoad,
  dataViewerRestoreStored,
  dataViewerRestoreStoredDone,
  dataViewerSetData,
  dataViewerSetGpxUrl,
  dataViewerSetTrackUID,
} from '@features/dataViewer/model/actions.js';
import { localTrack } from '@features/dataViewer/model/localTrack.js';
import { urlWire, wireParams } from '@features/dataViewer/model/urlForm.js';
import {
  fetchRemoteTrack,
  type RemoteSource,
} from '@features/dataViewer/remoteTrack.js';
import {
  continueSnapshot,
  getSnapshot,
  snapshotKey,
} from '@features/dataViewer/trackStore.js';
import { loadDataViewerMessages } from '@features/dataViewer/translations/loadDataViewerMessages.js';
import { mapsLoad, mapsLoadFailed } from '@features/myMaps/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isAbortError } from '@shared/isAbortError.js';
import type { Dispatch } from 'redux';
import { serializeQuery } from './mapContentParts.js';
import { replacingEntry } from './urlUpdating.js';

/**
 * Puts a history entry's features on the map — see `doc/entry-content.md`.
 * Each read is tagged with the entry that asked for it and applied only while
 * that entry is shown; one already under way is joined, not repeated.
 */

type Store = { getState: () => RootState; dispatch: Dispatch<RootAction> };

/** The entry shown, bumped as each is opened. */
let entry = 0;

/**
 * The snapshot reads the shown entry still waits for; the URL waits with them.
 * Downloads don't hold it: they can take long, and the user acts meanwhile.
 */
let loading = new Set<string>();

/** Reads under way, by what they read, for an entry re-opened to join. */
const inFlight = new Map<string, Promise<unknown>>();

let waiters: (() => void)[] = [];

export const currentEntry = () => entry;

export const isCurrentEntry = (e: number) => e === entry;

/** Whether the shown entry's content is still being read. */
export const entryLoading = () => loading.size > 0;

/** Resolves once the entry's content is all here, or another entry is opened. */
export function entrySettled(): Promise<void> {
  return entryLoading()
    ? new Promise((resolve) => waiters.push(resolve))
    : Promise.resolve();
}

function release() {
  if (!entryLoading()) {
    const resolved = waiters;

    waiters = [];

    for (const resolve of resolved) {
      resolve();
    }
  }
}

/** The result of `start` for entry `e`, applied only while `e` is shown. */
function read<T>(
  e: number,
  id: string,
  holdsUrl: boolean,
  start: () => Promise<T>,
  apply: (value: T) => void,
  fail: (err: unknown) => void,
) {
  let promise = inFlight.get(id) as Promise<T> | undefined;

  if (!promise) {
    promise = start().finally(() => inFlight.delete(id));

    inFlight.set(id, promise);
  }

  if (holdsUrl) {
    loading.add(id);
  }

  // Off the list before applying, so the dispatch that applies it writes the URL.
  const settle = (then: () => void) => {
    if (isCurrentEntry(e)) {
      loading.delete(id);

      try {
        then();
      } finally {
        release();
      }
    }
  };

  promise.then(
    (value) => settle(() => apply(value)),
    (err) => settle(() => fail(err)),
  );
}

export type EntryRequest = {
  /** The `point=` / `line=` / `polygon=` params, in `sq` for a map entry. */
  items: WireItem[];
  /** The snapshot it names; `true` for an older build's entry. */
  tr: string | true | undefined;
  remote: RemoteSource | undefined;
  /** The map it belongs to, which stands in for a snapshot that is gone. */
  mapId: string | undefined;
};

/** Whether the request carries features of its own, which a map never replaces. */
export const hasOwnContent = ({ items, tr }: EntryRequest) =>
  items.length > 0 || tr !== undefined;

/** Opens an entry and puts its features on the map; returns its number. */
export function openEntry(store: Store, request: EntryRequest): number {
  entry++;

  loading = new Set();

  release();

  const e = entry;

  const { getState, dispatch } = store;

  const { items, tr, mapId } = request;

  // A map's track is its features; only a link names one by its source.
  const remote = mapId === undefined ? request.remote : undefined;

  // A read the entry left was waiting for will never say it is done.
  const { restoringStored: wasRestoring } = getState().trackViewer;

  if (wasRestoring !== null) {
    dispatch(dataViewerRestoreStoredDone(wasRestoring));
  }

  // Nor may the map standing in for its lost snapshot land on this one. A map
  // entry's restore withdraws it itself, with the chart request it holds intact.
  if (mapId === undefined && getState().myMaps.loadMeta?.replaceEntry) {
    dispatch(mapsLoadFailed());
  }

  const showParams = () =>
    dispatch(
      dataViewerSetData({
        trackGeojson: { type: 'FeatureCollection', features: fromWire(items) },
      }),
    );

  const { trackViewer } = getState();

  const named = remote !== undefined && namesSource(remote, trackViewer);

  // Left over from the entry before, which a reload would download again.
  if (!named && (trackViewer.trackUID || trackViewer.gpxUrl)) {
    dispatch(dataViewerSetTrackUID(null));

    dispatch(dataViewerSetGpxUrl(null));
  }

  if (remote) {
    if (!named) {
      // Nothing of the entry left stays on while the track arrives.
      dispatch(dataViewerRestoreStored(null));
    }

    // Named and not in flight, it is on screen already.
    if (!named || inFlight.has(sourceId(remote))) {
      importRemote(store, e, remote);
    }
  } else if (tr === true) {
    // An older build's entry: its drawings are these params, and the record it
    // names holds the imported track alone, which is added to them.
    showParams();

    restoreSnapshot(store, e, true, request);
  } else if (tr) {
    const local = localTrack(getState());

    if (!local || snapshotKey(local) !== tr) {
      restoreSnapshot(store, e, tr, request);
    }
  } else {
    // Compared as the URL writes them, so a round trip's rounding is no change.
    const have = urlWire(getState().trackViewer.trackGeojson);

    if (
      wasRestoring !== null ||
      !have ||
      serializeQuery(have) !== serializeQuery(wireParams(items))
    ) {
      dispatch(dataViewerRestoreStored(null));

      if (items.length) {
        showParams();
      }
    }
  }

  return e;
}

function restoreSnapshot(
  { getState, dispatch }: Store,
  e: number,
  key: string | true,
  { mapId }: EntryRequest,
) {
  dispatch(dataViewerRestoreStored(key));

  const done = () => dispatch(dataViewerRestoreStoredDone(key));

  read(
    e,
    `snapshot:${String(key)}`,
    true,
    () => getSnapshot(key),
    (record) => {
      try {
        apply(record);
      } finally {
        done();
      }
    },
    (err) => {
      console.warn('Reading a snapshot failed:', err);

      done();
    },
  );

  function apply(record: Awaited<ReturnType<typeof getSnapshot>>) {
    // A map opened from My Maps meanwhile replaces the entry's content.
    if (getState().myMaps.loadMeta) {
      return;
    }

    if (!record) {
      forgetEntrySnapshot();

      // An older build's entry keeps the drawings its params gave.
      if (key !== true) {
        dispatch(dataViewerRestoreStored(null));

        dispatch(
          toastsAdd({
            id: 'dataViewer.snapshotGone',
            messageKey: 'snapshotGone',
            messageLoader: loadDataViewerMessages,
            style: 'warning',
            timeout: 5000,
          }),
        );

        // A map's saved version stands in, rather than an empty map that
        // a Save would write over it; the entry's view and layers stay.
        if (mapId !== undefined) {
          dispatch(
            mapsLoad({
              id: mapId,
              ignoreMap: true,
              ignoreLayers: true,
              replaceEntry: true,
            }),
          );
        }
      }

      return;
    }

    // Nothing remote names it now: whatever it was, it is a local track.
    dispatch(dataViewerSetTrackUID(null));

    dispatch(dataViewerSetGpxUrl(null));

    if (key === true) {
      dispatch(dataViewerAddFeatures({ features: record.geojson.features }));

      // Named by its key from now on — before the URL resumes, so the
      // changed `tr` isn't taken for a new step and pushed.
      const local = localTrack(getState());

      try {
        history.replaceState(
          {
            ...(history.state ?? {}),
            tr: local ? snapshotKey(local) : undefined,
          },
          '',
          window.location.href,
        );
      } catch {
        // As in `forgetEntrySnapshot`.
      }
    } else {
      continueSnapshot(key);

      dispatch(dataViewerSetData({ trackGeojson: record.geojson }));
    }
  }
}

const sourceId = (source: RemoteSource) =>
  'trackUID' in source ? `uid:${source.trackUID}` : `url:${source.gpxUrl}`;

const namesSource = (
  source: RemoteSource,
  { trackUID, gpxUrl }: RootState['trackViewer'],
) =>
  'trackUID' in source
    ? source.trackUID === trackUID
    : source.gpxUrl === gpxUrl;

/**
 * Downloads a remote track, which is local content once here: its source is
 * dropped and the entry replaced, not pushed, by the features or a snapshot.
 * Dropped if the user changed the data meanwhile — opened a map, imported,
 * edited or cleared.
 */
export function importRemote(
  { getState, dispatch }: Store,
  e: number,
  source: RemoteSource,
) {
  // Named in state while it loads, never in the URL: the chart a URL asked for
  // waits for it, and the user's act clears it.
  dispatch(
    'trackUID' in source
      ? dataViewerDownloadTrack(source.trackUID)
      : dataViewerGpxLoad(source.gpxUrl),
  );

  const { trackGeojson: before } = getState().trackViewer;

  const clearSource = () => {
    dispatch(dataViewerSetTrackUID(null));

    dispatch(dataViewerSetGpxUrl(null));
  };

  const settle = (then: () => void) => {
    const { trackViewer } = getState();

    if (!namesSource(source, trackViewer)) {
      return false;
    }

    // Data the user put there meanwhile (a file import keeps the name).
    if (trackViewer.trackGeojson !== before) {
      clearSource();

      return false;
    }

    replacingEntry(() => {
      clearSource();

      then();
    });

    return true;
  };

  read(
    e,
    sourceId(source),
    false,
    () => fetchRemoteTrack(source, getState),
    (trackGeojson) =>
      settle(() => {
        dispatch(
          trackGeojson
            ? dataViewerSetData({ trackGeojson })
            : toastsAdd({
                messageKey: 'invalidFormat',
                messageLoader: loadDataViewerMessages,
                style: 'danger',
              }),
        );
      }),
    (err) => {
      if (!settle(() => {}) || isAbortError(err)) {
        return;
      }

      console.error(err);

      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'fetchingError',
          messageParams: { err },
          messageLoader: loadDataViewerMessages,
        }),
      );
    },
  );
}

/** Takes the snapshot off the entry, which then no longer names it. */
export function forgetEntrySnapshot() {
  try {
    history.replaceState(
      { ...(history.state ?? {}), tr: undefined },
      '',
      window.location.href,
    );
  } catch {
    // A document opened from a URL `replaceState` refuses (see `index.tsx`).
  }
}

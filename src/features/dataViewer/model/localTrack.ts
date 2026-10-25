import type { RootState } from '@app/store/store.js';
import type { FeatureCollection } from 'geojson';
import { completeCollection, urlWire } from './urlForm.js';

/**
 * Whether a **`track-uid=`** or **`import-url=`** download is still under way,
 * so the data is not yet the entry's own.
 */
export function homedElsewhere(state: RootState): boolean {
  return Boolean(state.trackViewer.trackUID || state.trackViewer.gpxUrl);
}

/**
 * The map's features when the link can't carry them and nothing names them:
 * what history entries keep as snapshots (`trackStore.ts`).
 */
export function localTrack(state: RootState): FeatureCollection | null {
  const fc = state.trackViewer.trackGeojson;

  // Without what is still being drawn, which would not validate on the way in.
  return fc && !homedElsewhere(state) && urlWire(fc) === undefined
    ? completeCollection(fc)
    : null;
}

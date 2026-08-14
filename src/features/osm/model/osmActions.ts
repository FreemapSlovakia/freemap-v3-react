import { createAction } from '@reduxjs/toolkit';
import type { OsmFeatureId } from '@shared/types/featureId.js';

/**
 * Loads OSM elements onto the map. Any number of them at once, fetched in a
 * single request — a link naming fifty elements is one query, not fifty.
 *
 * `pin` says the elements are shown because something outside this session asks
 * for them — a URL naming them — so they are kept rather than held as the
 * transient preview. Only one element can be the previewed one, which is why an
 * unpinned load names exactly one.
 */
export const osmLoad = createAction<
  { focus: boolean } & (
    | { ids: OsmFeatureId[]; pin: true }
    | { ids: [OsmFeatureId]; pin?: false }
  )
>('OSM_LOAD');

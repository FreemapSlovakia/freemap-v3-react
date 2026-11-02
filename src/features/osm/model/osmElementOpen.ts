import { selectFeature } from '@app/store/actions.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import { osmLoad } from './osmActions.js';

/** What opening an OSM element from a link dispatches: kept on the map, gone to, selected. */
export const osmElementOpen = (id: OsmFeatureId) => [
  osmLoad({ ids: [id], focus: true, pin: true }),
  selectFeature({ type: 'search', id }),
];

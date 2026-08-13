import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapOpeningSelector } from '@features/myMaps/model/selectors.js';
import {
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { isResultLoadingSelector } from '@features/search/model/selectors.js';
import { mergeLines } from '@shared/geoutils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import { featureCollection, lineString, point } from '@turf/helpers';
import type { Feature, LineString, Point, Polygon } from 'geojson';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { fetchOsmElements } from '../fetchOsmElements.js';
import { osmLoadRelation } from '../osmActions.js';
import type { OsmNode, OsmRelation, OsmWay } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadRelationProcessor: Processor<typeof osmLoadRelation> = {
  actionCreator: osmLoadRelation,
  handle: async ({ dispatch, getState, action, toastError }) => {
    const { id, focus } = action.payload;

    const osmId: FeatureId = { type: 'osm', elementType: 'relation', id };

    // Whether this started as a stand-in for a fetch, as opposed to an element
    // already on the map being upgraded — which decides what a failure means.
    const wasPlaceholder = isResultLoadingSelector(getState(), osmId);

    try {
      trackMatomo(['trackEvent', 'Osm', 'view', 'relation']);

      const data = await fetchOsmElements('relation', id, {
        getState,
        cancelActions: [clearMapFeatures],
        // Only this element going off the map invalidates its own fetch —
        // other results coming and going alongside it don't.
        stateChangePredicate: (state) =>
          state.search.selectedResults.some((result) =>
            featureIdsEqual(result.id, osmId),
          ),
      });

      const nodes: Record<number, OsmNode> = {};

      const ways: Record<number, OsmWay> = {};

      for (const item of data.elements) {
        if (item.type === 'node') {
          nodes[item.id] = item;
        } else if (item.type === 'way') {
          ways[item.id] = item;
        }
      }

      const relations = data.elements.filter(
        (el): el is OsmRelation => el.type === 'relation',
      );

      const features: Feature<Point | LineString | Polygon>[] = [];

      const polyFeatures: Feature<Point | LineString | Polygon>[] = [];

      const relation = relations.find((relation) => relation.id === id);

      if (!relation) {
        return;
      }

      const tags: Record<string, string> = relation.tags ?? {};

      for (const member of relation.members) {
        const { ref, type } = member;

        switch (type) {
          case 'node': {
            const n = nodes[ref];

            if (n) {
              features.push(point([n.lon, n.lat], n.tags));
            }

            break;
          }

          case 'way': {
            const w = ways[ref];

            if (w) {
              (member.role === 'inner' || member.role === 'outer'
                ? polyFeatures
                : features
              ).push(
                lineString(
                  w.nodes.map((ref) => [nodes[ref].lon, nodes[ref].lat]),
                  member.role === 'outer' ? tags : w.tags,
                ),
              );
            }

            break;
          }

          case 'relation':
            // TODO add support for relations in relation
            break;

          default:
            break;
        }
      }

      mergeLines<LineString | Point | Polygon>(polyFeatures, tags);

      copyDisplayName(getState().search.selectedResults, osmId, tags);

      dispatch(
        searchSelectResult({
          result: {
            source: 'osm',
            id: osmId,
            geojson: {
              ...featureCollection([...polyFeatures, ...features]),
              properties: tags,
            },
          },
          focus,
          tier: 'keep',
          select: false,
        }),
      );
    } catch (err) {
      // Only a placeholder goes: it is nothing but an id, and would sit on the
      // map as an empty result and in the URL as a promise that reloading can't
      // keep. A result that arrived from the list with geometry of its own
      // stays — a failed upgrade is no reason to take away what was picked.
      const placeholder = isResultLoadingSelector(getState(), osmId);

      if (placeholder) {
        dispatch(searchUnselectResult(osmId));
      }

      // Nothing to report where a map answers for the element: one on its way in
      // is about to supply it from its document, and one that landed while the
      // fetch was failing already has — which is why a placeholder that stopped
      // being one counts too. Offline that document is the only thing that can.
      //
      // Only for the elements the URL named (`pin`), which are the ones a map
      // being opened carries: an element the user asked for themselves is theirs
      // to hear about, whatever else happens to be loading at the time.
      if (
        action.payload.pin &&
        (mapOpeningSelector(getState()) || (wasPlaceholder && !placeholder))
      ) {
        return;
      }

      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};

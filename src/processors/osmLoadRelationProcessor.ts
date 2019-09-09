import { lineString, point, Feature, featureCollection } from '@turf/helpers';

import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toNodes, toWays, ensureElement, ensureNotNull } from 'fm3/osmUtils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { osmLoadRelation } from 'fm3/actions/osmActions';
import { httpRequest } from 'fm3/authAxios';
import { FeatureCollection } from 'geojson';

export const osmLoadRelationProcessor: Processor = {
  actionCreator: osmLoadRelation,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/relation/${
        getState().trackViewer.osmRelationId
      }/full`,
      expectedStatus: 200,
      responseType: 'document',
    });

    if (!(data instanceof Document)) {
      throw new Error('not a document');
    }

    const nodes = toNodes(data);

    const ways = toWays(data, nodes);

    const features: Feature[] = [];

    const relationRes = data.evaluate(
      '/osm/relation/member',
      data,
      null,
      XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
      null,
    );

    let x: Element | null;
    while ((x = ensureElement(relationRes.iterateNext()))) {
      const type = ensureNotNull(x.getAttribute('type'));
      const ref = ensureNotNull(x.getAttribute('ref'));

      switch (type) {
        case 'node':
          if (nodes[ref]) {
            features.push(point(nodes[ref]));
          }
          break;
        case 'way':
          if (ways[ref]) {
            features.push(lineString(ways[ref]));
          }
          break;
        case 'relation':
        default:
          break;
      }
    }

    const trackGeojson = featureCollection(features);

    dispatch(
      trackViewerSetData({
        trackGeojson: trackGeojson as FeatureCollection, // TODO fix type incompatibility
        startPoints: [],
        finishPoints: [],
      }),
    );
  },
};

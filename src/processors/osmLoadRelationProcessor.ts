import { lineString, point, Feature, featureCollection } from '@turf/helpers';

import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
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
    });

    const nodes: any = {};
    const ways: any = {};

    for (const item of data.elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        ways[item.id] = item.nodes.map(ref => nodes[ref]);
      }
    }

    const relations = data.elements.filter(el => el.type === 'relation');

    const features: Feature[] = [];

    for (const relation of relations) {
      for (const member of relation.members) {
        const { ref, type } = member;

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

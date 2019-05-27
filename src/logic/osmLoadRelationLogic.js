import axios from 'axios';
import { createLogic } from 'redux-logic';
import { lineString, point } from '@turf/helpers';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { toNodes, toWays } from 'fm3/logic/osmUtils.js';

export default createLogic({
  type: at.OSM_LOAD_RELATION,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios
      .get(
        `//api.openstreetmap.org/api/0.6/relation/${
          getState().trackViewer.osmRelationId
        }/full`,
        {
          responseType: 'document',
          validateStatus: status => status === 200,
        },
      )
      .then(({ data }) => {
        const nodes = toNodes(data);

        const ways = toWays(data, nodes);

        const features = [];

        const relationRes = data.evaluate(
          '/osm/relation/member',
          data,
          null,
          XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
          null,
        );
        for (
          let x = relationRes.iterateNext();
          x;
          x = relationRes.iterateNext()
        ) {
          const type = x.getAttribute('type');
          const ref = x.getAttribute('ref');
          switch (type) {
            case 'node':
              features.push(point(nodes[ref]));
              break;
            case 'way':
              features.push(lineString(ways[ref]));
              break;
            case 'relation':
            default:
              break;
          }
          nodes[x.getAttribute('type')] = ['lon', 'lat'].map(c =>
            parseFloat(x.getAttribute(c)),
          );
        }

        const trackGeojson = {
          type: 'FeatureCollection',
          features,
        };

        dispatch(
          trackViewerSetData({
            trackGeojson,
            startPoints: [],
            finishPoints: [],
          }),
        );
      })
      .catch(err => {
        dispatch(toastsAddError('osm.fetchingError', err));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

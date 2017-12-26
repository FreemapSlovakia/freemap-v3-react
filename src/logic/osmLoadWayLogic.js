import axios from 'axios';
import { createLogic } from 'redux-logic';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toastsAddError } from 'fm3/actions/toastsActions';
import { toNodes, toWays } from 'fm3/logic/osmUtils.js';

export default createLogic({
  type: 'OSM_LOAD_WAY',
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    axios.get(
      `//api.openstreetmap.org/api/0.6/way/${getState().trackViewer.osmWayId}/full`,
      {
        responseType: 'document',
        validateStatus: status => status === 200,
      },
    )
      .then(({ data }) => {
        const ways = toWays(data, toNodes(data));

        dispatch(trackViewerSetData({
          trackGeojson: {
            type: 'FeatureCollection',
            features: Object.keys(ways).map(id => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: ways[id],
              },
            })),
          },
          startPoints: [],
          finishPoints: [],
        }));
      })
      .catch((e) => {
        dispatch(toastsAddError(`Nastala chyba pri získavaní OSM dát: ${e.message}`));
      })
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });
  },
});

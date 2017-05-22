import queryString from 'query-string';

import { getMapStateFromUrl, getMapStateDiffFromUrl } from 'fm3/urlMapUtils';

import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import { trackViewerDownloadTrack } from 'fm3/actions/trackViewerActions';

const query = queryString.parse(location.search);

export default function handleLocationChange(store, location) {
  // TODO once we start listening for the location changes then we should not dispatch actions if nothing changes here
  if (query.tool === 'route-planner' && /car|walk|bicycle/.test(query.transport)) {
    const points = query.points.split(',').map(point => point.split('/').map(coord => parseFloat(coord)));

    if (points.length > 1 && points.every(point => point.length === 2)) {
      const latLons = points.map(([lat, lon]) => ({ lat, lon }));
      store.dispatch(routePlannerSetParams(latLons[0], latLons[latLons.length - 1], latLons.slice(1, latLons.length - 1), query.transport));
    }
  }

  // TODO once we start listening for the location changes then we should not dispatch actions if nothing changes here
  if (query.tool === 'track-viewer' && query['track-uid']) {
    store.dispatch(trackViewerDownloadTrack(query['track-uid']));
  }

  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
}

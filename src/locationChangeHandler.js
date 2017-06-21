import queryString from 'query-string';

import { getMapStateFromUrl, getMapStateDiffFromUrl, getTrasformedParamsIfIsOldEmbeddedFreemapUrl } from 'fm3/urlMapUtils';

import { setEmbeddedMode } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import { trackViewerDownloadTrack } from 'fm3/actions/trackViewerActions';
import { infoPointAdd } from 'fm3/actions/infoPointActions';

export default function handleLocationChange(store, location) {
  const query = queryString.parse(location.search);

  if (query.tool === 'route-planner' && /car|walk|bicycle/.test(query.transport)) {
    const points = query.points.split(',').map(point => point.split('/').map(coord => parseFloat(coord)));

    const { start, finish, midpoints, transportType } = store.getState().routePlanner;

    if (points.length > 1 && points.every(point => point.length === 2)) {
      const latLons = points.map(([lat, lon]) => ({ lat, lon }));
      const nextStart = latLons[0];
      const nextMidpoints = latLons.slice(1, latLons.length - 1);
      const nextFinish = latLons[latLons.length - 1];
      if (query.transport !== transportType
          || !latLonEquals(start, nextStart)
          || !latLonEquals(finish, nextFinish)
          || midpoints.length !== nextMidpoints.length
          || midpoints.some((midpoint, i) => !latLonEquals(midpoint, nextMidpoints[i]))) {
        store.dispatch(routePlannerSetParams(nextStart, nextFinish, nextMidpoints, query.transport));
      }
    }
  }

  if (query.tool === 'track-viewer' && query['track-uid'] && store.getState().trackViewer.trackUID !== query['track-uid']) {
    store.dispatch(trackViewerDownloadTrack(query['track-uid']));
  }

  if (query.tool === 'info-point') {
    const lat = parseFloat(query['info-point-lat']);
    const lon = parseFloat(query['info-point-lon']);
    if (!isNaN(lat) && !isNaN(lon)) {
      store.dispatch(infoPointAdd(lat, lon, query['info-point-label']));
    }
  }

  if (query.embed === 'true') {
    store.dispatch(setEmbeddedMode());
  }

  if (getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location)) {
    const { lat, lon } = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    store.dispatch(setEmbeddedMode());
    store.dispatch(infoPointAdd(lat, lon));
  }

  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
}

function latLonEquals(ll1, ll2) {
  return !ll1 && !ll2 || ll1 && ll2 && ll1.lat === ll2.lat && ll1.lon === ll2.lon;
}

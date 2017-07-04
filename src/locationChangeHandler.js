import queryString from 'query-string';

import { getMapStateFromUrl, getMapStateDiffFromUrl } from 'fm3/urlMapUtils';
import { getTrasformedParamsIfIsOldEmbeddedFreemapUrl, getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2 } from 'fm3/oldFreemapUtils';

import { setEmbeddedMode } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import { trackViewerDownloadTrack } from 'fm3/actions/trackViewerActions';
import { infoPointSet, infoPointChangeLabel } from 'fm3/actions/infoPointActions';
import { galleryRequestImage } from 'fm3/actions/galleryActions';
import { changesetsSetDays, changesetsSetAuthorName } from 'fm3/actions/changesetsActions';

export default function handleLocationChange(store, location) {
  const query = queryString.parse(location.search);

  if (/car|walk|bicycle/.test(query.transport) && /^\d+(\.\d+)?\/\d+(\.\d+)?(,\d+(\.\d+)?\/\d+(\.\d+)?)+$/.test(query.points)) {
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

  const trackUID = query['track-uid'];
  if (trackUID && store.getState().trackViewer.trackUID !== trackUID) {
    store.dispatch(trackViewerDownloadTrack(trackUID));
  }

  const ipLat = query['info-point-lat'];
  const ipLon = query['info-point-lon'];
  if (ipLat && ipLon) {
    const { infoPoint } = store.getState();
    const lat = parseFloat(ipLat);
    const lon = parseFloat(ipLon);
    const label = query['info-point-label'];
    if (infoPoint.lat !== lat || infoPoint.lon !== lon || infoPoint.label !== label) {
      store.dispatch(infoPointSet(lat, lon, label));
    }
  }

  if (query.image) {
    const imageId = parseInt(query.image, 10);
    if (store.getState().gallery.activeImageId !== imageId) {
      store.dispatch(galleryRequestImage(imageId));
    }
  }

  if (query['changesets-days']) {
    const reduxDays = store.getState().changesets.days;
    const urlDays = parseInt(query['changesets-days'], 10);

    if (reduxDays !== urlDays) {
      store.dispatch(changesetsSetDays(urlDays));
    }

    if (query['changesets-author']) {
      const reduxAuthor = store.getState().changesets.authorName;
      const urlAuthor = query['changesets-author'];

      if (reduxAuthor !== urlAuthor) {
        store.dispatch(changesetsSetAuthorName(urlAuthor));
      }
    }
  }

  if (query.embed === 'true') {
    store.dispatch(setEmbeddedMode());
  }

  if (getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location)) {
    const { lat, lon } = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    store.dispatch(setEmbeddedMode());
    store.dispatch(infoPointSet(lat, lon));
  }

  if (getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location)) {
    const { lat, lon, label } = getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location);
    store.dispatch(setEmbeddedMode());
    store.dispatch(infoPointSet(lat, lon));
    if (label) {
      store.dispatch(infoPointChangeLabel(label));
    }
  }

  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
}

function latLonEquals(ll1, ll2) {
  return !ll1 && !ll2 || ll1 && ll2 && ll1.lat === ll2.lat && ll1.lon === ll2.lon;
}

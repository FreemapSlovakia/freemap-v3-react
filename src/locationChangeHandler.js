import { getMapStateFromUrl, getMapStateDiffFromUrl } from 'fm3/urlMapUtils';
import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import queryString from 'query-string';

const query = queryString.parse(location.search);

export default function handleLocationChange(store, location) {
  if (query.tool === 'route-planner') {
    const points = query.points.split(',').map(point => point.split('/').map(coord => parseFloat(coord)));

    if (points.length > 1 && points.every(point => point.length === 2) && /car|walk|bicycle/.test(query.transport)) {
      const latLons = points.map(([lat, lon]) => ({ lat, lon }));
      store.dispatch(routePlannerSetParams(latLons[0], latLons[latLons.length - 1], latLons.slice(1, latLons.length - 1), query.transport));
    }
  }

  const diff = getMapStateDiffFromUrl(getMapStateFromUrl(location), store.getState().map);

  if (diff && Object.keys(diff).length) {
    store.dispatch(mapRefocus(diff));
  }
}

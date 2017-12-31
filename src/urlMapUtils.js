import queryString from 'query-string';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { getTrasformedParamsIfIsOldFreemapUrl, getTrasformedParamsIfIsOldEmbeddedFreemapUrl } from 'fm3/oldFreemapUtils';

const baseLetters = baseLayers.map(({ type }) => type);
const overlayLetters = overlayLayers.map(({ type }) => type);

export function getMapStateFromUrl(location) {
  {
    const transformedParams = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    if (transformedParams) {
      return transformedParams;
    }
  }

  {
    const transformedParams = getTrasformedParamsIfIsOldFreemapUrl(location);
    if (transformedParams) {
      return transformedParams;
    }
  }

  const query = queryString.parse(location.search);

  const [zoomFrag, latFrag, lonFrag] = (query.map || '').split('/');

  const lat = undefineNaN(parseFloat(latFrag));
  const lon = undefineNaN(parseFloat(lonFrag));
  const zoom = undefineNaN(parseInt(zoomFrag, 10));

  const layers = query.layers || '';

  const base = layers.charAt(0);
  const mapType = baseLetters.includes(base) ? base : undefined;
  const ovl = layers.substring(1).replace(/s\D|s$/, 's0');
  const overlays = overlayLetters.filter(x => ovl.includes(x));

  return { lat, lon, zoom, mapType, overlays };
}

function undefineNaN(val) {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(state1, state2) {
  if (!state1 || !state2) {
    return null;
  }

  const { lat, lon, zoom, mapType, overlays = [] } = state1;
  const changes = {};

  if (mapType && mapType !== state2.mapType) {
    changes.mapType = mapType;
  }

  if (overlays.join('') !== state2.overlays.join('')) {
    changes.overlays = overlays;
  }

  if (lat && Math.abs(lat - state2.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (lon && Math.abs(lon - state2.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom && zoom !== state2.zoom) {
    changes.zoom = zoom;
  }

  return changes;
}


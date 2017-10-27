import queryString from 'query-string';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { getTrasformedParamsIfIsOldFreemapUrl, getTrasformedParamsIfIsOldEmbeddedFreemapUrl } from 'fm3/oldFreemapUtils';

const baseLetters = baseLayers.map(({ type }) => type).join('');
const overlayLetters = ['I', ...overlayLayers.map(({ type }) => type).join('')];
const layersRegExp = new RegExp(`^[${baseLetters}][${overlayLetters}]*$`);

export function getMapStateFromUrl(location) {
  if (getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location)) {
    const transformedParams = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    return transformedParams;
  }

  if (getTrasformedParamsIfIsOldFreemapUrl(location)) {
    const transformedParams = getTrasformedParamsIfIsOldFreemapUrl(location);
    return transformedParams;
  }

  const query = queryString.parse(location.search);

  const [zoomFrag, latFrag, lonFrag] = (query.map || '').split('/');

  const lat = undefineNaN(parseFloat(latFrag));
  const lon = undefineNaN(parseFloat(lonFrag));
  const zoom = undefineNaN(parseInt(zoomFrag, 10));

  const layers = query.layers || '';

  const layersOK = layersRegExp.test(layers);

  const mapType = layersOK ? layers.charAt(0) : undefined;
  const overlays = layersOK && layers.length > 1 ? layers.substring(1).split('') : [];

  return {
    lat, lon, zoom, mapType, overlays,
  };
}

function undefineNaN(val) {
  return Number.isNaN(val) ? undefined : val;
}

export function getMapStateDiffFromUrl(state1, state2) {
  if (!state1 || !state2) {
    return null;
  }

  const {
    lat, lon, zoom, mapType, overlays = [],
  } = state1;
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


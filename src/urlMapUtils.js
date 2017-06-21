import queryString from 'query-string';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

const baseLetters = baseLayers.map(({ type }) => type).join('');
const overlayLetters = overlayLayers.map(({ type }) => type).join('');
const layersRegExp = new RegExp(`^[${baseLetters}][${overlayLetters}]*$`);

export function getMapStateFromUrl(location) {
  // it's amazing that old freemap is using at least three different url param formats

  if (getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location)) {
    const transformedParams = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);
    return transformedParams;
  }

  const isFromOldFreemapUrlFormat1 = location.hash && (location.hash.indexOf('#p=') === 0 || location.hash.indexOf('#m=') === 0); // #m=T,p=48.21836|17.4166|16|T
  const isFromOldFreemapUrlFormat2 = location.search && location.search.indexOf('m=') >= 0; // "?m=A&p=48.1855|17.4029|14"
  if (isFromOldFreemapUrlFormat1 || isFromOldFreemapUrlFormat2) {
    const oldFreemapUrlParams = {};
    let oldFreemapRawUrlParams;
    if (isFromOldFreemapUrlFormat1) {
      oldFreemapRawUrlParams = location.hash.substring(1).split(','); // #m=T,p=48.21836|17.4166|16|T
    } else { // isFromOldFreemapUrlFormat2
      oldFreemapRawUrlParams = location.search.substring(1).split('&'); // ?m=A&p=48.1855|17.4029|14
    }
    oldFreemapRawUrlParams.forEach((s) => {
      const [key, value] = s.split('=');
      oldFreemapUrlParams[key] = value;
    });  // {'m': 'T', 'p' : '48.21836|17.4166|16|T'}

    const [latFrag, lonFrag, zoomFrag, anotherMapTypeParam] = oldFreemapUrlParams.p.split('|');
    const mapType = oldFreemapUrlParams.m || anotherMapTypeParam || 'T';
    return {
      lat: parseFloat(latFrag),
      lon: parseFloat(lonFrag),
      zoom: parseInt(zoomFrag, 10),
      mapType,
      overlays: [],
    };
  }

  const query = queryString.parse(location.search);

  const [zoomFrag, latFrag, lonFrag] = (query.map || '').split('/');

  const lat = parseFloat(latFrag);
  const lon = parseFloat(lonFrag);
  const zoom = parseInt(zoomFrag, 10);

  const layers = query.layers || '';

  const layersOK = layersRegExp.test(layers);

  if (!layersOK || isNaN(lat) || isNaN(lon) || isNaN(zoom)) {
    return null;
  }

  const mapType = layers.charAt(0);
  const overlays = layers.length > 1 ? layers.substring(1).split('') : [];

  return { lat, lon, zoom, mapType, overlays };
}

export function getMapStateDiffFromUrl(state1, state2) {
  if (!state1 || !state2) {
    return null;
  }

  const { lat, lon, zoom, mapType, overlays } = state1;
  const changes = {};

  if (mapType !== state2.mapType) {
    changes.mapType = mapType;
  }

  if (overlays.join('') !== state2.overlays.join('')) {
    changes.overlays = overlays;
  }

  if (Math.abs(lat - state2.lat) > 0.00001) {
    changes.lat = lat;
  }

  if (Math.abs(lon - state2.lon) > 0.00001) {
    changes.lon = lon;
  }

  if (zoom !== state2.zoom) {
    changes.zoom = zoom;
  }

  return changes;
}

// http://embedded.freemap.sk/?lon=19.35&lat=48.55&zoom=8&marker=1&layers=A
export function getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location) {
  if (window.location.origin.indexOf('embed.freemap.sk') >= 0 || location.search.indexOf('marker=1') >= 0) {
    const oldFreemapRawUrlParams = location.search.substring(1).split('&');
    const oldFreemapUrlParams = {};
    oldFreemapRawUrlParams.forEach((s) => {
      const [key, value] = s.split('=');
      oldFreemapUrlParams[key] = value;
    });
    const out = {
      lat: parseFloat(oldFreemapUrlParams.lat),
      lon: parseFloat(oldFreemapUrlParams.lon),
      zoom: parseInt(oldFreemapUrlParams.zoom, 10),
      mapType: oldFreemapUrlParams.layers,
      overlays: [],
    };
    return out;
  }
  return false;
}

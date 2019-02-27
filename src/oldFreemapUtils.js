// it's amazing that old freemap is using at least three different url param formats

// either freemap.sk/#m=T,p=48.21836|17.4166|16|T or freemap.sk/?m=A&p=48.1855|17.4029|14
export function getTrasformedParamsIfIsOldFreemapUrl(location) {
  const isFromOldFreemapUrlFormat1 = location.hash && (location.hash.indexOf('#p=') === 0 || location.hash.indexOf('#m=') === 0); // #m=T,p=48.21836|17.4166|16|T
  const isFromOldFreemapUrlFormat2 = location.search && /[?&]m=/.test(location.search); // "?m=A&p=48.1855|17.4029|14"
  if (!isFromOldFreemapUrlFormat1 && !isFromOldFreemapUrlFormat2) {
    return false;
  }

  const oldFreemapUrlParams = isFromOldFreemapUrlFormat1
    ? rawUrlParamsToHash(location.hash, ',') // #m=T,p=48.21836|17.4166|16|T -> {'m': 'T', 'p' : '48.21836|17.4166|16|T'}
    : rawUrlParamsToHash(location.search, '&'); // ?m=A&p=48.1855|17.4029|14

  const [latFrag, lonFrag, zoomFrag, anotherMapTypeParam] = oldFreemapUrlParams.p.split(/\||%7C/);
  const mapType = oldFreemapUrlParams.m || anotherMapTypeParam || 'X';
  return {
    lat: parseFloat(latFrag),
    lon: parseFloat(lonFrag),
    zoom: parseInt(zoomFrag, 10),
    mapType,
    overlays: [],
  };
}

// http://embedded.freemap.sk/?lon=19.35&lat=48.55&zoom=8&marker=1&layers=A
// http://embed2.freemap.sk/index.html?lat=48.79&lon=19.55&zoom=12&layers=T&markerLat=48.8&markerLon=19.6&markerHtml=Hello&markerShowPopup=1
export function getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location) {
  if (location.search && (location.search.indexOf('marker=1') >= 0 || location.search.indexOf('markerLat') >= 0)) {
    const oldFreemapUrlParams = rawUrlParamsToHash(location.search, '&');
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

// http://embed2.freemap.sk/index.html?lat=48.79&lon=19.55&zoom=12&layers=T&markerLat=48.8&markerLon=19.6&markerHtml=Hello&markerShowPopup=1
export function getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location) {
  if (location.search && location.search.indexOf('markerLat') >= 0) {
    const oldFreemapUrlParams = rawUrlParamsToHash(location.search, '&');
    return {
      lat: parseFloat(oldFreemapUrlParams.markerLat),
      lon: parseFloat(oldFreemapUrlParams.markerLon),
      label: oldFreemapUrlParams.markerHtml,
    };
  }
  return false;
}

function rawUrlParamsToHash(rawParams, separator) {
  const oldFreemapRawUrlParams = rawParams.substring(1).split(separator);
  const oldFreemapUrlParams = {};
  oldFreemapRawUrlParams.forEach((s) => {
    const [key, value] = s.split('=');
    oldFreemapUrlParams[key] = value;
  });

  return oldFreemapUrlParams;
}

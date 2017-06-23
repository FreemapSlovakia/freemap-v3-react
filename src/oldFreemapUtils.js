  // it's amazing that old freemap is using at least three different url param formats

// either freemap.sk/#m=T,p=48.21836|17.4166|16|T or freemap.sk/?m=A&p=48.1855|17.4029|14
export function getTrasformedParamsIfIsOldFreemapUrl(location) {
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
  return false;
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

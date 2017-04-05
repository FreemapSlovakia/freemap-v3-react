export default function setTrackGeojson(geojson) {
  return { type: 'TRACK_VIEWER_SET_TRACK_GEOJSON', payload: geojson };
}

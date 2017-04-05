export default function setTrackGeojson(trackGeojson) {
  return { type: 'TRACK_VIEWER_SET_TRACK_GEOJSON', payload: { trackGeojson } };
}

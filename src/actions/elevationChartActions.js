export function elevationChartSetTrackGeojson(trackGeojson) {
  return { type: 'ELEVATION_CHART_SET_TRACK_GEOJSON', payload: { trackGeojson } };
}

export function elevationChartClose() {
  return { type: 'ELEVATION_CHART_CLOSE' };
}

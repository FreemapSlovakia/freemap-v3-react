export function elevationChartSetTrackGeojson(trackGeojson) {
  return { type: 'ELEVATION_CHART_SET_TRACK_GEOJSON', payload: { trackGeojson } };
}

export function elevationChartClose() {
  return { type: 'ELEVATION_CHART_CLOSE' };
}

export function elevationChartSetActivePoint(activePoint) {
  return { type: 'ELEVATION_CHART_SET_ACTIVE_POINT', payload: { activePoint } };
}

export function elevationChartSetElevationProfile(elevationProfilePoints) {
  return { type: 'ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS', payload: { elevationProfilePoints } };
}

export function elevationChartRemoveActivePoint() {
  return { type: 'ELEVATION_CHART_REMOVE_ACTIVE_POINT' };
}

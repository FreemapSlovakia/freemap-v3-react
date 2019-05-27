import * as at from 'fm3/actionTypes';

export function elevationChartSetTrackGeojson(trackGeojson) {
  return {
    type: at.ELEVATION_CHART_SET_TRACK_GEOJSON,
    payload: { trackGeojson },
  };
}

export function elevationChartClose() {
  return { type: at.ELEVATION_CHART_CLOSE };
}

export function elevationChartSetActivePoint(activePoint) {
  return {
    type: at.ELEVATION_CHART_SET_ACTIVE_POINT,
    payload: { activePoint },
  };
}

export function elevationChartSetElevationProfile(elevationProfilePoints) {
  return {
    type: at.ELEVATION_CHART_SET_ELEVATION_PROFILE_POINTS,
    payload: { elevationProfilePoints },
  };
}

export function elevationChartRemoveActivePoint() {
  return { type: at.ELEVATION_CHART_REMOVE_ACTIVE_POINT };
}

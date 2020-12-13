import turfAlong from '@turf/along';
import { Feature, Geometries, LineString } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import turfLength from '@turf/length';
import { RootAction } from 'fm3/actions';
import {
  elevationChartClose,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { selectFeature } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/authAxios';
import { containsElevations, distance } from 'fm3/geoutils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { assertType } from 'typescript-is';

export const elevationChartProcessor: Processor = {
  actionCreator: elevationChartSetTrackGeojson,
  errorKey: 'elevationChart.fetchError',
  handle: async ({ dispatch, getState }) => {
    const { trackGeojson } = getState().elevationChart;

    if (!trackGeojson) {
      // should not happen
    } else if (containsElevations(trackGeojson)) {
      resolveElevationProfilePointsLocally(trackGeojson, dispatch);
    } else {
      await resolveElevationProfilePointsViaApi(
        getState,
        trackGeojson,
        dispatch,
      );
    }
  },
};

function resolveElevationProfilePointsLocally(
  trackGeojson: Feature<Geometries>,
  dispatch: Dispatch<RootAction>,
) {
  let dist = 0;
  let prevLonlatEle: null | [number, number, number] = null;
  const elevationProfilePoints: {
    lat: number;
    lon: number;
    ele: number;
    distance: number;
  }[] = [];
  for (const item of getCoords(trackGeojson)) {
    const [lon, lat, ele] = item;
    if (prevLonlatEle) {
      const [prevLon, prevLat] = prevLonlatEle;
      dist += distance(lat, lon, prevLat, prevLon);
      elevationProfilePoints.push({
        lat,
        lon,
        ele,
        distance: dist,
      });
    }
    prevLonlatEle = item;
  }

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}

async function resolveElevationProfilePointsViaApi(
  getState: () => RootState,
  trackGeojson: Feature<LineString>,
  dispatch: Dispatch<RootAction>,
) {
  const totalDistanceInKm = turfLength(trackGeojson);
  const delta = Math.min(0.1, totalDistanceInKm / (window.innerWidth / 2));
  const elevationProfilePoints: {
    lat: number;
    lon: number;
    ele: number;
    distance: number;
  }[] = [];

  for (let dist = 0; dist <= totalDistanceInKm; dist += delta) {
    const [lon, lat] = getCoord(turfAlong(trackGeojson, dist));
    elevationProfilePoints.push({
      lat,
      lon,
      distance: dist * 1000,
      ele: Number.NaN, // will be filled later
    });
  }

  const { data } = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/elevation',
    data: elevationProfilePoints.map(({ lat, lon }) => [lat, lon]),
    expectedStatus: 200,
    cancelActions: [
      elevationChartSetTrackGeojson,
      selectFeature,
      elevationChartClose,
    ],
  });

  let climbUp = 0;
  let climbDown = 0;
  let prevEle: number | undefined;

  assertType<number[]>(data).forEach((ele: number, i: number) => {
    if (prevEle !== undefined) {
      const d = ele - prevEle;
      if (d > 0) {
        climbUp += d;
      } else {
        climbDown -= d;
      }
    }

    // TODO following are computed data, should not go to store
    Object.assign(elevationProfilePoints[i], { ele, climbUp, climbDown });
    prevEle = ele;
  });

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}

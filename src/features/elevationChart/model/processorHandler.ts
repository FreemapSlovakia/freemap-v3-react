import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { containsElevations } from '@shared/geoutils.js';
import { along } from '@turf/along';
import { distance } from '@turf/distance';
import { getCoord, getCoords } from '@turf/invariant';
import { length } from '@turf/length';
import {
  Feature,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'geojson';
import { Dispatch } from 'redux';
import { assert } from 'typia';
import { httpRequest } from '../../../app/httpRequest.js';
import type { RootAction } from '../../../app/store/rootAction.js';
import type { RootState } from '../../../app/store/store.js';
import {
  elevationChartClose,
  elevationChartSetElevationProfile,
  elevationChartSetTrackGeojson,
} from './actions.js';
import type { ElevationProfilePoint } from './reducer.js';

const handle: ProcessorHandler<typeof elevationChartSetTrackGeojson> = async ({
  dispatch,
  getState,
  action,
}) => {
  const trackGeojson = action.payload;

  if (containsElevations(trackGeojson)) {
    resolveElevationProfilePointsLocally(trackGeojson, dispatch);
  } else {
    await resolveElevationProfilePointsViaApi(getState, trackGeojson, dispatch);
  }
};

export default handle;

function resolveElevationProfilePointsLocally(
  trackGeojson: Feature<
    Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon
  >,
  dispatch: Dispatch<RootAction>,
) {
  let dist = 0;

  let prevPt: [number, number, number] | undefined;

  const elevationProfilePoints: ElevationProfilePoint[] = [];

  for (const pt of getCoords(trackGeojson)) {
    const [lon, lat, ele] = pt;

    if (prevPt) {
      dist += distance([lon, lat], prevPt, { units: 'meters' });
    }

    elevationProfilePoints.push({
      lat,
      lon,
      ele,
      distance: dist,
    });

    prevPt = pt;
  }

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}

async function resolveElevationProfilePointsViaApi(
  getState: () => RootState,
  trackGeojson: Feature<LineString>,
  dispatch: Dispatch<RootAction>,
) {
  const totalDistanceInKm = length(trackGeojson);

  const delta = Math.min(0.1, totalDistanceInKm / (window.innerWidth / 2));

  const elevationProfilePoints: {
    lat: number;
    lon: number;
    ele: number;
    distance: number;
  }[] = [];

  for (let dist = 0; dist <= totalDistanceInKm; dist += delta) {
    const [lon, lat] = getCoord(along(trackGeojson, dist));

    elevationProfilePoints.push({
      lat,
      lon,
      distance: dist * 1000,
      ele: Number.NaN, // will be filled later
    });
  }

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/geotools/elevation',
    data: elevationProfilePoints.map(({ lat, lon }) => [lat, lon]),
    expectedStatus: 200,
    cancelActions: [
      elevationChartSetTrackGeojson,
      selectFeature,
      elevationChartClose,
      clearMapFeatures,
    ],
  });

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | null | undefined;

  assert<(number | null)[]>(await res.json()).forEach((ele, i) => {
    if (prevEle !== undefined) {
      const d = (ele ?? 0) - (prevEle ?? 0);

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

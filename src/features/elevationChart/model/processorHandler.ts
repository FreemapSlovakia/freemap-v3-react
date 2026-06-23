import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { fetchElevations } from '@shared/elevation.js';
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
  const { trackGeojson, keepRecorded } = action.payload;

  // `keepRecorded` shows the recorded elevation verbatim (gaps included); a
  // fully-elevated track is read locally regardless. Everything else samples a
  // complete profile from the server.
  if (keepRecorded || containsElevations(trackGeojson)) {
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

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | undefined;

  const elevationProfilePoints: ElevationProfilePoint[] = [];

  for (const pt of getCoords(trackGeojson)) {
    const [lon, lat, ele] = pt;

    if (prevPt) {
      dist += distance([lon, lat], prevPt, { units: 'meters' });
    }

    // A missing `z` breaks the climb accumulation: we don't know the terrain
    // across the gap, so it resets the baseline rather than counting a bogus
    // jump to/from it.
    if (Number.isFinite(ele)) {
      if (prevEle !== undefined) {
        const d = ele! - prevEle;

        if (d > 0) {
          climbUp += d;
        } else {
          climbDown -= d;
        }
      }

      prevEle = ele!;
    } else {
      prevEle = undefined;
    }

    elevationProfilePoints.push({
      lat,
      lon,
      // A coordinate without a finite `z` becomes a gap in the chart.
      ele: Number.isFinite(ele) ? ele! : Number.NaN,
      distance: dist,
      climbUp,
      climbDown,
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

  const eles = await fetchElevations(
    elevationProfilePoints.map(({ lat, lon }) => [lat, lon]),
    getState,
    [
      elevationChartSetTrackGeojson,
      selectFeature,
      elevationChartClose,
      clearMapFeatures,
    ],
  );

  let climbUp = 0;

  let climbDown = 0;

  let prevEle: number | undefined;

  for (const [i, ele] of eles.entries()) {
    // A no-data point (null) breaks the climb accumulation: we don't know the
    // terrain across the gap, so it resets the baseline rather than counting a
    // bogus jump to/from it.
    if (prevEle !== undefined && ele != null) {
      const d = ele - prevEle;

      if (d > 0) {
        climbUp += d;
      } else {
        climbDown -= d;
      }
    }

    // TODO following are computed data, should not go to store
    Object.assign(elevationProfilePoints[i], { ele, climbUp, climbDown });

    prevEle = ele ?? undefined;
  }

  dispatch(elevationChartSetElevationProfile(elevationProfilePoints));
}

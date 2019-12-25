import produce from 'immer';
import simplify from '@turf/simplify';
import { lineString } from '@turf/helpers';
import { isActionOf } from 'typesafe-actions';
import { routePlannerConvertToMeasurement } from 'fm3/actions/routePlannerActions';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import {
  distanceMeasurementAddPoint,
  distanceMeasurementUpdatePoint,
  distanceMeasurementRemovePoint,
  Point,
} from 'fm3/actions/distanceMeasurementActions';
import { cleanState } from './routePlannerReducer';

export function globalReducer(state: RootState, action: RootAction) {
  if (isActionOf(routePlannerConvertToMeasurement, action)) {
    return produce(state, draft => {
      const alt =
        draft.routePlanner.alternatives[
          draft.routePlanner.activeAlternativeIndex
        ];

      if (!alt) {
        return;
      }

      const points: Point[] = [];

      const coords: number[][] = [];

      for (const itItem of alt.itinerary) {
        for (const point of itItem.shapePoints) {
          coords.push(point);
        }
      }

      let id = 0;

      for (const p of simplify(lineString(coords), {
        mutate: true,
        tolerance: 0.0005,
      }).geometry.coordinates) {
        points.push({
          lat: p[0],
          lon: p[1],
          id,
        });

        id++;
      }

      draft.distanceMeasurement.lines.push({
        type: 'distance',
        points,
      });

      draft.main.selection = {
        type: 'measure-dist',
        id: draft.distanceMeasurement.lines.length - 1,
      };

      Object.assign(draft.routePlanner, cleanState);
    });
  } else if (isActionOf(distanceMeasurementAddPoint, action)) {
    return produce(state, draft => {
      const index =
        action.payload.index ?? draft.distanceMeasurement.lines.length - 1;

      draft.main.selection = {
        type:
          draft.distanceMeasurement.lines[index].type === 'area'
            ? 'measure-area'
            : 'measure-dist',
        id: index,
      };
    });
  } else if (
    isActionOf(
      [distanceMeasurementUpdatePoint, distanceMeasurementRemovePoint],
      action,
    )
  ) {
    return produce(state, draft => {
      draft.main.selection = {
        type:
          draft.distanceMeasurement.lines[action.payload.index].type === 'area'
            ? 'measure-area'
            : 'measure-dist',
        id: action.payload.index,
      };
    });
  }

  return state;
}

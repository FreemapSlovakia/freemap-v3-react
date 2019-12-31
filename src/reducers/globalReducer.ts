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
import {
  infoPointAdd,
  infoPointChangeLabel,
} from 'fm3/actions/infoPointActions';

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
  } else if (isActionOf(infoPointAdd, action)) {
    return produce(state, draft => {
      draft.main.selection = {
        type: 'info-point',
        id: draft.infoPoint.points.length - 1,
      };
    });
  } else if (isActionOf(infoPointChangeLabel, action)) {
    return produce(state, draft => {
      const selection = draft.main.selection;
      if (
        (selection?.type === 'measure-area' ||
          selection?.type === 'measure-dist') &&
        selection?.id !== undefined
      ) {
        draft.distanceMeasurement.lines[selection.id].label =
          action.payload.label;
      } else if (
        selection?.type === 'info-point' &&
        selection?.id !== undefined
      ) {
        draft.infoPoint.points[selection.id].label = action.payload.label;
      }
    });
  }

  return state;
}

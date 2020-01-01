import produce from 'immer';
import simplify from '@turf/simplify';
import { lineString } from '@turf/helpers';
import { isActionOf } from 'typesafe-actions';
import { routePlannerConvertToMeasurement } from 'fm3/actions/routePlannerActions';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import {
  drawingLineAddPoint,
  drawingLineUpdatePoint,
  drawingLineRemovePoint,
  Point,
} from 'fm3/actions/drawingActions';
import { cleanState } from './routePlannerReducer';
import {
  drawingPointAdd,
  drawingChangeLabel,
} from 'fm3/actions/drawingPointActions';

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

      draft.drawingLines.lines.push({
        type: 'distance',
        points,
      });

      draft.main.selection = {
        type: 'draw-lines',
        id: draft.drawingLines.lines.length - 1,
      };

      Object.assign(draft.routePlanner, cleanState);
    });
  } else if (isActionOf(drawingLineAddPoint, action)) {
    return produce(state, draft => {
      const index = action.payload.index ?? draft.drawingLines.lines.length - 1;

      draft.main.selection = {
        type:
          draft.drawingLines.lines[index].type === 'area'
            ? 'draw-polygons'
            : 'draw-lines',
        id: index,
      };
    });
  } else if (
    isActionOf([drawingLineUpdatePoint, drawingLineRemovePoint], action)
  ) {
    return produce(state, draft => {
      draft.main.selection = {
        type:
          draft.drawingLines.lines[action.payload.index].type === 'area'
            ? 'draw-polygons'
            : 'draw-lines',
        id: action.payload.index,
      };
    });
  } else if (isActionOf(drawingPointAdd, action)) {
    return produce(state, draft => {
      draft.main.selection = {
        type: 'draw-points',
        id: draft.drawingPoints.points.length - 1,
      };
    });
  } else if (isActionOf(drawingChangeLabel, action)) {
    return produce(state, draft => {
      const selection = draft.main.selection;
      if (
        (selection?.type === 'draw-polygons' ||
          selection?.type === 'draw-lines') &&
        selection?.id !== undefined
      ) {
        draft.drawingLines.lines[selection.id].label = action.payload.label;
      } else if (
        selection?.type === 'draw-points' &&
        selection?.id !== undefined
      ) {
        draft.drawingPoints.points[selection.id].label = action.payload.label;
      }
    });
  }

  return state;
}

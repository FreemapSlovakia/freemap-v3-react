import produce from 'immer';
import simplify from '@turf/simplify';
import { lineString } from '@turf/helpers';
import { cleanState } from './routePlannerReducer';
import { isActionOf } from 'typesafe-actions';
import { routePlannerConvertToMeasurement } from 'fm3/actions/routePlannerActions';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

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

      draft.distanceMeasurement.points = [];

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
        draft.distanceMeasurement.points.push({
          lat: p[0],
          lon: p[1],
          id,
        });

        id++;
      }

      Object.assign(draft.routePlanner, cleanState);
      draft.main.tool = 'measure-dist';
    });
  }

  return state;
}

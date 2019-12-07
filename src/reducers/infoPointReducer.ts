import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap, deleteFeature } from 'fm3/actions/mainActions';
import {
  infoPointAdd,
  infoPointChangePosition,
  infoPointChangeLabel,
  infoPointSetAll,
  InfoPoint,
} from 'fm3/actions/infoPointActions';
import produce from 'immer';

export interface InfoPointState {
  points: InfoPoint[];
  change: number;
}

const initialState: InfoPointState = {
  points: [],
  change: 0,
};

export const infoPointReducer = createReducer<InfoPointState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(infoPointAdd, (state, action) => ({
    ...state,
    points: [...state.points, action.payload],
    change: state.change + 1,
  }))
  .handleAction(infoPointChangePosition, (state, action) =>
    produce(state, draft => {
      const point = draft.points[action.payload.index];
      point.lat = action.payload.lat;
      point.lon = action.payload.lon;
    }),
  )
  .handleAction(infoPointChangeLabel, (state, action) =>
    produce(state, draft => {
      draft.points[action.payload.index].label = action.payload.label;
    }),
  )
  .handleAction(infoPointSetAll, (state, action) => ({
    ...state,
    points: action.payload,
  }))
  .handleAction(deleteFeature, (state, action) =>
    produce(state, draft => {
      if (action.meta?.selection?.type === 'info-point')
        draft.points.splice(action.meta.selection.index, 1);
    }),
  );

import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap, setTool } from 'fm3/actions/mainActions';
import {
  infoPointAdd,
  infoPointDelete,
  infoPointChangePosition,
  infoPointChangeLabel,
  infoPointSetActiveIndex,
  infoPointSetAll,
  InfoPoint,
} from 'fm3/actions/infoPointActions';

export interface InfoPointState {
  points: InfoPoint[];
  activeIndex: null | number;
  change: number;
}

const initialState: InfoPointState = {
  points: [],
  activeIndex: null,
  change: 0,
};

export const infoPointReducer = createReducer<InfoPointState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(setTool, (state, action) => ({
    ...state,
    activeIndex: action.payload === 'info-point' ? state.activeIndex : null,
  }))
  .handleAction(infoPointAdd, (state, action) => ({
    ...state,
    points: [...state.points, action.payload],
    change: state.change + 1,
    activeIndex: state.points.length,
  }))
  .handleAction(infoPointDelete, state => ({
    ...state,
    points: state.points.filter((_, i) => state.activeIndex !== i),
    change: state.change + 1,
    activeIndex: null,
  }))
  .handleAction(infoPointChangePosition, (state, action) => ({
    ...state,
    points: state.points.map((point, i) =>
      i === state.activeIndex
        ? { ...point, lat: action.payload.lat, lon: action.payload.lon }
        : point,
    ),
  }))
  .handleAction(infoPointChangeLabel, (state, action) => ({
    ...state,
    points: state.points.map((point, i) =>
      i === state.activeIndex ? { ...point, label: action.payload } : point,
    ),
  }))
  .handleAction(infoPointSetActiveIndex, (state, action) => ({
    ...state,
    activeIndex: state.activeIndex === action.payload ? null : action.payload,
  }))
  .handleAction(infoPointSetAll, (state, action) => ({
    ...state,
    points: action.payload,
  }));

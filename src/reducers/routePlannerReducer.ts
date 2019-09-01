import produce from 'immer';
import { LatLon } from 'fm3/types/common';
import { RootAction } from 'fm3/actions';
import { createReducer } from 'typesafe-actions';
import { clearMap, setTool, setAppState } from 'fm3/actions/mainActions';
import {
  routePlannerSetParams,
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSwapEnds,
  routePlannerAddMidpoint,
  routePlannerSetMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetPickMode,
  routePlannerToggleItineraryVisibility,
  routePlannerSetResult,
  routePlannerSetActiveAlternativeIndex,
  TransportType,
  IAlternative,
} from 'fm3/actions/routePlannerActions';

export type RouteMode = 'trip' | 'roundtrip' | 'route';

export type PickMode = 'start' | 'finish';

export interface IRoutePlannerState {
  alternatives: IAlternative[];
  activeAlternativeIndex: number;
  timestamp: number | null;
  transportType: TransportType | null;
  start: LatLon | null;
  midpoints: Array<LatLon>;
  finish: LatLon | null;
  pickMode: PickMode;
  itineraryIsVisible: boolean;
  mode: RouteMode;
}

const clearResult = {
  alternatives: [],
  activeAlternativeIndex: 0,
  timestamp: null,
};

const initialState: IRoutePlannerState = {
  transportType: null,
  start: null,
  midpoints: [],
  finish: null,
  pickMode: 'start',
  itineraryIsVisible: false,
  mode: 'route',
  ...clearResult,
};

export const routePlannerReducer = createReducer<
  IRoutePlannerState,
  RootAction
>(initialState)
  .handleAction(setAppState, (state, action) => {
    return { ...state, ...action.payload.routePlanner };
  })
  .handleAction(setTool, state => ({
    ...state,
    pickMode: !state.start ? 'start' : 'finish',
  }))
  .handleAction(clearMap, state => ({
    ...initialState,
    transportType: state.transportType,
    mode: state.mode,
  }))
  .handleAction(routePlannerSetParams, (state, action) => ({
    ...state,
    ...(action.payload.start === null || action.payload.finish === null
      ? {
          ...initialState,
          transportType: state.transportType,
          mode: state.mode,
        }
      : {}),
    start: action.payload.start,
    finish: action.payload.finish,
    midpoints: isSpecial(action.payload.transportType)
      ? []
      : action.payload.midpoints,
    transportType: action.payload.transportType,
    mode: isSpecial(action.payload.transportType)
      ? 'route'
      : action.payload.mode || 'route',
  }))
  .handleAction(routePlannerSetStart, (state, action) => ({
    ...state,
    start: action.payload.start,
    midpoints:
      !isSpecial(state.transportType) && !action.payload.move && state.start
        ? [state.start, ...state.midpoints]
        : state.midpoints,
    pickMode: 'finish',
  }))
  .handleAction(routePlannerSetFinish, (state, action) =>
    action.payload.finish === null
      ? {
          // only possible in (round)trip mode
          ...state,
          finish: state.midpoints.length
            ? state.midpoints[state.midpoints.length - 1]
            : null,
          midpoints: state.midpoints.length
            ? state.midpoints.slice(0, state.midpoints.length - 1)
            : [],
          pickMode: state.start ? 'finish' : 'start',
        }
      : {
          ...state,
          finish: action.payload.finish,
          midpoints:
            !isSpecial(state.transportType) &&
            !action.payload.move &&
            state.finish
              ? [...state.midpoints, state.finish]
              : state.midpoints,
          pickMode: state.start ? 'finish' : 'start',
        },
  )
  .handleAction(routePlannerSwapEnds, state => ({
    ...state,
    start: state.finish,
    finish: state.start,
    midpoints: [...state.midpoints].reverse(),
  }))
  .handleAction(routePlannerAddMidpoint, (state, action) =>
    produce(state, draft => {
      draft.midpoints.splice(
        action.payload.position,
        0,
        action.payload.midpoint,
      );
    }),
  )
  .handleAction(routePlannerSetMidpoint, (state, action) =>
    produce(state, draft => {
      draft.midpoints[action.payload.position] = action.payload.midpoint;
    }),
  )
  .handleAction(routePlannerRemoveMidpoint, (state, action) =>
    produce(state, draft => {
      draft.midpoints.splice(action.payload, 1);
    }),
  )
  .handleAction(routePlannerSetTransportType, (state, action) => ({
    ...state,
    ...clearResult,
    transportType: action.payload,
    mode: isSpecial(action.payload) ? 'route' : state.mode,
  }))
  .handleAction(routePlannerSetMode, (state, action) => ({
    ...state,
    ...clearResult,
    mode: isSpecial(state.transportType) ? 'route' : action.payload,
  }))
  .handleAction(routePlannerSetPickMode, (state, action) => ({
    ...state,
    pickMode: action.payload,
  }))
  .handleAction(routePlannerToggleItineraryVisibility, state => ({
    ...state,
    itineraryIsVisible: !state.itineraryIsVisible,
  }))
  .handleAction(routePlannerSetResult, (state, action) => ({
    ...state,
    alternatives: action.payload.alternatives,
    timestamp: action.payload.timestamp,
    activeAlternativeIndex: 0,
    midpoints: isSpecial(action.payload.transportType) ? [] : state.midpoints,
  }))
  .handleAction(routePlannerSetActiveAlternativeIndex, (state, action) => ({
    ...state,
    activeAlternativeIndex: action.payload,
  }));

function isSpecial(transportType: TransportType | null) {
  return (
    transportType !== null && ['imhd', 'bikesharing'].includes(transportType)
  );
}

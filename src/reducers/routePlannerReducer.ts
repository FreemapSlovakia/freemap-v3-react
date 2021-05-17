import { RootAction } from 'fm3/actions';
import { clearMap, selectFeature, setTool } from 'fm3/actions/mainActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import {
  Alternative,
  PickMode,
  routePlannerAddMidpoint,
  routePlannerPreventHint,
  routePlannerRemoveMidpoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetMidpoint,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetPickMode,
  routePlannerSetResult,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleMilestones,
  Waypoint,
} from 'fm3/actions/routePlannerActions';
import { isSpecial, TransportType } from 'fm3/transportTypeDefs';
import { LatLon } from 'fm3/types/common';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export type RouteMode = 'trip' | 'roundtrip' | 'route';

export interface RoutePlannerCleanResultState {
  alternatives: Alternative[];
  waypoints: Waypoint[];
  activeAlternativeIndex: number;
  timestamp: number | null;
}

export interface RoutePlannerCleanState extends RoutePlannerCleanResultState {
  start: LatLon | null;
  midpoints: LatLon[];
  finish: LatLon | null;
  pickMode: PickMode | null;
  itineraryIsVisible: boolean;
}

const clearResult: RoutePlannerCleanResultState = {
  alternatives: [],
  waypoints: [],
  activeAlternativeIndex: 0,
  timestamp: null,
};

export const cleanState: RoutePlannerCleanState = {
  start: null,
  midpoints: [],
  finish: null,
  pickMode: null,
  itineraryIsVisible: false,
  ...clearResult,
};

export interface RoutePlannerState extends RoutePlannerCleanState {
  transportType: TransportType;
  mode: RouteMode;
  milestones: boolean;
  preventHint: boolean;
}

export const routePlannerInitialState: RoutePlannerState = {
  transportType: 'foot-osm',
  mode: 'route',
  milestones: false,
  preventHint: false,
  ...cleanState,
};

export const routePlannerReducer = createReducer<RoutePlannerState, RootAction>(
  routePlannerInitialState,
)
  .handleAction(routePlannerPreventHint, (state) => {
    return {
      ...state,
      preventHint: true,
    };
  })
  .handleAction(routePlannerToggleMilestones, (state, action) => {
    return {
      ...state,
      milestones:
        action.payload === undefined ? !state.milestones : action.payload,
    };
  })
  .handleAction(selectFeature, (state) => ({
    ...state,
    pickMode: null,
  }))
  .handleAction(setTool, (state, action) => ({
    ...state,
    pickMode: !state.start
      ? 'start'
      : action.payload === 'route-planner'
      ? state.pickMode
      : null,
  }))
  .handleAction(clearMap, (state) => ({
    ...routePlannerInitialState,
    preventHint: state.preventHint,
    transportType: state.transportType,
    mode: state.mode,
  }))
  .handleAction(routePlannerSetParams, (state, action) => ({
    ...state,
    ...(action.payload.start === null || action.payload.finish === null
      ? {
          ...routePlannerInitialState,
          preventHint: state.preventHint,
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
    milestones: !!action.payload.milestones,
  }))
  .handleAction(routePlannerSetStart, (state, action) => ({
    ...state,
    start: action.payload.start,
    midpoints:
      !isSpecial(state.transportType) && !action.payload.move && state.start
        ? [state.start, ...state.midpoints]
        : state.midpoints,
    pickMode: state.finish ? state.pickMode : 'finish',
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
  .handleAction(routePlannerSwapEnds, (state) => ({
    ...state,
    start: state.finish,
    finish: state.start,
    midpoints: [...state.midpoints].reverse(),
  }))
  .handleAction(routePlannerAddMidpoint, (state, action) =>
    produce(state, (draft) => {
      draft.midpoints.splice(
        action.payload.position,
        0,
        action.payload.midpoint,
      );
    }),
  )
  .handleAction(routePlannerSetMidpoint, (state, action) =>
    produce(state, (draft) => {
      draft.midpoints[action.payload.position] = action.payload.midpoint;
    }),
  )
  .handleAction(routePlannerRemoveMidpoint, (state, action) =>
    produce(state, (draft) => {
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
  .handleAction(routePlannerToggleItineraryVisibility, (state) => ({
    ...state,
    itineraryIsVisible: !state.itineraryIsVisible,
  }))
  .handleAction(routePlannerSetResult, (state, action) => ({
    ...state,
    alternatives: action.payload.alternatives,
    waypoints: action.payload.waypoints,
    timestamp: action.payload.timestamp,
    activeAlternativeIndex: 0,
    midpoints: isSpecial(action.payload.transportType) ? [] : state.midpoints,
  }))
  .handleAction(routePlannerSetActiveAlternativeIndex, (state, action) => ({
    ...state,
    activeAlternativeIndex: action.payload,
  }))
  .handleAction(mapsDataLoaded, (state, { payload: { routePlanner } }) => {
    return {
      ...routePlannerInitialState,
      preventHint: state.preventHint,
      transportType:
        routePlanner?.transportType ?? routePlannerInitialState.transportType,
      start: routePlanner?.start ?? routePlannerInitialState.start,
      midpoints: routePlanner?.midpoints ?? routePlannerInitialState.midpoints,
      finish: routePlanner?.finish ?? routePlannerInitialState.finish,
      pickMode: routePlanner?.pickMode ?? routePlannerInitialState.pickMode,
      mode: routePlanner?.mode ?? routePlannerInitialState.mode,
      milestones:
        routePlanner?.milestones ?? routePlannerInitialState.milestones,
    };
  });

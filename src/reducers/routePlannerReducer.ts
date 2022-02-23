import { Feature, Polygon } from '@turf/helpers';
import { RootAction } from 'fm3/actions';
import { clearMap, selectFeature, setTool } from 'fm3/actions/mainActions';
import { mapsLoaded } from 'fm3/actions/mapsActions';
import {
  Alternative,
  IsochroneParams,
  PickMode,
  RoundtripParams,
  routePlannerAddMidpoint,
  routePlannerPreventHint,
  routePlannerRemoveMidpoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetIsochroneParams,
  routePlannerSetIsochrones,
  routePlannerSetMidpoint,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetPickMode,
  routePlannerSetResult,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSetWeighting,
  routePlannerSwapEnds,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleMilestones,
  RoutingMode,
  Waypoint,
  Weighting,
} from 'fm3/actions/routePlannerActions';
import {
  isSpecial,
  TransportType,
  transportTypeDefs,
} from 'fm3/transportTypeDefs';
import { LatLon } from 'fm3/types/common';
import produce from 'immer';
import { createReducer } from 'typesafe-actions';

export interface RoutePlannerCleanResultState {
  alternatives: Alternative[];
  waypoints: Waypoint[];
  activeAlternativeIndex: number;
  timestamp: number | null;
  isochrones: Feature<Polygon>[] | null;
}

export interface RoutePlannerCleanState extends RoutePlannerCleanResultState {
  start: LatLon | null;
  midpoints: LatLon[];
  finish: LatLon | null;
  pickMode: PickMode | null;
  itineraryIsVisible: boolean;
  roundtripParams: RoundtripParams;
  isochroneParams: IsochroneParams;
}

const clearResult: RoutePlannerCleanResultState = {
  alternatives: [],
  waypoints: [],
  activeAlternativeIndex: 0,
  timestamp: null,
  isochrones: null,
};

export const cleanState: RoutePlannerCleanState = {
  start: null,
  midpoints: [],
  finish: null,
  pickMode: null,
  itineraryIsVisible: false,
  roundtripParams: {
    distance: 5000,
    seed: 0,
  },
  isochroneParams: {
    distanceLimit: 0,
    timeLimit: 600,
    buckets: 1,
  },
  ...clearResult,
};

export interface RoutePlannerState extends RoutePlannerCleanState {
  transportType: TransportType;
  mode: RoutingMode;
  weighting: Weighting;
  milestones: boolean;
  preventHint: boolean;
}

export const routePlannerInitialState: RoutePlannerState = {
  transportType: 'hiking',
  mode: 'route',
  weighting: 'fastest',
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
    milestones: state.milestones,
    pickMode: 'start',
  }))
  .handleAction(routePlannerSetParams, (state, { payload }) => ({
    ...state,
    ...(payload.start === null || payload.finish === null
      ? {
          ...routePlannerInitialState,
          preventHint: state.preventHint,
          transportType: state.transportType,
          mode: state.mode,
          weighting:
            state.transportType === 'foot-stroller' &&
            state.weighting === 'fastest'
              ? 'short_fastest'
              : state.weighting,
        }
      : {}),
    start: payload.start,
    finish:
      transportTypeDefs[payload.transportType].api === 'gh' &&
      (payload.mode ?? state.mode) !== 'route'
        ? null
        : payload.finish,
    midpoints:
      (transportTypeDefs[payload.transportType].api === 'gh' &&
        (payload.mode ?? state.mode) !== 'route') ||
      isSpecial(payload.transportType)
        ? []
        : payload.midpoints,
    transportType: payload.transportType,
    mode: isSpecial(payload.transportType)
      ? 'route'
      : transportTypeDefs[payload.transportType].api !== 'gh' &&
        payload.mode === 'isochrone'
      ? 'route'
      : payload.mode || 'route',
    milestones: !!payload.milestones,
    weighting:
      state.transportType === 'foot-stroller' &&
      (payload.weighting ?? 'fastest') === 'fastest'
        ? 'short_fastest'
        : payload.weighting ?? 'fastest',
    roundtripParams: {
      ...state.roundtripParams,
      ...payload.roundtripParams,
    },
    isochroneParams: {
      ...state.isochroneParams,
      ...payload.isochroneParams,
    },
  }))
  .handleAction(routePlannerSetStart, (state, { payload }) => ({
    ...state,
    start: payload.start,
    midpoints:
      !(
        transportTypeDefs[state.transportType].api === 'gh' &&
        state.mode !== 'route'
      ) &&
      !isSpecial(state.transportType) &&
      !payload.move &&
      state.start
        ? [state.start, ...state.midpoints]
        : state.midpoints,
    pickMode: state.finish ? state.pickMode : 'finish',
  }))
  .handleAction(routePlannerSetFinish, (state, { payload }) =>
    payload.finish === null
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
          finish: payload.finish,
          midpoints:
            !isSpecial(state.transportType) && !payload.move && state.finish
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
  .handleAction(
    routePlannerAddMidpoint,
    (state, { payload: { position, midpoint } }) =>
      produce(state, (draft) => {
        draft.midpoints.splice(position, 0, midpoint);
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
  .handleAction(
    routePlannerSetTransportType,
    (state, { payload: transportType }) => ({
      ...state,
      ...clearResult,
      transportType,
      mode:
        isSpecial(transportType) ||
        (transportTypeDefs[transportType].api !== 'gh' &&
          state.mode === 'isochrone')
          ? 'route'
          : state.mode,
      weighting:
        transportType === 'foot-stroller' ? 'short_fastest' : 'fastest',
    }),
  )
  .handleAction(routePlannerSetMode, (state, { payload: mode }) => ({
    ...state,
    ...clearResult,
    midpoints:
      transportTypeDefs[state.transportType].api === 'gh' && mode !== 'route'
        ? []
        : state.midpoints,
    finish:
      transportTypeDefs[state.transportType].api === 'gh' && mode !== 'route'
        ? null
        : state.finish,
    mode:
      isSpecial(state.transportType) ||
      (transportTypeDefs[state.transportType].api !== 'gh' &&
        mode === 'isochrone')
        ? 'route'
        : mode,
  }))
  .handleAction(routePlannerSetWeighting, (state, action) => ({
    ...state,
    ...clearResult,
    weighting: action.payload,
  }))
  .handleAction(routePlannerSetPickMode, (state, action) => ({
    ...state,
    pickMode: action.payload,
  }))
  .handleAction(routePlannerToggleItineraryVisibility, (state) => ({
    ...state,
    itineraryIsVisible: !state.itineraryIsVisible,
  }))
  .handleAction(
    routePlannerSetResult,
    (
      state,
      { payload: { alternatives, waypoints, timestamp, transportType } },
    ) => ({
      ...state,
      ...clearResult,
      alternatives,
      waypoints,
      timestamp,
      activeAlternativeIndex: 0,
      midpoints:
        (transportTypeDefs[state.transportType].api === 'gh' &&
          state.mode !== 'route') ||
        isSpecial(transportType)
          ? []
          : state.midpoints,
    }),
  )
  .handleAction(
    routePlannerSetIsochrones,
    (state, { payload: { isochrones, timestamp } }) => ({
      ...state,
      ...clearResult,
      isochrones,
      timestamp,
      midpoints: [],
    }),
  )
  .handleAction(routePlannerSetActiveAlternativeIndex, (state, action) => ({
    ...state,
    activeAlternativeIndex: action.payload,
  }))
  .handleAction(routePlannerSetRoundtripParams, (state, { payload }) => ({
    ...state,
    roundtripParams: {
      ...state.roundtripParams,
      ...payload,
    },
  }))
  .handleAction(routePlannerSetIsochroneParams, (state, { payload }) => ({
    ...state,
    isochroneParams: {
      ...state.isochroneParams,
      ...payload,
    },
  }))
  .handleAction(
    mapsLoaded,
    (
      state,
      {
        payload: {
          data: { routePlanner },
        },
      },
    ) => ({
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
    }),
  );

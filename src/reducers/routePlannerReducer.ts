import { createReducer } from '@reduxjs/toolkit';
import { Feature, Polygon } from 'geojson';
import {
  clearMapFeatures,
  selectFeature,
  setTool,
} from '../actions/mainActions.js';
import { mapsLoaded } from '../actions/mapsActions.js';
import {
  Alternative,
  IsochroneParams,
  PickMode,
  RoundtripParams,
  routePlannerAddMidpoint,
  routePlannerDelete,
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
} from '../actions/routePlannerActions.js';
import {
  isSpecial,
  TransportType,
  transportTypeDefs,
} from '../transportTypeDefs.js';
import { LatLon } from '../types/common.js';

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
  milestones: 'abs' | 'rel' | false;
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

export const routePlannerReducer = createReducer(
  routePlannerInitialState,
  (builder) =>
    builder
      .addCase(routePlannerDelete, (state) => ({
        ...routePlannerInitialState,
        transportType: state.transportType,
        mode: state.mode,
        milestones: state.milestones,
        pickMode: 'start',
        preventHint: state.preventHint,
      }))
      .addCase(routePlannerPreventHint, (state) => {
        return {
          ...state,
          preventHint: true,
        };
      })
      .addCase(routePlannerToggleMilestones, (state, action) => {
        return {
          ...state,
          milestones:
            action.payload.toggle && state.milestones === action.payload.type
              ? false
              : action.payload.type,
        };
      })
      .addCase(selectFeature, (state) => ({
        ...state,
        pickMode: null,
      }))
      .addCase(setTool, (state, action) => ({
        ...state,
        pickMode: !state.start
          ? 'start'
          : action.payload === 'route-planner'
            ? state.pickMode
            : null,
      }))
      .addCase(clearMapFeatures, (state) => ({
        ...routePlannerInitialState,
        preventHint: state.preventHint,
        transportType: state.transportType,
        mode: state.mode,
        milestones: state.milestones,
        pickMode: 'start',
      }))
      .addCase(routePlannerSetParams, (state, { payload }) => ({
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
        milestones: payload.milestones ?? false,
        weighting:
          state.transportType === 'foot-stroller' &&
          (payload.weighting ?? 'fastest') === 'fastest'
            ? 'short_fastest'
            : (payload.weighting ?? 'fastest'),
        roundtripParams: {
          ...state.roundtripParams,
          ...payload.roundtripParams,
        },
        isochroneParams: {
          ...state.isochroneParams,
          ...payload.isochroneParams,
        },
      }))
      .addCase(routePlannerSetStart, (state, { payload }) => ({
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
      .addCase(routePlannerSetFinish, (state, { payload }) =>
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
      .addCase(routePlannerSwapEnds, (state) => ({
        ...state,
        start: state.finish,
        finish: state.start,
        midpoints: [...state.midpoints].reverse(),
      }))
      .addCase(
        routePlannerAddMidpoint,
        (state, { payload: { position, midpoint } }) => {
          state.midpoints.splice(position, 0, midpoint);
        },
      )
      .addCase(routePlannerSetMidpoint, (state, action) => {
        state.midpoints[action.payload.position] = action.payload.midpoint;
      })
      .addCase(routePlannerRemoveMidpoint, (state, action) => {
        state.midpoints.splice(action.payload, 1);
      })
      .addCase(
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
      .addCase(routePlannerSetMode, (state, { payload: mode }) => ({
        ...state,
        ...clearResult,
        midpoints:
          transportTypeDefs[state.transportType].api === 'gh' &&
          mode !== 'route'
            ? []
            : state.midpoints,
        finish:
          transportTypeDefs[state.transportType].api === 'gh' &&
          mode !== 'route'
            ? null
            : state.finish,
        mode:
          isSpecial(state.transportType) ||
          (transportTypeDefs[state.transportType].api !== 'gh' &&
            mode === 'isochrone')
            ? 'route'
            : mode,
      }))
      .addCase(routePlannerSetWeighting, (state, action) => ({
        ...state,
        ...clearResult,
        weighting: action.payload,
      }))
      .addCase(routePlannerSetPickMode, (state, action) => ({
        ...state,
        pickMode: action.payload,
      }))
      .addCase(routePlannerToggleItineraryVisibility, (state) => ({
        ...state,
        itineraryIsVisible: !state.itineraryIsVisible,
      }))
      .addCase(
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
      .addCase(
        routePlannerSetIsochrones,
        (state, { payload: { isochrones, timestamp } }) => ({
          ...state,
          ...clearResult,
          isochrones,
          timestamp,
          midpoints: [],
        }),
      )
      .addCase(routePlannerSetActiveAlternativeIndex, (state, action) => ({
        ...state,
        activeAlternativeIndex: action.payload,
      }))
      .addCase(routePlannerSetRoundtripParams, (state, { payload }) => ({
        ...state,
        roundtripParams: {
          ...state.roundtripParams,
          ...payload,
        },
      }))
      .addCase(routePlannerSetIsochroneParams, (state, { payload }) => ({
        ...state,
        isochroneParams: {
          ...state.isochroneParams,
          ...payload,
        },
      }))
      .addCase(
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
            routePlanner?.transportType ??
            routePlannerInitialState.transportType,
          start: routePlanner?.start ?? routePlannerInitialState.start,
          midpoints:
            routePlanner?.midpoints ?? routePlannerInitialState.midpoints,
          finish: routePlanner?.finish ?? routePlannerInitialState.finish,
          pickMode: routePlanner?.pickMode ?? routePlannerInitialState.pickMode,
          mode: routePlanner?.mode ?? routePlannerInitialState.mode,
          milestones:
            routePlanner?.milestones ?? routePlannerInitialState.milestones,
        }),
      ),
);

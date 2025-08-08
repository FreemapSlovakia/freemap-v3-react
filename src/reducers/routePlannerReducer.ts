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
  routePlannerAddPoint,
  routePlannerDelete,
  routePlannerPreventHint,
  routePlannerRemovePoint,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetFinish,
  routePlannerSetIsochroneParams,
  routePlannerSetIsochrones,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetPickMode,
  routePlannerSetPoint,
  routePlannerSetResult,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleMilestones,
  RoutePoint,
  RoutingMode,
  Waypoint,
} from '../actions/routePlannerActions.js';
import { TransportType, transportTypeDefs } from '../transportTypeDefs.js';

export interface RoutePlannerCleanResultState {
  alternatives: Alternative[];
  waypoints: Waypoint[];
  activeAlternativeIndex: number;
  timestamp: number | null;
  isochrones: Feature<Polygon>[] | null;
}

export interface RoutePlannerCleanState extends RoutePlannerCleanResultState {
  points: RoutePoint[];
  finishOnly: boolean;
  pickMode: PickMode | null;
  itineraryIsVisible: boolean;
  roundtripParams: RoundtripParams;
  isochroneParams: IsochroneParams;
  hash?: string;
}

const clearResult: RoutePlannerCleanResultState = {
  alternatives: [],
  waypoints: [],
  activeAlternativeIndex: 0,
  timestamp: null,
  isochrones: null,
};

export const cleanState: RoutePlannerCleanState = {
  points: [],
  finishOnly: false,
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
  milestones: 'abs' | 'rel' | false;
  preventHint: boolean;
}

export const routePlannerInitialState: RoutePlannerState = {
  transportType: 'hiking',
  mode: 'route',
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
      .addCase(selectFeature, (state, { payload }) => ({
        ...state,
        pickMode:
          payload?.type === 'route-point'
            ? payload.id === 0 && !state.finishOnly
              ? 'start'
              : payload.id === state.points.length - 1
                ? 'finish'
                : null
            : null,
      }))
      .addCase(setTool, (state) => ({
        ...state,
        pickMode: 'start',
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
        ...(payload.points.length === 0
          ? {
              ...routePlannerInitialState,
              preventHint: state.preventHint,
              transportType: state.transportType,
              mode: state.mode,
            }
          : {}),
        points: payload.points, // TODO mangle - see below old commented code
        finishOnly: payload.finishOnly,
        // start: payload.start,
        // finish:
        //   transportTypeDefs[payload.transportType].api === 'gh' &&
        //   (payload.mode ?? state.mode) !== 'route'
        //     ? null
        //     : payload.finish,
        // midpoints:
        //   transportTypeDefs[payload.transportType].api === 'gh' &&
        //   (payload.mode ?? state.mode) !== 'route'
        //     ? []
        //     : payload.midpoints,
        transportType: payload.transportType,
        mode:
          transportTypeDefs[payload.transportType].api !== 'gh' &&
          payload.mode === 'isochrone'
            ? 'route'
            : payload.mode || 'route',
        milestones: payload.milestones ?? false,
        roundtripParams: {
          ...state.roundtripParams,
          ...payload.roundtripParams,
        },
        isochroneParams: {
          ...state.isochroneParams,
          ...payload.isochroneParams,
        },
        hash: payload.hash,
      }))
      .addCase(routePlannerSetStart, (state, { payload }) => ({
        ...state,
        points:
          (!(
            transportTypeDefs[state.transportType].api === 'gh' &&
            state.mode !== 'route'
          ) &&
            getStart(state)) ||
          state.finishOnly
            ? [
                { manual: state.points[0]?.manual ?? false, ...payload },
                ...state.points,
              ]
            : [
                { manual: state.points[0]?.manual ?? false, ...payload },
                ...state.points.slice(1),
              ],
        finishOnly: false,
        pickMode: getFinish(state) ? state.pickMode : 'finish',
      }))
      .addCase(routePlannerSetFinish, (state, { payload }) =>
        // only possible in (round)trip mode
        payload === null
          ? {
              ...state,
              points: state.points.slice(0, state.points.length - 1),
              pickMode: getStart(state) ? 'finish' : 'start',
              finishOnly: false,
            }
          : {
              ...state,
              points:
                state.points.length > 1
                  ? [
                      ...state.points.slice(0, -1),
                      {
                        ...state.points.at(-1)!,
                        manual: state.points.at(-2)!.manual,
                      },
                      { manual: false, ...payload },
                    ]
                  : [...state.points, { manual: false, ...payload }],
              pickMode: getStart(state) ? 'finish' : 'start',
              finishOnly: state.points.length === 0,
            },
      )
      .addCase(routePlannerSwapEnds, (state) => {
        state.points.reverse();

        for (let i = 1; i < state.points.length; i++) {
          state.points[i - 1].manual = state.points[i].manual;
        }

        state.points[state.points.length - 1].manual = false;
      })
      .addCase(
        routePlannerAddPoint,
        (state, { payload: { position, point: midpoint } }) => {
          state.points.splice(position + 1, 0, {
            ...midpoint,
            manual: midpoint.manual ?? state.points[position]?.manual ?? false,
          });
        },
      )
      .addCase(routePlannerSetPoint, (state, action) => {
        state.points[action.payload.position] = action.payload.point;
      })
      .addCase(routePlannerRemovePoint, (state, action) => {
        state.points.splice(action.payload, 1);
      })
      .addCase(
        routePlannerSetTransportType,
        (state, { payload: transportType }) => ({
          ...state,
          ...clearResult,
          transportType,
          mode:
            transportTypeDefs[transportType].api ===
            transportTypeDefs[state.transportType].api
              ? state.mode
              : 'route',
        }),
      )
      .addCase(routePlannerSetMode, (state, { payload: mode }) => {
        if (
          transportTypeDefs[state.transportType].api === 'gh' &&
          mode !== 'route'
        ) {
          state.finishOnly = false;

          state.points.splice(1);
        }

        state.mode =
          transportTypeDefs[state.transportType].api !== 'gh' &&
          mode === 'isochrone'
            ? 'route'
            : mode;
      })
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
        (state, { payload: { alternatives, waypoints, timestamp } }) => ({
          ...state,
          ...clearResult,
          alternatives,
          waypoints,
          timestamp,
          activeAlternativeIndex: 0,
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
          points: routePlanner?.points ?? routePlannerInitialState.points,
          pickMode: routePlanner?.pickMode ?? routePlannerInitialState.pickMode,
          mode: routePlanner?.mode ?? routePlannerInitialState.mode,
          milestones:
            routePlanner?.milestones ?? routePlannerInitialState.milestones,
        }),
      ),
);

function getStart(state: RoutePlannerState) {
  return state.finishOnly ? null : state.points[0];
}

function getFinish(state: RoutePlannerState) {
  return !state.finishOnly && state.points.length < 2
    ? undefined
    : state.points.at(-1);
}

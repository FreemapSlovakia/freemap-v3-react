import { LatLon } from 'fm3/types/common';
import { createStandardAction, createAction } from 'typesafe-actions';
import { RouteMode } from 'fm3/reducers/routePlannerReducer';

export type RoutingMode = 'trip' | 'roundtrip' | 'route';

export type TransportType =
  | 'car-free'
  | 'foot-stroller'
  | 'car'
  | 'bikesharing'
  | 'imhd'
  | 'bike'
  | 'nordic'
  | 'ski'
  | 'foot';

export interface IStep {
  maneuver: {
    location: LatLon;
    type: string; // TODO enum?
    modifier: string; // TODO enum?
  };
  distance: number;
  duration: number;
  name: string;
  type: string; // TODO enum?
  modifier; // TODO enum?
  mode: RoutingMode;
  shapePoints: any;
  legIndex: number;
  extra: any;
}

export interface IAlternative {
  itinerary: IStep[];
  distance: number;
  duration: number;
  extra: any; // TODO
}

export const routePlannerSetStart = createStandardAction(
  'ROUTE_PLANNER_SET_START',
)<{ start: LatLon | null; move?: boolean }>();

export const routePlannerSetFinish = createStandardAction(
  'ROUTE_PLANNER_SET_FINISH',
)<{ finish: LatLon | null; move?: boolean }>();

export const routePlannerAddMidpoint = createStandardAction(
  'ROUTE_PLANNER_ADD_MIDPOINT',
)<{ midpoint: LatLon; position: number }>();

export const routePlannerSetMidpoint = createStandardAction(
  'ROUTE_PLANNER_SET_MIDPOINT',
)<{ midpoint: LatLon; position: number }>();

export const routePlannerRemoveMidpoint = createStandardAction(
  'ROUTE_PLANNER_REMOVE_MIDPOINT',
)<number>();

export const routePlannerSetTransportType = createStandardAction(
  'ROUTE_PLANNER_SET_TRANSPORT_TYPE',
)<TransportType>();

export const routePlannerSetMode = createStandardAction(
  'ROUTE_PLANNER_SET_MODE',
)<RoutingMode>();

export const routePlannerSetPickMode = createStandardAction(
  'ROUTE_PLANNER_SET_PICK_MODE',
)<'start' | 'finish'>();

export const routePlannerSetResult = createStandardAction(
  'ROUTE_PLANNER_SET_RESULT',
)<{
  timestamp: number;
  transportType: TransportType;
  alternatives: IAlternative[];
}>();

export const routePlannerToggleItineraryVisibility = createAction(
  'ROUTE_PLANNER_TOGGLE_ITINERARY_VISIBILITY',
);

export const routePlannerSetParams = createStandardAction(
  'ROUTE_PLANNER_SET_PARAMS',
)<{
  start: LatLon | null;
  finish: LatLon | null;
  midpoints: LatLon[];
  transportType: TransportType | null;
  mode?: RouteMode | null;
}>();

export const routePlannerPreventHint = createAction(
  'ROUTE_PLANNER_PREVENT_HINT',
);
export const routePlannerSetActiveAlternativeIndex = createStandardAction(
  'ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX',
)<number>();

export const routePlannerToggleElevationChart = createAction(
  'ROUTE_PLANNER_TOGGLE_ELEVATION_CHART',
);
export const routePlannerSwapEnds = createAction('ROUTE_PLANNER_SWAP_ENDS');

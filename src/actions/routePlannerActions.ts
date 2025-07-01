import { createAction } from '@reduxjs/toolkit';
import { Feature, Polygon } from 'geojson';
import { TransportType } from '../transportTypeDefs.js';
import type { LatLon } from '../types/common.js';

export type PickMode = 'start' | 'finish';

export type RoutingMode = 'route' | 'trip' | 'roundtrip' | 'isochrone';

export type SliceMode =
  | 'foot'
  | 'walking'
  | 'cycling'
  | 'driving'
  | 'ferry'
  | 'train'
  | 'pushing bike';

export type ManeuerModifier =
  | 'uturn'
  | 'sharp right'
  | 'slight right'
  | 'right'
  | 'sharp left'
  | 'slight left'
  | 'left'
  | 'straight';

export interface RouteStepExtra {
  type: 'foot' | 'bicycle';
  destination: string;
  departure?: number;
  duration?: number;
  number?: number;
}

export interface Leg {
  steps: Step[];
  distance: number;
  duration: number;
}

export interface Step {
  maneuver: {
    type:
      | 'turn'
      | 'new name'
      | 'depart'
      | 'arrive'
      | 'merge'
      | 'on ramp'
      | 'off ramp'
      | 'fork'
      | 'end of road'
      | 'continue'
      | 'roundabout'
      | 'rotary'
      | 'roundabout turn'
      | 'exit rotary'
      | 'exit roundabout'
      | 'notification';
    modifier?: ManeuerModifier;
  };
  distance: number;
  duration: number;
  name: string;
  mode: SliceMode;
  geometry: {
    coordinates: [number, number][];
  };
  extra?: RouteStepExtra;
}

export interface Alternative {
  legs: Leg[];
  distance: number;
  duration: number;
}

export interface Waypoint {
  name: string;
  location: [number, number];
  distance?: number;
  waypoint_index?: number;
  trips_index?: number;
}

export type RoundtripParams = {
  distance: number;
  seed: number;
};

export type IsochroneParams = {
  buckets: number;
  distanceLimit: number;
  timeLimit: number;
};

export const routePlannerSetStart = createAction<{
  start: LatLon | null;
  move?: boolean;
}>('ROUTE_PLANNER_SET_START');

export const routePlannerSetFinish = createAction<{
  finish: LatLon | null;
  move?: boolean;
}>('ROUTE_PLANNER_SET_FINISH');

export const routePlannerSetFromCurrentPosition = createAction<PickMode>(
  'ROUTE_PLANNER_SET_FROM_CURRENT_POSITION',
);

export const routePlannerAddMidpoint = createAction<{
  midpoint: LatLon;
  position: number;
}>('ROUTE_PLANNER_ADD_MIDPOINT');

export const routePlannerSetMidpoint = createAction<{
  midpoint: LatLon;
  position: number;
}>('ROUTE_PLANNER_SET_MIDPOINT');

export const routePlannerRemoveMidpoint = createAction<number>(
  'ROUTE_PLANNER_REMOVE_MIDPOINT',
);

export const routePlannerSetTransportType = createAction<TransportType>(
  'ROUTE_PLANNER_SET_TRANSPORT_TYPE',
);

export const routePlannerSetMode = createAction<RoutingMode>(
  'ROUTE_PLANNER_SET_OSRM_MODE',
);

export const routePlannerSetGhMode = createAction<RoutingMode>(
  'ROUTE_PLANNER_SET_GH_MODE',
);

export const routePlannerSetPickMode = createAction<PickMode>(
  'ROUTE_PLANNER_SET_PICK_MODE',
);

export const routePlannerSetResult = createAction<{
  timestamp: number;
  transportType: TransportType;
  alternatives: Alternative[];
  waypoints: Waypoint[];
}>('ROUTE_PLANNER_SET_RESULT');

export const routePlannerSetIsochrones = createAction<{
  isochrones: Feature<Polygon>[];
  timestamp: number;
}>('ROUTE_PLANNER_SET_ISOCHRONES');

export const routePlannerToggleItineraryVisibility = createAction(
  'ROUTE_PLANNER_TOGGLE_ITINERARY_VISIBILITY',
);

export const routePlannerSetParams = createAction<{
  start: LatLon | null;
  finish: LatLon | null;
  midpoints: LatLon[];
  transportType: TransportType;
  mode?: RoutingMode | null;
  milestones?: 'abs' | 'rel' | false;
  roundtripParams?: Partial<RoundtripParams>;
  isochroneParams?: Partial<IsochroneParams>;
}>('ROUTE_PLANNER_SET_PARAMS');

export const routePlannerPreventHint = createAction(
  'ROUTE_PLANNER_PREVENT_HINT',
);

export const routePlannerSetActiveAlternativeIndex = createAction<number>(
  'ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX',
);

export const routePlannerToggleElevationChart = createAction(
  'ROUTE_PLANNER_TOGGLE_ELEVATION_CHART',
);

export const routePlannerSwapEnds = createAction('ROUTE_PLANNER_SWAP_ENDS');

export const routePlannerToggleMilestones = createAction<{
  type: 'abs' | 'rel';
  toggle?: boolean;
}>('ROUTE_PLANNER_TOGGLE_MILESTONES');

export const routePlannerSetRoundtripParams = createAction<
  Partial<RoundtripParams>
>('ROUTE_PLANNER_SET_ROUNDTRIP_PARAMS');

export const routePlannerSetIsochroneParams = createAction<
  Partial<IsochroneParams>
>('ROUTE_PLANNER_SET_ISOCHRONE_PARAMS');

export const routePlannerDelete = createAction('ROUTE_PLANNER_DELETE');

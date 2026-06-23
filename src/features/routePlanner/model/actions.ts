import { createAction } from '@reduxjs/toolkit';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import {
  TransportType,
  TransportTypeSchema,
} from '@shared/transportTypeDefs.js';
import { type LatLon, LatLonSchema } from '@shared/types/common.js';
import { Feature, LineString, Polygon } from 'geojson';
import z from 'zod';

export const RoutePointSchema = z.object({
  ...LatLonSchema.shape,
  transport: TransportTypeSchema.optional(),
});

export type RoutePoint = z.infer<typeof RoutePointSchema>;

export type NewRoutePoint = LatLon & { transport?: TransportType };

export const PickModeSchema = z.enum(['start', 'finish']);

export type PickMode = z.infer<typeof PickModeSchema>;

export const RoutingModeSchema = z.enum([
  'route',
  'trip',
  'roundtrip',
  'isochrone',
]);

export type RoutingMode = z.infer<typeof RoutingModeSchema>;

export type StepMode =
  | 'foot'
  | 'walking'
  | 'cycling'
  | 'driving'
  | 'ferry'
  | 'train'
  | 'pushing bike'
  | 'manual'
  | 'error';

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

/** A `[lon, lat]` or `[lon, lat, ele]` coordinate; arity can vary per point. */
export type StepCoordinate = [number, number] | [number, number, number];

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
  mode: StepMode;
  geometry: {
    coordinates: StepCoordinate[];
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

export const routePlannerSetStart = createAction<NewRoutePoint>(
  'ROUTE_PLANNER_SET_START',
);

export const routePlannerSetFinish = createAction<NewRoutePoint | null>(
  'ROUTE_PLANNER_SET_FINISH',
);

export const routePlannerSetFromCurrentPosition = createAction<PickMode>(
  'ROUTE_PLANNER_SET_FROM_CURRENT_POSITION',
);

export const routePlannerAddPoint = createAction<{
  point: NewRoutePoint;
  position: number;
}>('ROUTE_PLANNER_ADD_POINT');

export const routePlannerSetPoint = createAction<{
  point: RoutePoint;
  position: number;
  preventSelect?: boolean;
}>('ROUTE_PLANNER_SET_POINT');

export const routePlannerRemovePoint = createAction<number>(
  'ROUTE_PLANNER_REMOVE_POINT',
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
  points: RoutePoint[];
  finishOnly: boolean;
  transportType: TransportType;
  mode?: RoutingMode | null;
  milestones?: 'abs' | 'rel' | false;
  roundtripParams?: Partial<RoundtripParams>;
  isochroneParams?: Partial<IsochroneParams>;
  hash?: string;
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

export const routePlannerColorizeBy = createAction<ColorizingMode | null>(
  'ROUTE_PLANNER_COLORIZE_BY',
);

/**
 * Caches a render-only line for the active alternative: every elevation comes
 * from our terrain model (the router's own elevation is ignored) and long
 * segments are densified at DEM resolution. Fed to the elevation chart and the
 * elevation/steepness colorize only; the source `alternatives` (and thus export
 * and the drawn route) stay GraphHopper's. Cleared whenever the result or the
 * active alternative changes.
 */
export const routePlannerSetRenderGeojson = createAction<Feature<LineString>>(
  'ROUTE_PLANNER_SET_RENDER_GEOJSON',
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

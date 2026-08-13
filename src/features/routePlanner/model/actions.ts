import { createAction } from '@reduxjs/toolkit';
import type { ColorizingMode } from '@shared/colorizers/index.js';
import {
  type TransportType,
  TransportTypeSchema,
} from '@shared/transportTypeDefs.js';
import { type LatLon, LatLonSchema } from '@shared/types/common.js';
import { serializeLatLon } from '@shared/urlSerialization.js';
import type { Feature, LineString, Polygon } from 'geojson';
import { hash } from 'ohash';
import z from 'zod';
import {
  GeoJSON2DPositionSchema,
  GeoJSON3DPositionSchema,
  GeoJSONFeatureGenericSchema,
  GeoJSONLineStringSchema,
  GeoJSONPositionSchema,
  GeoJSONPropertiesSchema,
} from 'zod-geojson';

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

export type RoundtripParams = {
  distance: number;
  seed: number;
};

export type IsochroneParams = {
  buckets: number;
  distanceLimit: number;
  timeLimit: number;
};

// The route result is schema-first: a saved map document carries it, so the
// shapes have to be parseable on the way back in and can't be allowed to drift
// from the types the app works with.

export const StepModeSchema = z.enum([
  'foot',
  'walking',
  'cycling',
  'driving',
  'ferry',
  'train',
  'pushing bike',
  'manual',
  'error',
]);

export type StepMode = z.infer<typeof StepModeSchema>;

export const ManeuverModifierSchema = z.enum([
  'uturn',
  'sharp right',
  'slight right',
  'right',
  'sharp left',
  'slight left',
  'left',
  'straight',
]);

export type ManeuerModifier = z.infer<typeof ManeuverModifierSchema>;

export const RouteStepExtraSchema = z.object({
  type: z.enum(['foot', 'bicycle']),
  destination: z.string(),
  departure: z.number().optional(),
  duration: z.number().optional(),
  number: z.number().optional(),
});

export type RouteStepExtra = z.infer<typeof RouteStepExtraSchema>;

/** A `[lon, lat]` or `[lon, lat, ele]` coordinate; arity can vary per point. */
export const StepCoordinateSchema = z.union([
  GeoJSON2DPositionSchema,
  GeoJSON3DPositionSchema,
]);

export type StepCoordinate = z.infer<typeof StepCoordinateSchema>;

/**
 * A stretch of a step carried by a bridge or running through a tunnel, as
 * inclusive indices into the step's own `geometry.coordinates`. The terrain
 * model describes the ground there, not the road, so the elevation between the
 * abutments (or portals) is not the road's.
 */
export const StepStructureSchema = z.object({
  from: z.number(),
  to: z.number(),
  kind: z.enum(['bridge', 'tunnel']),
});

export type StepStructure = z.infer<typeof StepStructureSchema>;

export const StepSchema = z.object({
  maneuver: z.object({
    type: z.enum([
      'turn',
      'new name',
      'depart',
      'arrive',
      'merge',
      'on ramp',
      'off ramp',
      'fork',
      'end of road',
      'continue',
      'roundabout',
      'rotary',
      'roundabout turn',
      'exit rotary',
      'exit roundabout',
      'notification',
    ]),
    modifier: ManeuverModifierSchema.optional(),
  }),
  distance: z.number(),
  duration: z.number(),
  name: z.string(),
  mode: StepModeSchema,
  geometry: z.object({
    coordinates: z.array(StepCoordinateSchema),
  }),
  extra: RouteStepExtraSchema.optional(),
  /** Bridges/tunnels along the step; only GraphHopper reports them. */
  structures: z.array(StepStructureSchema).optional(),
  /**
   * Marks a synthetic straight bridge between two independently-routed
   * segments. Rendered like a `manual` step but not selectable or draggable.
   */
  connector: z.literal(true).optional(),
});

export type Step = z.infer<typeof StepSchema>;

export const LegSchema = z.object({
  steps: z.array(StepSchema),
  distance: z.number(),
  duration: z.number(),
});

export type Leg = z.infer<typeof LegSchema>;

export const AlternativeSchema = z.object({
  legs: z.array(LegSchema),
  distance: z.number(),
  duration: z.number(),
});

export type Alternative = z.infer<typeof AlternativeSchema>;

export const WaypointSchema = z.object({
  name: z.string(),
  location: GeoJSON2DPositionSchema,
  distance: z.number().optional(),
  waypoint_index: z.number().optional(),
  trips_index: z.number().optional(),
});

export type Waypoint = z.infer<typeof WaypointSchema>;

/**
 * The computed route a saved map carries, so opening the map draws what was
 * planned instead of asking the router again — which is what makes a map usable
 * offline, and what stops a saved route from silently changing as the routing
 * graph does.
 */
export const SavedRouteSchema = z.object({
  /** {@link routeKey} of the waypoints, mode and transport this belongs to. */
  key: z.string(),
  /** When it was computed; also discriminates the drawn layers per result. */
  timestamp: z.number(),
  /** The active alternative only — the others are a transient offer. */
  alternative: AlternativeSchema,
  waypoints: z.array(WaypointSchema),
  /**
   * The DEM-sampled, densified elevation line, so the profile, ascent/descent
   * and elevation colorize work offline. Levelling and smoothing are applied at
   * render, so those preferences stay live. Absent where the alternative's own
   * coordinates already carry the same elevation — the whole free tier, where a
   * GraphHopper route is neither densified nor re-sampled.
   */
  geometry: GeoJSONFeatureGenericSchema(
    GeoJSONPositionSchema,
    GeoJSONPropertiesSchema.nullable(),
    GeoJSONLineStringSchema,
  ).optional(),
});

export type SavedRoute = z.infer<typeof SavedRouteSchema>;

/**
 * Identifies the route a result belongs to. Shared with the URL's
 * `route-params-hash` and with the multimodal check in the find-route handler.
 *
 * Normalized to the values the URL carries, because that is the coarsest form
 * the same route comes back in: `serializeLatLon` precision, and an absent
 * transport spelled as an empty one. A key set to `undefined` counts towards a
 * digest too, and the reducer readily produces those (`routePlannerSetStart`)
 * where `JSON.stringify` drops them. Without all three a route reads as a
 * different one purely for having been through storage or the URL.
 */
export function routeKey(route: {
  points: RoutePoint[];
  mode: RoutingMode;
  transportType: TransportType;
  roundtripParams: RoundtripParams;
}): string {
  return hash([
    // A point can be absent — the URL spells a finish-only route with a leading
    // empty one, and tolerates a trailing one — so this reads it exactly as
    // `getMapContentParts` and `serializeLatLon` do.
    route.points.map((point) => [
      serializeLatLon(point),
      point?.transport || null,
    ]),
    route.mode,
    route.transportType,
    // Only where they shape the route, so setting a trip distance and going back
    // to ordered routing doesn't read as a different route.
    route.mode === 'roundtrip' ? route.roundtripParams : null,
  ]);
}

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
  /** {@link routeKey} of what was routed, which the waypoints may already have moved past. */
  key: string;
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
  /**
   * A map named by the URL is about to open and owns the route — it either
   * carries one or asks for it, so routing here would be thrown away. The
   * parameters still apply at once; the restore compares them against the map's
   * stored digest. `mapsRestoreProcessor` then owns the routing.
   */
  deferRouting?: boolean;
}>('ROUTE_PLANNER_SET_PARAMS');

export const routePlannerPreventHint = createAction(
  'ROUTE_PLANNER_PREVENT_HINT',
);

export const routePlannerSetActiveAlternativeIndex = createAction<number>(
  'ROUTE_PLANNER_SET_ACTIVE_ALTERNATIVE_INDEX',
);

export const routePlannerColorizeBy = createAction<ColorizingMode | null>(
  'ROUTE_PLANNER_COLORIZE_BY',
);

export const routePlannerSetColorizeLegend = createAction<boolean | undefined>(
  'ROUTE_PLANNER_SET_COLORIZE_LEGEND',
);

/** User-adjustable display prefs for the drawn route (persisted). */
export type RouteStyle = {
  /** Width of the route line in pixels. */
  lineWidth: number;
  /** Opacity of the route line (and its outline), 0–1. */
  lineOpacity: number;
  /** Opacity of the start/finish/midpoint markers, 0–1. */
  markerOpacity: number;
};

export const routePlannerSetStyle = createAction<RouteStyle>(
  'ROUTE_PLANNER_SET_STYLE',
);

/**
 * Caches the DEM-sampled line for the active alternative: every elevation comes
 * from our terrain model (the router's own elevation is ignored) and long
 * segments are densified at DEM resolution. Cleared whenever the result or the
 * active alternative changes. A saved map carries this line, which is why it is
 * kept apart from the render line below — bridge/tunnel levelling and smoothing
 * read live preferences and are applied on top of it.
 */
export const routePlannerSetSampledGeojson = createAction<Feature<LineString>>(
  'ROUTE_PLANNER_SET_SAMPLED_GEOJSON',
);

/**
 * Caches a render-only line for the active alternative: the sampled line with
 * bridges/tunnels levelled and elevation smoothed. Fed to the elevation chart
 * and the elevation/steepness colorize only; the source `alternatives` (and thus
 * export and the drawn route) stay GraphHopper's.
 */
export const routePlannerSetRenderGeojson = createAction<Feature<LineString>>(
  'ROUTE_PLANNER_SET_RENDER_GEOJSON',
);

/**
 * Discards the route a saved map carried and routes it afresh. The stored route
 * is authoritative once a map has one, so this is the only way to pick up a
 * changed routing graph — and it marks the map as having unsaved changes.
 */
export const routePlannerRecompute = createAction('ROUTE_PLANNER_RECOMPUTE');

/**
 * A recompute came back with a route, so the one the map stored is no longer
 * what's on screen. Kept apart from {@link routePlannerRecompute} because a
 * recompute that fails — offline, or a router that won't answer — must leave the
 * stored route alone rather than lose it.
 */
export const routePlannerSupersedeSavedRoute = createAction(
  'ROUTE_PLANNER_SUPERSEDE_SAVED_ROUTE',
);

/**
 * Records the route the open map has stored, kept apart from the live result so
 * that an edit — or a request that failed — can't lose it. `null` when the map
 * has none, or when there is no map.
 */
export const routePlannerSetSavedRoute = createAction<SavedRoute | null>(
  'ROUTE_PLANNER_SET_SAVED_ROUTE',
);

/**
 * Puts the map's stored route back on screen, for when the waypoints, mode and
 * transport have come back to the ones it names — an edit undone, a transport
 * switched away and back. A no-op unless it really does describe them, so the
 * caller needn't check. Costs no request, and so works offline.
 */
export const routePlannerRestoreSavedRoute = createAction(
  'ROUTE_PLANNER_RESTORE_SAVED_ROUTE',
);

/** Asks for the route the waypoints on screen describe, changing none of them. */
export const routePlannerFindRoute = createAction('ROUTE_PLANNER_FIND_ROUTE');

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

export const OptimizeVariantSchema = z.enum([
  'fixed-start',
  'fixed-start-end',
  'roundtrip',
  'free',
]);

export type OptimizeVariant = z.infer<typeof OptimizeVariantSchema>;

/**
 * Reorders the waypoints to minimize total travel cost (client-side TSP over a
 * GraphHopper cost matrix) and re-routes through the new order. The `variant`
 * picks which endpoints stay locked. GraphHopper `route` mode only.
 */
export const routePlannerOptimizeOrder = createAction<OptimizeVariant>(
  'ROUTE_PLANNER_OPTIMIZE_ORDER',
);

/** Replaces the whole waypoint list; used to apply an optimized order. */
export const routePlannerSetPoints = createAction<RoutePoint[]>(
  'ROUTE_PLANNER_SET_POINTS',
);

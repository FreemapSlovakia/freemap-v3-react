import { LineString } from '@turf/helpers';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';
import {
  Alternative,
  routePlannerAddMidpoint,
  routePlannerPreventHint,
  routePlannerRemoveMidpoint,
  routePlannerSetFinish,
  routePlannerSetMidpoint,
  routePlannerSetMode,
  routePlannerSetParams,
  routePlannerSetResult,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
  Step,
  Waypoint,
} from 'fm3/actions/routePlannerActions';
import { ToastAction, toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { transportTypeDefs } from 'fm3/transportTypeDefs';
import { isActionOf } from 'typesafe-actions';
import { assertType } from 'typescript-is';

const updateRouteTypes = [
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSwapEnds,
  routePlannerAddMidpoint,
  routePlannerSetMidpoint,
  routePlannerRemoveMidpoint,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetParams,
  mapsDataLoaded,
];

enum GraphhopperSign {
  TURN_SHARP_LEFT = -3,
  TURN_LEFT = -2,
  TURN_SLIGHT_LEFT = -1,
  CONTINUE_ON_STREET = 0,
  TURN_SLIGHT_RIGHT = 1,
  TURN_RIGHT = 2,
  TURN_SHARP_RIGHT = 3,
  FINISH = 4,
  VIA_REACHED = 5,
  USE_ROUNDABOUT = 6,
  KEEP_RIGHT = 7,
}

type GraphhopperInstruction = {
  distance: number;
  heading: number;
  sign: GraphhopperSign;
  interval: [number, number];
  text: string;
  time: number;
  street_name: string;
  exit_number?: number; // only for USE_ROUNDABOUT instructions
  turn_angle?: number; // only for USE_ROUNDABOUT instructions
};

type GraphhopperPath = {
  distance: number;
  weight: number;
  time: number;
  transfers: number;
  points_encoded: boolean;
  bbox: [number, number, number, number];
  points: LineString;
  instructions: GraphhopperInstruction[];
  legs?: unknown[]; // missing in doc
  details: Record<string, unknown>; // eg. {"street_name": [[0,2,"Frankfurter Straße"],[2,6,"Zollweg"]]}
  ascend: number;
  descend: number;
  snapped_waypoints: unknown; // LineString;
  points_order?: number[]; // Only present if the optimize parameter was used.
};

type GraphhopperResult = {
  paths: GraphhopperPath[];
};

type OsrmResult = {
  code: string;
  trips?: Alternative[];
  routes?: Alternative[];
  waypoints?: Waypoint[];
};

export const routePlannerFindRouteProcessor: Processor = {
  actionCreator: updateRouteTypes,
  errorKey: 'routePlanner.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const { start, finish, midpoints, transportType, mode } =
      getState().routePlanner;

    if (!start || !finish || !transportType) {
      return;
    }

    const ttDef = transportTypeDefs.find(({ type }) => type === transportType);

    if (!ttDef) {
      throw new Error(`unknown transport type: ${transportType}`);
    }

    const params = {
      alternatives: mode === 'route' || undefined,
      steps: true,
      geometries: 'geojson',
      roundtrip:
        mode === 'roundtrip' ? true : mode === 'trip' ? false : undefined,
      source: mode === 'route' ? undefined : 'first',
      destination: mode === 'trip' ? 'last' : undefined,
      // continue_straight: true,
      exclude: ttDef.exclude,
    };

    let data: unknown;

    try {
      if (ttDef.api === 'gh') {
        data = (
          await httpRequest({
            getState,
            method: 'POST',
            url: 'https://local.gruveo.com/gh/route',
            data: {
              // avoid: 'toll',
              // algorithm: 'round_trip',
              algorithm: midpoints.length > 0 ? 'alternative_route' : undefined,
              round_trip: {
                distance: 10000,
                seed: 546,
                max_paths: 2,
              },
              profile:
                (transportType === 'bike'
                  ? 'mtb'
                  : transportType === 'bike-osm'
                  ? 'bike2'
                  : transportType === 'car'
                  ? 'car'
                  : transportType === 'car-free'
                  ? 'car'
                  : transportType === 'nordic'
                  ? 'hike'
                  : transportType === 'foot-osm'
                  ? 'foot'
                  : 'car') + '_fastest',
              // weighting: 'fastest', // vs short_fastest
              optimize: String(mode === 'trip'),
              points_encoded: false,
              locale: getState().l10n.language,
              points: [
                [start.lon, start.lat],
                ...midpoints.map((mp) => [mp.lon, mp.lat]),
                [finish.lon, finish.lat],
              ],
            },
            cancelActions: updateRouteTypes,
          })
        ).data;
      } else {
        const allPoints = [
          [start.lon, start.lat].join(','),
          ...midpoints.map((mp) => [mp.lon, mp.lat].join(',')),
          [finish.lon, finish.lat].join(','),
        ].join(';');

        data = (
          await httpRequest({
            getState,
            method: 'GET',
            url: `${ttDef.url.replace(
              '$MODE',
              mode === 'route' ? 'route' : 'trip',
            )}/${allPoints}`,
            params,
            expectedStatus: [200, 400],
            cancelActions: updateRouteTypes,
          })
        ).data;
      }
    } catch (err) {
      dispatch(
        routePlannerSetResult({
          timestamp: Date.now(),
          transportType,
          alternatives: [],
          waypoints: [],
        }),
      );

      throw err;
    }

    if (ttDef.api === 'gh') {
      const g = assertType<GraphhopperResult>(data);

      dispatch(
        routePlannerSetResult({
          timestamp: Date.now(),
          transportType,
          alternatives: g.paths.map((p) => ({
            duration: p.time,
            distance: p.distance,
            legs: [
              {
                duration: p.time,
                distance: p.distance,
                steps: [
                  {
                    maneuver: {
                      location: [0, 0],
                      type: 'continue',
                    },
                    distance: 0,
                    duration: 0,
                    name: '',
                    mode: 'cycling',
                    geometry: {
                      coordinates: p.points.coordinates as [number, number][],
                    },
                  },
                ],
              },
            ],
          })),
          waypoints: [],
        }),
      );
    } else {
      const { code, trips, routes, waypoints } = assertType<OsrmResult>(data);

      if (code !== 'Ok') {
        dispatch(
          routePlannerSetResult({
            timestamp: Date.now(),
            transportType,
            alternatives: [],
            waypoints: [],
          }),
        );

        dispatch(
          toastsAdd({
            id: 'routePlanner.routeNotFound',
            messageKey: 'routePlanner.routeNotFound',
            style: 'warning',
            timeout: 5000,
          }),
        );

        return;
      }

      const alts = routes || trips || [];

      const alternatives: Alternative[] =
        transportType === 'imhd'
          ? alts.map((alt: Alternative) => addMissingSegments(alt))
          : alts;

      dispatch(
        routePlannerSetResult({
          timestamp: Date.now(),
          transportType,
          alternatives,
          waypoints: waypoints ?? [],
        }),
      );
    }

    const showHint =
      // TODO ??? !getState().routePlanner.shapePoints &&
      !getState().routePlanner.preventHint &&
      !midpoints.length &&
      isActionOf([routePlannerSetStart, routePlannerSetFinish], action);

    if (showHint) {
      const actions: ToastAction[] = [{ nameKey: 'general.ok' }];

      if (getState().main.cookieConsentResult) {
        actions.push({
          nameKey: 'general.preventShowingAgain',
          action: routePlannerPreventHint(),
        });
      }

      dispatch(
        toastsAdd({
          id: 'routePlanner.showMidpointHint',
          messageKey: 'routePlanner.showMidpointHint',
          style: 'info',
          actions,
        }),
      );
    }
  },
};

function coord(step: Step) {
  return step.geometry.coordinates;
}

function addMissingSegments(alt: Alternative) {
  const steps: Step[] = [];

  const routeSteps = alt.legs.flatMap((leg) => leg.steps);

  for (let i = 0; i < routeSteps.length; i += 1) {
    const step = routeSteps[i];

    const prevStep = routeSteps[i - 1];

    const nextStep = routeSteps[i + 1];

    const prevStepLastPoint = prevStep
      ? coord(prevStep)[coord(prevStep).length - 1]
      : null;

    const firstPoint = coord(step)[0];

    const lastShapePoint = coord(step)[coord(step).length - 1];

    const nextStepFirstPoint = nextStep?.geometry.coordinates[0] ?? null;

    const c = coord(step);

    const coordinates = [c[0], c[1]];

    if (step.mode === 'foot') {
      if (
        prevStepLastPoint &&
        (Math.abs(prevStepLastPoint[0] - firstPoint[0]) > 0.0000001 ||
          Math.abs(prevStepLastPoint[1] - firstPoint[1]) > 0.0000001)
      ) {
        coordinates.unshift(prevStepLastPoint);
      }

      if (
        nextStepFirstPoint &&
        (Math.abs(nextStepFirstPoint[0] - lastShapePoint[0]) > 0.0000001 ||
          Math.abs(nextStepFirstPoint[1] - lastShapePoint[1]) > 0.0000001)
      ) {
        coordinates.push(nextStepFirstPoint);
      }
    }

    steps.push({
      ...step,
      geometry: { coordinates },
    });
  }

  return { ...alt, itinerary: steps };
}

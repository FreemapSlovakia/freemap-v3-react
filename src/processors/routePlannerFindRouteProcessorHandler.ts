import { isAnyOf } from '@reduxjs/toolkit';
import distance from '@turf/distance';
import { Feature, LineString, Polygon } from 'geojson';
import { assert } from 'typia';
import { clearMapFeatures, setTool } from '../actions/mainActions.js';
import {
  Alternative,
  Leg,
  routePlannerPreventHint,
  routePlannerSetFinish,
  routePlannerSetIsochrones,
  routePlannerSetResult,
  routePlannerSetStart,
  RoutePoint,
  Step,
  Waypoint,
} from '../actions/routePlannerActions.js';
import { ToastAction, toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';
import { isPremium } from '../premium.js';
import { objectToURLSearchParams } from '../stringUtils.js';
import { transportTypeDefs } from '../transportTypeDefs.js';
import { updateRouteTypes } from './routePlannerFindRouteProcessor.js';

const cancelTypes = [...updateRouteTypes, clearMapFeatures, setTool];

enum GraphhopperSign {
  UNKNOWN = -99,
  U_TURN_UNKNOWN = -98,
  U_TURN_LEFT = -8,
  KEEP_LEFT = -7,
  LEAVE_ROUNDABOUT = -6,
  TURN_SHARP_LEFT = -3,
  TURN_LEFT = -2,
  TURN_SLIGHT_LEFT = -1,
  CONTINUE_ON_STREET = 0,
  TURN_SLIGHT_RIGHT = 1,
  TURN_RIGHT = 2,
  TURN_SHARP_RIGHT = 3,
  FINISH = 4,
  REACHED_VIA = 5,
  USE_ROUNDABOUT = 6,
  IGNORE = -2147483648,
  KEEP_RIGHT = 7,
  U_TURN_RIGHT = 8,
  PT_START_TRIP = 101,
  PT_TRANSFER = 102,
  PT_END_TRIP = 103,
}

type GraphhopperInstruction = {
  distance: number;
  heading?: number;
  sign: GraphhopperSign;
  interval: [number, number];
  text: string;
  time: number;
  street_name: string;
  exit_number?: number; // only for USE_ROUNDABOUT instructions
  turn_angle?: number; // only for USE_ROUNDABOUT instructions
};

type GraphhopperDetailSegment = [from: number, to: number, value: unknown];

type GraphhopperPath = {
  distance: number;
  // weight: number;
  time: number;
  // transfers: number;
  // points_encoded: boolean;
  // bbox: [number, number, number, number];
  points: LineString;
  instructions: GraphhopperInstruction[];
  details: Record<string, GraphhopperDetailSegment[]>; // eg. {"street_name": [[0,2,"Frankfurter Straße"],[2,6,"Zollweg"]]}
  // ascend: number;
  // descend: number;
  // snapped_waypoints: unknown; // LineString;
  // points_order?: number[]; // Only present if the optimize parameter was used.
};

type GraphhopperResult = {
  paths: GraphhopperPath[];
};

type IsochroneResponse = {
  polygons: Feature<Polygon>[];
};

type OsrmResult = {
  code: string;
  trips?: Alternative[];
  routes?: Alternative[];
  waypoints?: Waypoint[];
};

const handle: ProcessorHandler = async ({ dispatch, getState, action }) => {
  const {
    points,
    finishOnly,
    transportType,
    mode,
    roundtripParams,
    isochroneParams,
  } = getState().routePlanner;

  const clearResultAction = routePlannerSetResult({
    timestamp: Date.now(),
    transportType,
    alternatives: [],
    waypoints: [],
  });

  if (points.length === 0 || finishOnly) {
    dispatch(clearResultAction);

    return;
  }

  const ttDef = transportTypeDefs[transportType];

  if (!ttDef) {
    throw new Error(`unknown transport type: ${transportType}`);
  }

  if (points.length < 2 && (ttDef.api === 'osrm' || mode === 'route')) {
    dispatch(clearResultAction);

    return;
  }

  window._paq.push([
    'trackEvent',
    'RoutePlanner',
    'search',
    new URLSearchParams({ transportType, mode }).toString(),
  ]);

  const rnfToastAction = toastsAdd({
    id: 'routePlanner',
    messageKey: 'routePlanner.routeNotFound',
    style: 'warning',
    timeout: 5000,
  });

  if (ttDef.api === 'gh' && mode === 'isochrone') {
    const response = await httpRequest({
      getState,
      url:
        process.env['GRAPHHOPPER_URL'] +
        '/isochrone?' +
        objectToURLSearchParams({
          profile: ttDef.profile,
          buckets: Math.min(5, Math.max(1, isochroneParams.buckets)),
          time_limit: isochroneParams.timeLimit,
          distance_limit: isochroneParams.distanceLimit || -1,
          point: points[0].lat + ',' + points[0].lon,
        }),
      expectedStatus: 200,
      cancelActions: cancelTypes,
    });

    dispatch(
      routePlannerSetIsochrones({
        isochrones: assert<IsochroneResponse>(await response.json()).polygons,
        timestamp: Date.now(),
      }),
    );

    return;
  }

  const segments =
    mode !== 'route' || !isPremium(getState().auth.user)
      ? [{ manual: false, points }]
      : segmentize(points);

  const promise = Promise.all(
    segments
      .filter((segment) => !segment.manual)
      .map((segment) =>
        (async () => {
          if (ttDef.api === 'gh') {
            const response = await httpRequest({
              getState,
              method: 'POST',
              url: process.env['GRAPHHOPPER_URL'] + '/route',
              data: {
                snap_preventions: ['trunk', 'motorway', 'tunnel', 'ferry'],
                // elevation: true, // if to return also elevations
                algorithm:
                  mode === 'roundtrip'
                    ? 'round_trip'
                    : segment.points.length > 2
                      ? undefined
                      : 'alternative_route',
                'round_trip.distance': roundtripParams.distance,
                'round_trip.seed': roundtripParams.seed,
                'ch.disable': mode === 'roundtrip',
                'alternative_route.max_paths': 2, // default is 2
                instructions: true,
                profile: ttDef.profile,
                points_encoded: false,
                locale: getState().l10n.language,
                points: segment.points.map((point) => [point.lon, point.lat]),
              },
              expectedStatus: [200, 400],
              cancelActions: cancelTypes,
            });

            const data = await response.json();

            if (response.status === 400) {
              dispatch(clearResultAction);

              let err: string | undefined;

              if (data && typeof data === 'object' && 'message' in data) {
                const msg = String(data['message']);

                if (
                  msg.startsWith('Cannot find point ') ||
                  msg.startsWith('Connection between locations not found')
                ) {
                  dispatch(rnfToastAction);
                } else {
                  err = msg;
                }
              } else {
                err = '?';
              }

              if (err) {
                dispatch(
                  toastsAdd({
                    id: 'routePlanner',
                    messageKey: 'general.operationError',
                    messageParams: { err },
                    style: 'danger',
                    timeout: 5000,
                  }),
                );
              }

              return;
            }

            return data;
          }

          if (ttDef.api === 'osrm') {
            if (segment.points.length < 2) {
              return;
            }

            const allPoints = segment.points
              .map((point) => [point.lon, point.lat].join(','))
              .join(';');

            const response = await httpRequest({
              getState,
              url:
                `${ttDef.url.replace(
                  '$MODE',
                  mode === 'route' ? 'route' : 'trip',
                )}/${allPoints}?` +
                objectToURLSearchParams({
                  alternatives:
                    (mode === 'route' && segments.length === 1) || undefined,
                  steps: true,
                  geometries: 'geojson',
                  roundtrip:
                    mode === 'roundtrip'
                      ? true
                      : mode === 'trip'
                        ? false
                        : undefined,
                  source: mode === 'route' ? undefined : 'first',
                  destination: mode === 'trip' ? 'last' : undefined,
                  // continue_straight: true,
                  exclude: ttDef.exclude,
                }),
              expectedStatus: [200, 400],
              cancelActions: cancelTypes,
            });

            return await response.json();
          }
        })(),
      ),
  );

  let datas;

  try {
    datas = await promise;
  } catch (err) {
    dispatch(clearResultAction);

    throw err;
  }

  let alternativeSets: Alternative[][];

  let waypoints: Waypoint[];

  if (ttDef.api === 'gh') {
    const results = assert<GraphhopperResult[]>(datas);

    alternativeSets = results.map((result) =>
      result.paths.map((path) => {
        let dist = 0;

        let time = 0;

        const legs: Leg[] = [];

        let steps: Step[] = [];

        const gob = (path.details['get_off_bike'] ?? []).filter((q) => q[2]);

        for (const instruction of path.instructions) {
          dist += instruction.distance;

          time += instruction.time;

          steps.push({
            duration: instruction.time / 1000,
            distance: instruction.distance,
            // TODO
            maneuver: {
              // location: [0, 0],
              type: 'continue',
            },
            name: instruction.text,
            mode: gob.some(
              (seg) =>
                instruction.interval[0] >= seg[0] &&
                instruction.interval[1] <= seg[1],
            )
              ? 'foot'
              : 'cycling', // TODO for non-cycling...; TODO can it happen that not whole interval has the same GOB value?
            geometry: {
              coordinates: path.points.coordinates.slice(
                instruction.interval[0],
                instruction.interval[1] + 1,
              ) as [number, number][],
            },
          });

          if (
            instruction.sign === GraphhopperSign.FINISH ||
            instruction.sign === GraphhopperSign.REACHED_VIA
          ) {
            legs.push({
              distance: dist,
              duration: time / 1000,
              steps,
            });

            dist = 0;

            time = 0;

            steps = [];
          }
        }

        return {
          duration: path.time / 1000,
          distance: path.distance,
          legs,
        };
      }),
    );

    waypoints = [];
  } else {
    // OSRM
    const osrmResults = assert<OsrmResult[]>(datas);

    if (osrmResults.some((result) => result.code !== 'Ok')) {
      dispatch(clearResultAction);

      dispatch(rnfToastAction);

      return;
    }

    waypoints = osrmResults[0]?.waypoints ?? [];

    alternativeSets = osrmResults.map(
      (osrmResult) => osrmResult.routes ?? osrmResult.trips ?? [],
    );
  }

  const alternatives =
    alternativeSets.length === 1
      ? alternativeSets[0]
      : [
          {
            distance: alternativeSets.reduce((a, c) => a + c[0].distance, 0),
            duration: alternativeSets.reduce((a, c) => a + c[0].duration, 0),
            legs: alternativeSets.flatMap((set) => set[0].legs),
          },
        ];

  // add manual segments

  if (segments.some((segment) => segment.manual)) {
    const tpd = alternatives[0].duration / alternatives[0].distance;

    let legIndex = 0;

    for (let j = 0; j < segments.length; j++) {
      const segment = segments[j];

      if (!segment.manual) {
        legIndex += segment.points.length - 1;

        continue;
      }

      const coordinates = segment.points.map(
        (pt) => [pt.lon, pt.lat] as [number, number],
      );

      {
        const lastPt =
          segments[j - 1]?.manual === false &&
          alternatives[0].legs[legIndex - 1]?.steps
            .at(-1)
            ?.geometry.coordinates.at(-1);

        if (lastPt) {
          coordinates[0] = lastPt;
        }
      }

      {
        const firstPt =
          segments[j + 1]?.manual === false &&
          alternatives[0].legs[legIndex]?.steps[0]?.geometry.coordinates[0];

        if (firstPt) {
          coordinates[coordinates.length - 1] = firstPt;
        }
      }

      const dist = distance(coordinates[0], coordinates[1], {
        units: 'meters',
      });

      const duration = tpd * dist;

      const leg: Leg = {
        distance: dist,
        duration,

        steps: [
          {
            distance: dist,
            duration,
            maneuver: { type: 'continue', modifier: 'straight' },
            mode: 'manual',
            name: '',
            geometry: {
              coordinates,
            },
          },
        ],
      };

      alternatives[0].legs.splice(j, 0, leg);

      legIndex += segment.points.length - 1;
    }

    alternatives[0].distance = alternatives[0].legs.reduce(
      (a, c) => a + c.distance,
      0,
    );

    alternatives[0].duration = alternatives[0].legs.reduce(
      (a, c) => a + c.duration,
      0,
    );
  }

  dispatch(
    routePlannerSetResult({
      timestamp: Date.now(),
      transportType,
      alternatives,
      waypoints,
    }),
  );

  const isStartOrFinishAction = isAnyOf(
    routePlannerSetStart,
    routePlannerSetFinish,
  );

  if (
    !(ttDef.api === 'gh' && mode !== 'route') &&
    !getState().routePlanner.preventHint &&
    points.length < 3 &&
    isStartOrFinishAction(action)
  ) {
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
};

function segmentize(points: RoutePoint[]) {
  const segments: { manual: boolean; points: RoutePoint[] }[] = [];

  let prevPoint: RoutePoint | undefined;

  for (const point of points) {
    if (!prevPoint) {
      prevPoint = point;

      continue;
    }

    if (prevPoint?.manual) {
      segments.push({ manual: true, points: [prevPoint] });
    } else if (!(segments.at(-1)?.manual === false)) {
      segments.push({ manual: false, points: [prevPoint] });
    }

    segments.at(-1)?.points.push(point);

    prevPoint = point;
  }

  return segments;
}

export default handle;

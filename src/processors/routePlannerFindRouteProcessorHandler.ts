import { isAnyOf } from '@reduxjs/toolkit';
import { feature } from '@turf/helpers';
import length from '@turf/length';
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

  if (points.length < 2 && !(ttDef.api === 'gh' && mode !== 'route')) {
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

  const [routedSegmetns, manualSegmetns] = segmentize(points);

  const datas: unknown[] = [];

  const promise = Promise.all(
    routedSegmetns.map((points) =>
      (async () => {
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
              isochrones: assert<IsochroneResponse>(await response.json())
                .polygons,
              timestamp: Date.now(),
            }),
          );

          return;
        }

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
                  : points.length > 2
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
              points: points.map((point) => [point.lon, point.lat]),
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

          datas.push(data);
        } else if (points.length > 1) {
          const allPoints = points
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
                alternatives: mode === 'route' || undefined,
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

          datas.push(await response.json());
        }
      })(),
    ),
  );

  try {
    await promise;
  } catch (err) {
    dispatch(clearResultAction);

    throw err;
  }

  if (ttDef.api === 'gh') {
    const parts = assert<GraphhopperResult[]>(datas);

    for (let i = 0; i < manualSegmetns.length; i++) {
      const points: LineString = {
        type: 'LineString',
        coordinates: manualSegmetns[i].map((ms) => [ms.lon, ms.lat]),
      };

      const distance = length(feature(points), { units: 'meters' });

      parts.splice(i * 2 + 1, 0, {
        paths: [
          {
            details: {},
            instructions: [
              {
                distance,
                interval: [0, manualSegmetns[i].length],
                sign: 0,
                time: 0,
                text: '',
                street_name: '',
              },
            ],
            distance,
            time: 0,
            points,
          },
        ],
      });
    }

    console.log(parts);

    let paths;

    if (parts.length > 1) {
      const details: Record<string, GraphhopperDetailSegment[]> = {};

      const instructions: GraphhopperInstruction[] = [];

      let offset = 0;

      for (const part of parts) {
        for (const instruction of part.paths[0].instructions) {
          instructions.push({
            ...instruction,
            interval: [
              instruction.interval[0] + offset,
              instruction.interval[1] + offset,
            ],
          });
        }

        for (const [detailName, detailSegments] of Object.entries(
          part.paths[0].details,
        )) {
          (details[detailName] ??= []).push(
            ...detailSegments.map(
              (ds) =>
                [
                  ds[0] + offset,
                  ds[1] + offset,
                  ds[2],
                ] as GraphhopperDetailSegment,
            ),
          );
        }

        offset += part.paths[0].points.coordinates.length;
      }

      paths = [
        {
          time: parts.reduce((a, c) => a + c.paths[0].time, 0),
          distance: parts.reduce((a, c) => a + c.paths[0].distance, 0),
          instructions: parts.reduce(
            (a, c) => [...a, ...c.paths[0].instructions],
            [] as GraphhopperInstruction[],
          ),
          details,
          points: {
            type: 'LineString',
            coordinates: parts.flatMap(
              (part) => part.paths[0].points.coordinates,
            ),
          },
        } satisfies GraphhopperPath,
      ];
    } else {
      paths = assert<GraphhopperResult>(datas[0]).paths;
    }

    console.log(paths);

    dispatch(
      routePlannerSetResult({
        timestamp: Date.now(),
        transportType,
        alternatives: paths.map((path) => ({
          duration: path.time,
          distance: path.distance,
          legs: (() => {
            let dist = 0;

            let time = 0;

            const legs: Leg[] = [];

            let steps: Step[] = [];

            const gob = (path.details['get_off_bike'] ?? []).filter(
              (q) => q[2],
            );

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

            return legs;
          })(),
        })),
        waypoints: [],
      }),
    );
  } else {
    const { code, trips, routes, waypoints } = assert<OsrmResult>(datas);

    if (code !== 'Ok') {
      dispatch(clearResultAction);

      dispatch(rnfToastAction);

      return;
    }

    const alternatives = routes || trips || [];

    dispatch(
      routePlannerSetResult({
        timestamp: Date.now(),
        transportType,
        alternatives,
        waypoints: waypoints ?? [],
      }),
    );
  }

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
  const routedSegmetns: RoutePoint[][] = [];
  const manualSegmetns: RoutePoint[][] = [];

  let manual = false;
  let prevPoint: RoutePoint | undefined;

  for (const point of points) {
    if (prevPoint?.manual && point.manual) {
      if (!manual) {
        manualSegmetns.push([prevPoint]);
        manual = true;
      }

      manualSegmetns.at(-1)?.push(point);
    } else {
      if (manual) {
        if (prevPoint) {
          routedSegmetns.push([prevPoint]);
        }
      } else if (!prevPoint) {
        routedSegmetns.push([]);
      }

      manual = false;

      routedSegmetns.at(-1)?.push(point);
    }

    prevPoint = point;
  }

  return [routedSegmetns, manualSegmetns];
}

export default handle;

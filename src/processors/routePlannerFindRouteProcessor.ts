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

export const routePlannerFindRouteProcessor: Processor = {
  actionCreator: updateRouteTypes,
  errorKey: 'routePlanner.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const { start, finish, midpoints, transportType, mode } =
      getState().routePlanner;

    if (!start || !finish || !transportType) {
      return;
    }

    const allPoints = [
      [start.lon, start.lat].join(','),
      ...midpoints.map((mp) => [mp.lon, mp.lat].join(',')),
      [finish.lon, finish.lat].join(','),
    ].join(';');

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

    type OsrmResult = {
      code: string;
      trips?: Alternative[];
      routes?: Alternative[];
      waypoints?: Waypoint[];
    };

    const { code, trips, routes, waypoints } = assertType<OsrmResult>(data);

    if (code === 'Ok') {
      const showHint =
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
          waypoints: waypoints || [],
        }),
      );
    } else {
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

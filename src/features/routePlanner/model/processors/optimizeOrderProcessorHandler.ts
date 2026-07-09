import { clearMapFeatures } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { isPremium } from '@features/premium/premium.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import { loadRoutePlannerMessages } from '../../translations/loadRoutePlannerMessages.js';
import {
  type routePlannerOptimizeOrder,
  routePlannerSetPoints,
} from '../actions.js';
import { buildCostMatrix } from '../optimize/buildCostMatrix.js';
import { solveTsp, type TspOptions } from '../optimize/solveTsp.js';
import {
  routePlannerHasTransportOverride,
  routePlannerOptimizeApplicable,
} from '../reducer.js';
import { updateRouteTypes } from './findRouteProcessor.js';

const variantOptions: Record<
  ReturnType<typeof routePlannerOptimizeOrder>['payload'],
  TspOptions
> = {
  'fixed-start': { fixStart: true },
  'fixed-start-end': { fixStart: true, fixEnd: true },
  roundtrip: { roundTrip: true },
  free: { fixStart: false },
};

const samePlace = (a: LatLon, b: LatLon) => a.lat === b.lat && a.lon === b.lon;

const handle: ProcessorHandler<typeof routePlannerOptimizeOrder> = async ({
  getState,
  dispatch,
  action,
}) => {
  const { routePlanner, auth } = getState();

  const { points, transportType, mode } = routePlanner;

  const ttDef = transportTypeDefs[transportType];

  // Premium-only; the menu already gates it, this guards direct dispatches.
  // The applicability/multimodal rules are shared with the menu; the `api`
  // check is redundant with them but narrows `ttDef` to the GraphHopper variant.
  if (
    !isPremium(auth.user) ||
    !routePlannerOptimizeApplicable(routePlanner) ||
    routePlannerHasTransportOverride(routePlanner) ||
    ttDef.api !== 'gh'
  ) {
    return;
  }

  const variant = action.payload;

  // Drop a trailing return-to-start copy left by an earlier round-trip optimize
  // so re-optimizing stays idempotent instead of accumulating duplicates.
  const base =
    points.length > 1 && samePlace(points.at(-1)!, points[0]!)
      ? points.slice(0, -1)
      : points;

  const matrix = await buildCostMatrix({
    points: base,
    profile: ttDef.profile,
    locale: getState().l10n.language,
    getState,
    cancelActions: [...updateRouteTypes, clearMapFeatures],
  });

  // A change to the waypoints, transport, or mode while the matrix built (which
  // also aborts the in-flight legs) supersedes this run; drop it silently.
  const next = getState().routePlanner;

  if (
    next.points !== points ||
    next.transportType !== transportType ||
    next.mode !== mode
  ) {
    return;
  }

  const { order, cost } = solveTsp(matrix, variantOptions[variant]);

  if (!Number.isFinite(cost)) {
    dispatch(
      toastsAdd({
        id: 'routePlanner',
        messageKey: 'routeNotFound',
        messageLoader: loadRoutePlannerMessages,
        style: 'warning',
        timeout: 5000,
      }),
    );

    return;
  }

  const reordered = order.map((i) => base[i]!);

  // Close the loop so the planner actually routes back to the start.
  if (variant === 'roundtrip') {
    reordered.push({ ...base[order[0]!]! });
  }

  // Apply only a genuine change (compared by location, so a no-op round trip
  // doesn't re-trigger routing).
  const changed =
    reordered.length !== points.length ||
    reordered.some((point, i) => !samePlace(point, points[i]!));

  if (changed) {
    dispatch(routePlannerSetPoints(reordered));
  }
};

export default handle;

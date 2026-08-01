import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { dataViewerSetSelectedTrack } from '@features/dataViewer/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  elevationChartClose,
  elevationChartOpen,
  elevationChartRedraw,
  elevationSetSettings,
} from './actions.js';
import { chartIdentity, loadResolver } from './resolve.js';
import { affectsElevationSmoothing } from './settingsReducer.js';
import type { ElevationChartTargetType } from './target.js';

// A drawn line is the one target whose profile is sampled from the elevation
// API rather than read off the feature, and its geometry changes on every
// pointer move of a vertex drag — so its redraws are coalesced. The wait is a
// timer that dispatches `elevationChartRedraw`, not an `await` inside `handle`:
// awaiting there would hold `startProgress`/`stopProgress` open, and cost a
// processor pass, for the whole gesture.
const SETTLE_MS = 250;

let settleTimer: ReturnType<typeof setTimeout> | undefined;

const matomoFeature: Record<ElevationChartTargetType, string> = {
  'route-planner': 'RoutePlanner',
  'track-viewer': 'TrackViewer',
  drawing: 'Drawing',
  tracking: 'Tracking',
};

/**
 * Draws the elevation profile, and is the only thing that does.
 *
 * The chart is a derived view: `elevationChart.target` says what to show, and
 * this resolves it against current state. That is why there is no list of the
 * actions a redraw should follow — `chartIdentity` names the object the profile
 * comes from, so re-routing, switching alternative, reshaping a drawn line,
 * refilling a track's elevation or a position arriving all trigger it by
 * replacing that object, while an action that changes anything else leaves it
 * identical and draws nothing. (Cheap, not free: resolving the identity is a
 * lookup, and the predicate is evaluated for both the new and the previous
 * state on every dispatched action.) The listed actions are the ones that
 * change what to draw without changing what it is drawn from.
 */
export const elevationChartProcessor: Processor = {
  predicatesOperation: 'OR',
  // Opening aims the chart; a settings change re-derives the same line; a
  // redraw is the chart's own debounce coming back.
  actionCreator: [
    elevationChartOpen,
    elevationSetSettings,
    elevationChartRedraw,
    // Which track is active isn't part of the identity below — resolving that
    // would mean scanning every imported feature on every action — so the
    // switch is listened for instead.
    dataViewerSetSelectedTrack,
  ],
  stateChangePredicate: chartIdentity,
  errorKey: 'elevationChart.fetchError',
  handle: async ({ dispatch, getState, action }) => {
    const { target } = getState().elevationChart;

    if (!target) {
      return;
    }

    // Not every elevation setting changes the profile: the steepness window is
    // measured off the drawn points by whoever shows the readout, so changing
    // it alone would resample the whole line for nothing.
    if (
      elevationSetSettings.match(action) &&
      !affectsElevationSmoothing(action.payload)
    ) {
      return;
    }

    // Reported here rather than by each feature's toggle: opening is one event
    // whichever way it was asked for, and this is the one place that sees it.
    // A URL-restored chart is a page load, not a toggle: counting it would let
    // every shared link inflate the figure.
    if (elevationChartOpen.match(action) && !action.payload.fromUrl) {
      trackMatomo([
        'trackEvent',
        matomoFeature[target.type],
        'toggleElevationChart',
      ]);
    }

    // Only *redraws* are coalesced. Opening reads what is already there, so it
    // draws at once — waiting a quarter second to show a chart the user just
    // asked for would read as lag.
    if (
      target.type === 'drawing' &&
      !elevationChartRedraw.match(action) &&
      !elevationChartOpen.match(action)
    ) {
      clearTimeout(settleTimer);

      settleTimer = setTimeout(
        () => dispatch(elevationChartRedraw()),
        SETTLE_MS,
      );

      return;
    }

    const before = chartIdentity(getState());

    const resolved = await (await loadResolver(target.type))(
      getState,
      dispatch,
    );

    // Resolving can take seconds (sampling, densifying). If the chart moved on
    // meanwhile — closed, re-aimed, or superseded by a newer redraw — this
    // answer is stale and must not be drawn over the newer one.
    const after = getState().elevationChart;

    if (after.target !== target) {
      return;
    }

    // `pending` keeps the chart aimed and draws nothing: what it shows is on
    // its way, and its arrival is itself a redraw trigger.
    if (resolved.status !== 'ok') {
      if (resolved.status === 'gone') {
        dispatch(elevationChartClose());
      }

      return;
    }

    // A resolver that had to densify has changed what the profile derives from,
    // so the redraw it triggered will supersede this one — leave it to that.
    if (chartIdentity(getState()) !== before) {
      return;
    }

    const computeProfile = (
      await import(
        /* webpackChunkName: "elevation-chart-processor-handler" */
        './processorHandler.js'
      )
    ).default;

    await computeProfile(
      resolved.source,
      getState,
      dispatch,
      // Sampling can outlive its turn; a response that comes back after the
      // chart moved on must not be drawn over the newer one.
      () => getState().elevationChart.target === target,
    );
  },
};

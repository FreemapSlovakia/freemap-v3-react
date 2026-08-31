import { urlMapIdSelector } from '@features/myMaps/model/selectors.js';
import {
  serializePanoramaTilt,
  serializePanoramaViewpoint,
} from '@features/panorama/panoramaUrl.js';
import { serializeShading } from '@features/parameterizedShading/model/Shading.js';
import { isPremium } from '@features/premium/premium.js';
import { routeKey } from '@features/routePlanner/model/actions.js';
import { serializeToposcope } from '@features/toposcope/toposcopeUrl.js';
import { VIEWSHED_LAYER } from '@features/viewshed/api.js';
import { grantedRadiusKm } from '@features/viewshed/request.js';
import { serializeViewshed } from '@features/viewshed/viewshedUrl.js';
import { wikiPreviewKey } from '@features/wiki/model/wikiPreviewKey.js';
import { isPremiumColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { serializeLatLon } from '@shared/urlSerialization.js';
import { encodeActiveModal } from '../store/activeModal.js';
import type { Processor } from '../store/middleware/processorMiddleware.js';
import {
  openToolsSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '../store/selectors.js';
import type { RootState } from '../store/store.js';
import {
  getMapContentParts,
  type QueryPart,
  serializeQuery,
} from './mapContentParts.js';
import { stashUrl } from './sessionStash.js';
import { serializeZoom } from './urlMapUtils.js';
import { isUrlUpdatingEnabled } from './urlUpdating.js';

// Browser-history policy for map viewport changes (pan/zoom): a contiguous run
// of viewport-only changes collapses into a single history entry via
// `replaceState`, so a burst of small map moves costs one Back press instead of
// many. A fresh entry (`pushState`) is started when anything other than the
// viewport changes (e.g. the map type / layers), or when more than
// VIEW_COALESCE_GAP_MS has elapsed since the last viewport write — so distinct
// panning sessions stay separately navigable.
const VIEW_COALESCE_GAP_MS = 60_000;

// Params that must not cost a history entry each. A change confined to these
// replaces the current entry instead of pushing one, and is rate-limited below.
// Two kinds qualify, for opposite reasons: the map's own viewport and the
// panorama's bearing move as fast as a gesture, and the colorize params are
// reader preferences a URL without them does not undo.
const COALESCED_KEYS = new Set([
  'map',
  'panorama-az',
  // Not gesture-speed, but the same reason applies from the other end: a URL
  // without these does not turn colorizing off (see `handleColorize`), so an
  // entry standing for one would be an entry Back cannot honour.
  'route-colorize-by',
  'route-colorize-legend',
  'track-colorize-by',
  'track-colorize-legend',
  'tracking-colorize-by',
  'tracking-colorize-legend',
  // Comes and goes with the colorize mode above, being written only while a
  // premium feature is in use, and going back to a URL without it does not
  // revoke the unlock. When the route itself changes, the params describing it
  // change too and still push.
  'route-params-hash',
]);

const isContentPart = ([key]: QueryPart) => !COALESCED_KEYS.has(key);

// WebKit rejects history writes past a cap — the SecurityError names 100 per 10
// seconds — and a viewport-only change can arrive as fast as the store updates:
// a live-tracking session refocuses the map on every incoming point, so a burst
// of points would be a burst of writes. Writes that only replace the current
// entry are therefore rate-limited to this interval; the first of a burst still
// lands at once. Two a second sits far enough under the cap to hold even if an
// engine measures it over a longer window than the message names, and the
// address bar trailing the map by half a second while it moves is not something
// anyone can see. Pushes are never held back: they start a new entry, and
// nothing produces them at viewport speed.
const REPLACE_MIN_INTERVAL_MS = 500;

let previousRest: unknown[] = [];

let previousView: [number, number, number] | null = null;

let lastWriteWasViewOnly = false;

let lastViewWriteTs = 0;

// When the last history write landed, and what the URL said apart from the
// viewport once it had. The address bar cannot answer the second question on
// its own: it carries the viewport too, and it is stale for as long as a
// rewrite is owed.
let lastWriteTs = 0;

let lastWrittenRest: string | null = null;

let rerunTimer: ReturnType<typeof setTimeout> | undefined;

// The store, for the rewrite below — it runs from a timer, so no dispatch hands
// it one.
let latestGetState: (() => RootState) | null = null;

function cancelRerun() {
  clearTimeout(rerunTimer);

  rerunTimer = undefined;
}

/**
 * The rate-limited rewrite. Derives the URL afresh from the state of the moment
 * it runs rather than replaying the one that was current when the write was
 * held back: by then the map has usually moved on, and the viewport in between
 * was never going to survive. Deriving again is also what keeps the rest of
 * this module able to trust `window.location` — nothing is in flight that the
 * address bar doesn't already account for, only a promise to look again.
 */
function rerun() {
  rerunTimer = undefined;

  const getState = latestGetState;

  if (getState) {
    updateUrl(getState(), true);
  }
}

// An owed rewrite is still what the address bar should say, so it has to happen
// before the page can go away — otherwise a reload restores the viewport the
// user left a moment before, not the one they were looking at. `pagehide`
// covers unload and bfcache; a mobile tab can instead be frozen and discarded
// while merely hidden, which only `visibilitychange` sees.
//
// The stash goes last, so it records the URL the rewrite just wrote.
function endSession() {
  if (rerunTimer !== undefined) {
    clearTimeout(rerunTimer);

    rerun();
  }

  stashUrl();
}

window.addEventListener('pagehide', endSession);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    endSession();
  }
});

export const urlProcessor: Processor = {
  handle: async ({ getState }) => {
    latestGetState = getState;

    updateUrl(getState(), false);
  },
};

/**
 * Derives the URL from `state` and writes it to the address bar and the history
 * entry when it differs from what they already say.
 *
 * `forced` marks the rate-limited rewrite: it derives again even though no
 * slice has changed since it was scheduled, and writes without waiting further.
 */
function updateUrl(state: RootState, forced: boolean): void {
  const {
    map,
    routePlanner,
    routePlannerSettings,
    trackViewer,
    trackViewerSettings,
    trackingSettings,
    gallery,
    drawingPoints,
    changesets,
    drawingLines,
    main,
    tracking,
    search,
    objects,
    wiki,
    elevationChart,
    toposcope,
    panorama,
    panoramaSettings,
    viewshed,
    viewshedSettings,
    auth,
  } = state;

  if (!isUrlUpdatingEnabled()) {
    // URL updating is suspended while the store is mutated programmatically
    // (a feature drag, or restoring state on popstate). End any in-progress
    // viewport-coalescing session so the first write after we resume starts a
    // fresh history entry instead of replacing the entry we navigated to.
    lastWriteWasViewOnly = false;

    // Drop an owed rewrite rather than running it: on a popstate restore the
    // entry it would replace is the one just navigated to. `previousView` has
    // already advanced past it, so forget the viewport too — otherwise a
    // change caught inside the rate-limit window (a drag starting right after
    // a pan) would compare equal once updating resumes and never be written
    // at all. Deriving again costs nothing when the address bar turns out to
    // be right already. `forced` counts as owing one too: the rewrite clears
    // the timer before it gets here, so the suspension would otherwise look
    // like there was nothing to write.
    if (rerunTimer !== undefined || forced) {
      cancelRerun();

      previousView = null;
    }

    return;
  }

  // Map viewport (pan/zoom) is tracked separately from everything else so a
  // run of viewport-only changes can be coalesced into one history entry.
  const view: [number, number, number] = [map.lat, map.lon, map.zoom];

  // The map the URL names, and with it whether the content goes into the
  // history entry instead of the address bar.
  const mapId = urlMapIdSelector(state);

  // What the viewshed is actually of; premium changing moves it without the
  // stored setting moving, and the address bar has to follow. Only where there
  // is one — this runs on every action.
  const viewshedRadiusKm = viewshed.viewpoint
    ? grantedRadiusKm(viewshedSettings.radiusKm, isPremium(auth.user))
    : undefined;

  const rest = [
    changesets.authorName,
    changesets.days,
    drawingLines.lines,
    gallery.activeImageId,
    gallery.filter,
    drawingPoints.points,
    main.activeModal,
    main.embedFeatures,
    main.selection,
    map.layers,
    map.customLayers,
    map.shading,
    routePlanner,
    routePlanner.points,
    routePlanner.finishOnly,
    routePlanner.milestones,
    routePlanner.mode,
    routePlanner.transportType,
    routePlanner.roundtripParams,
    tracking.trackedDevices,
    routePlannerSettings.colorizeBy,
    routePlannerSettings.colorizeLegend,
    trackViewerSettings.colorizeTrackBy,
    trackViewerSettings.colorizeLegend,
    trackingSettings.colorizeBy,
    trackingSettings.colorizeLegend,
    // Only whether there is anything to color, which is all the colorize gates
    // below read: `tracking.tracks` is a fresh array on every incoming fix, and
    // naming it here would re-derive the whole URL per fix.
    trackGeojsonIsSuitableForElevationChart(state),
    tracking.tracks.length > 0,
    trackViewer.gpxUrl,
    search.selectedResults,
    search.previewId,
    trackViewer.trackUID,
    // The derived id itself, not the fields behind it: the URL follows every
    // way a map can claim or release it — a load that starts, opens, or is
    // given up on — without this list having to name them.
    mapId,
    main.mapTool,
    main.panelTools,
    objects.active,
    wiki.preview,
    wiki.loading,
    elevationChart.target,
    // Kept identical by the reducer while it doesn't move, so a live track's
    // profile arriving per fix doesn't rewrite the URL along with it.
    elevationChart.range,
    panorama.viewpoint,
    // Listed here to be noticed at all — this array only asks whether anything
    // moved. Whether the write pushes a history entry or replaces one is a
    // separate question, answered by `COALESCED_KEYS`.
    panorama.azimuth,
    panoramaSettings.tilt,
    panoramaSettings.altMin,
    panoramaSettings.altMax,
    viewshed.viewpoint,
    viewshedRadiusKm,
    // Whether `route-params-hash` may be written at all, and that is the whole
    // of its effect on the URL: signing in has to add it to a route already on
    // screen, and signing out has to take it away — left behind, a reload would
    // read it back as an unlock of the reader's own route.
    isPremium(auth.user),
  ];

  const restChanged =
    previousRest.length !== rest.length ||
    previousRest.some((item, i) => item !== rest[i]);

  const viewChanged =
    !previousView ||
    previousView[0] !== view[0] ||
    previousView[1] !== view[1] ||
    previousView[2] !== view[2];

  // Nothing the URL is derived from moved. The rewrite comes through here
  // with exactly that true — it is scheduled by a change it deliberately did
  // not write yet — so it says so and derives anyway.
  if (!forced && !restChanged && !viewChanged) {
    return;
  }

  previousRest = rest;

  previousView = view;

  const layers = map.layers
    .filter((type) => type !== 'i' && integratedLayerDefMap[type])
    .join('~');

  const queryParts: QueryPart[] = [
    [
      'map',
      `${serializeZoom(map.zoom)}/${serializeLatLon({ lat: map.lat, lon: map.lon })}`,
    ],
  ];

  if (layers) {
    queryParts.push(['layers', layers]);
  }

  if (
    map.layers.some(
      (layer) =>
        integratedLayerDefMap[layer]?.technology === 'parametricShading',
    )
  ) {
    queryParts.push(['shading', serializeShading(map.shading)]);
  }

  // The map-click tool first, so a link that names several of them still
  // opens the right one when read back.
  const tools = openToolsSelector(state);

  if (tools.length > 0) {
    queryParts.push(['tools', tools.join(',')]);
  }

  {
    const chartParam =
      elevationChart.target &&
      serializeChartTarget(elevationChart.target, drawingLines.lines);

    if (chartParam) {
      queryParts.push(['elevation-chart', chartParam]);

      // Metres along the profile, whole ones: a marked stretch is read off a
      // chart a few hundred pixels wide, so nothing finer means anything.
      if (elevationChart.range) {
        queryParts.push([
          'elevation-chart-range',
          `${Math.round(elevationChart.range.from)},${Math.round(elevationChart.range.to)}`,
        ]);
      }
    }
  }

  if (mapId) {
    queryParts.push(['id', mapId]);
  }

  const historyParts: QueryPart[] = mapId ? [] : queryParts;

  const filteredCustomLayers = map.customLayers?.filter(({ type }) =>
    map.layers.includes(type),
  );

  if (filteredCustomLayers.length) {
    historyParts.push(['custom-layers', JSON.stringify(filteredCustomLayers)]);
  }

  // What lets a link share a premium route feature — multimodal segmentation,
  // and the premium colorize modes — with someone who has no premium: the key
  // of the route the link was made for, which stops matching the moment a
  // waypoint moves.
  //
  // Written only while this route is *already* entitled to those features, so a
  // recipient's own rewrites (a pan, a zoom) keep the link working, while a user
  // with neither premium nor a matching hash writes nothing and so cannot mint
  // an unlock by picking a premium mode.
  if (routePlanner.points.length) {
    const key = routeKey(routePlanner);

    const usesPremiumFeature =
      routePlanner.points.some((p) => p?.transport) ||
      (routePlannerSettings.colorizeBy &&
        isPremiumColorizingMode(routePlannerSettings.colorizeBy));

    // An unlock the link arrived with is carried forward whatever the reader
    // does with it — turning colorize off would otherwise strip the param, and
    // `hash` is not persisted, so a reload would take the unlock away for good
    // on a route whose waypoints never moved. Carrying it forward mints
    // nothing: it is written back only where it already matched.
    if (
      routePlanner.hash === key ||
      (usesPremiumFeature && isPremium(auth.user))
    ) {
      historyParts.push(['route-params-hash', key]);
    }
  }

  // Everything describing what the map holds; shared with the my-maps
  // unsaved-changes comparison so the two can't disagree.
  historyParts.push(...getMapContentParts(state));

  // The dial's own settings. Deliberately outside the map content: the centre
  // and the rays are drawn points and travel with them, but this has no place
  // in a saved map document yet, and adding it to that comparison would report
  // a map as changed the moment it was loaded.
  {
    const toposcopeParam = serializeToposcope(toposcope);

    if (toposcopeParam) {
      historyParts.push(['toposcope', toposcopeParam]);
    }
  }

  // Where the panorama is taken from, so a link reopens it; the picture itself
  // is re-rendered on arrival. The bearing rides in a param of its own because
  // it is a viewport, not content — see `COALESCED_KEYS`.
  //
  // Only while the panel is open: closing it keeps the viewpoint so reopening
  // finds the picture, but a link shared then would promise a panorama the
  // recipient — who gets no `tools=panorama` — never sees.
  if (panorama.viewpoint && tools.includes('panorama')) {
    historyParts.push([
      'panorama',
      serializePanoramaViewpoint(panorama.viewpoint),
    ]);

    historyParts.push(['panorama-az', String(Math.round(panorama.azimuth))]);

    historyParts.push([
      'panorama-tilt',
      serializePanoramaTilt(panoramaSettings),
    ]);
  }

  // Where the viewshed is taken from and how far it looks; the overlay itself is
  // computed again on arrival. Only while its layer is on, which `layers=`
  // carries alongside.
  if (viewshed.viewpoint && map.layers.includes(VIEWSHED_LAYER)) {
    historyParts.push([
      'viewshed',
      serializeViewshed(viewshed.viewpoint, viewshedRadiusKm ?? 0),
    ]);
  }

  // Both only while the feature has a line to color: they describe what is on
  // the map, not a preference, so with nothing there they would be clutter that
  // also outlives what it referred to. The legend rides along with the mode —
  // it is the box naming that mode's colors — and is written whichever way it
  // is set, so a shared link says so rather than leaving it to whatever the
  // recipient last chose.
  if (routePlannerSettings.colorizeBy && routePlanner.alternatives.length) {
    historyParts.push(
      ['route-colorize-by', routePlannerSettings.colorizeBy],
      [
        'route-colorize-legend',
        routePlannerSettings.colorizeLegend ? '1' : '0',
      ],
    );
  }

  if (
    trackViewerSettings.colorizeTrackBy &&
    trackGeojsonIsSuitableForElevationChart(state)
  ) {
    historyParts.push(
      ['track-colorize-by', trackViewerSettings.colorizeTrackBy],
      ['track-colorize-legend', trackViewerSettings.colorizeLegend ? '1' : '0'],
    );
  }

  if (trackingSettings.colorizeBy && tracking.tracks.length) {
    historyParts.push(
      ['tracking-colorize-by', trackingSettings.colorizeBy],
      ['tracking-colorize-legend', trackingSettings.colorizeLegend ? '1' : '0'],
    );
  }

  if (changesets.days) {
    queryParts.push(['changesets-days', changesets.days]);
  }

  if (changesets.authorName) {
    queryParts.push(['changesets-author', changesets.authorName]);
  }

  {
    // The gallery viewer (own + Wikimedia Commons photos) and the Wikipedia
    // preview keep their own slice state but serialize through the same packed
    // `show=` param.
    const wikiKey =
      wiki.loading ?? (wiki.preview ? wikiPreviewKey(wiki.preview) : null);

    const show =
      encodeActiveModal(main.activeModal) ??
      encodeActiveModal(
        gallery.activeImageId
          ? { type: 'gallery-viewer', id: gallery.activeImageId }
          : wikiKey
            ? { type: 'wiki', key: wikiKey }
            : null,
      );

    if (show !== null) {
      queryParts.push(['show', show]);
    }
  }

  if (main.embedFeatures.length) {
    queryParts.push(['embed', main.embedFeatures.join(',')]);
  }

  if (main.selection?.type === 'tracking' && main.selection?.id !== undefined) {
    queryParts.push(['follow', main.selection?.id]);
  }

  const sq = mapId ? serializeQuery(historyParts) : undefined;

  const urlSearch = serializeQuery(queryParts);

  // Everything the URL says apart from the viewport, as text. Whether this is
  // a content change is decided from this rather than from the identity of
  // the state behind it, because the two disagree: a slice can be replaced
  // without the URL moving (an async router or objects result arriving), and
  // that must not read as content and cost a history entry. `queryParts` also
  // holds the content parts when no map id claims them, so filtering the
  // viewport out of it covers both arrangements.
  const restSignature = `${serializeQuery(
    queryParts.filter(isContentPart),
  )}\n${mapId ? serializeQuery(historyParts.filter(isContentPart)) : ''}`;

  const prevHistoryState = history.state as {
    sq?: string;
    tr?: true;
  } | null;

  const contentChanged =
    (mapId && sq !== prevHistoryState?.sq) ||
    urlSearch !== window.location.hash.slice(1);

  if (!contentChanged) {
    // The address bar already says what the state does, so a rewrite owed for
    // the viewport has nothing left to write.
    cancelRerun();

    return;
  }

  // A change confined to the coalesced params replaces the current entry when
  // it continues a recent run of them (last write was also one, and within the
  // gap); otherwise it starts a fresh entry. Any other change (map type,
  // drawing, modals, …) always pushes.
  //
  // Unless the viewport did not move either: what changed is then one of the
  // coalesced params that is *not* the viewport, which no entry can stand for —
  // going back to a URL that omits a colorize param does not turn colorizing
  // off (see `handleColorize`), so the entry would be a Back press that does
  // nothing. Those replace however the previous write went.
  const viewOnly = restSignature === lastWrittenRest;

  const now = Date.now();

  const method =
    viewOnly &&
    (!viewChanged ||
      (lastWriteWasViewOnly && now - lastViewWriteTs < VIEW_COALESCE_GAP_MS))
      ? 'replaceState'
      : 'pushState';

  if (method === 'replaceState' && !forced) {
    // Clamped because the clock can go backwards (an NTP correction mid-pan):
    // a negative age would schedule the rewrite further out than the interval
    // and `??=` never shortens a timer, freezing viewport updates until the
    // next content change.
    const sinceLastWrite = Math.max(0, now - lastWriteTs);

    if (sinceLastWrite < REPLACE_MIN_INTERVAL_MS) {
      // Only ever one timer: it is a promise to look at the state again, not
      // a queue of writes, so a burst adds nothing to it.
      rerunTimer ??= setTimeout(
        rerun,
        REPLACE_MIN_INTERVAL_MS - sinceLastWrite,
      );

      return;
    }
  }

  // Whatever an owed rewrite would have said is in this URL already.
  cancelRerun();

  // Collapse repeated slashes so the pushed URL never begins with `//`.
  // If the document was opened at a path like `https://host//` (from an
  // external link with a stray double slash), `location.pathname` is `//`,
  // and `//#hash` parses as a protocol-relative URL with an empty host —
  // whose origin differs from the document, making pushState throw a
  // SecurityError. Normalizing also self-heals the address bar.
  const path = window.location.pathname.replace(/\/{2,}/g, '/');

  // `tr` says this entry was holding a track in the browser's own storage, so
  // a reload of it puts the track back. Carried forward rather than
  // recomputed: it belongs to the entry, and `trackStore` sets it on the
  // current one when it writes.
  //
  // A refusal throws on the way out, leaving none of the bookkeeping below
  // advanced — the entry this meant to leave is still the current one, and
  // nothing has been recorded that would let the next viewport change replace
  // it. The update is dropped rather than retried: `previousRest` and
  // `previousView` have already moved on, so only a further state change
  // derives the URL again.
  history[method](
    { sq, tr: prevHistoryState?.tr },
    '',
    path + (urlSearch ? `#${urlSearch}` : ''),
  );

  lastWriteTs = now;

  lastWrittenRest = restSignature;

  lastWriteWasViewOnly = viewOnly;

  if (viewOnly) {
    lastViewWriteTs = now;
  }

  if (window.fmEmbedded) {
    window.parent.postMessage(
      {
        freemap: {
          action: 'urlUpdated',
          payload: window.location.href, // for SAV
        },
      },
      '*',
    );
  }
}

/**
 * `elevation-chart=` — which feature's profile is shown, and which of its lines
 * where that isn't implied. A drawn line is named by *position*, because that is
 * how the line itself is written (`line=`/`polygon=` are positional and carry no
 * id); a device by token, since which one is charted is not what `follow=` says.
 */
function serializeChartTarget(
  target: NonNullable<RootState['elevationChart']['target']>,
  lines: RootState['drawingLines']['lines'],
): string | null {
  switch (target.type) {
    case 'drawing': {
      const index = lines.findIndex(({ id }) => id === target.lineId);

      // The charted line is gone — deleting one writes the URL before the chart
      // has closed. A bare `drawing` would name no line at all, and a Back to
      // that entry would arm a request nothing can ever honour.
      return index < 0 ? null : `drawing/${index}`;
    }

    case 'tracking':
      return `tracking/${target.token}`;

    default:
      return target.type;
  }
}

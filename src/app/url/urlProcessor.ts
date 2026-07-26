import { serializeShading } from '@features/parameterizedShading/model/Shading.js';
import { wikiPreviewKey } from '@features/wiki/model/wikiPreviewKey.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { serializeLatLon } from '@shared/urlSerialization.js';
import { hash } from 'ohash';
import { encodeActiveModal } from '../store/activeModal.js';
import type { Processor } from '../store/middleware/processorMiddleware.js';
import {
  getMapContentParts,
  type QueryPart,
  serializeQuery,
} from './mapContentParts.js';
import { isUrlUpdatingEnabled } from './urlUpdating.js';

// Browser-history policy for map viewport changes (pan/zoom): a contiguous run
// of viewport-only changes collapses into a single history entry via
// `replaceState`, so a burst of small map moves costs one Back press instead of
// many. A fresh entry (`pushState`) is started when anything other than the
// viewport changes (e.g. the map type / layers), or when more than
// VIEW_COALESCE_GAP_MS has elapsed since the last viewport write — so distinct
// panning sessions stay separately navigable.
const VIEW_COALESCE_GAP_MS = 60_000;

let previousRest: unknown[] = [];

let previousView: [number, number, number] | null = null;

let lastWriteWasViewOnly = false;

let lastViewWriteTs = 0;

export const urlProcessor: Processor = {
  handle: async ({ getState }) => {
    const state = getState();

    const {
      map,
      routePlanner,
      trackViewer,
      trackViewerSettings,
      gallery,
      drawingPoints,
      changesets,
      drawingLines,
      main,
      tracking,
      myMaps,
      search,
      objects,
      wiki,
    } = state;

    if (!isUrlUpdatingEnabled()) {
      // URL updating is suspended while the store is mutated programmatically
      // (a feature drag, or restoring state on popstate). End any in-progress
      // viewport-coalescing session so the first write after we resume starts a
      // fresh history entry instead of replacing the entry we navigated to.
      lastWriteWasViewOnly = false;

      return;
    }

    // Map viewport (pan/zoom) is tracked separately from everything else so a
    // run of viewport-only changes can be coalesced into one history entry.
    const view: [number, number, number] = [map.lat, map.lon, map.zoom];

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
      trackViewerSettings.colorizeTrackBy,
      trackViewer.gpxUrl,
      search.osmNodeId,
      search.osmRelationId,
      search.osmWayId,
      trackViewer.trackUID,
      myMaps.activeMap,
      myMaps.restoringId,
      main.tools.join(','),
      objects.active,
      wiki.preview,
      wiki.loading,
    ];

    const restChanged =
      previousRest.length !== rest.length ||
      previousRest.some((item, i) => item !== rest[i]);

    const viewChanged =
      !previousView ||
      previousView[0] !== view[0] ||
      previousView[1] !== view[1] ||
      previousView[2] !== view[2];

    if (!restChanged && !viewChanged) {
      return;
    }

    previousRest = rest;

    previousView = view;

    const layers = map.layers
      .filter((type) => type !== 'i' && integratedLayerDefMap[type])
      .join('~');

    const queryParts: QueryPart[] = [
      ['map', `${map.zoom}/${serializeLatLon({ lat: map.lat, lon: map.lon })}`],
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

    if (main.tools.length > 0) {
      // In the order the tools were opened — matches the rendered toolbar order.
      queryParts.push(['tools', main.tools.join(',')]);
    }

    const mapId =
      myMaps.loadMeta?.id || myMaps.restoringId || myMaps.activeMap?.id;

    if (mapId) {
      queryParts.push(['id', mapId]);
    }

    const historyParts: QueryPart[] = mapId ? [] : queryParts;

    const filteredCustomLayers = map.customLayers?.filter(({ type }) =>
      map.layers.includes(type),
    );

    if (filteredCustomLayers.length) {
      historyParts.push([
        'custom-layers',
        JSON.stringify(filteredCustomLayers),
      ]);
    }

    if (
      routePlanner.points.length &&
      routePlanner.points.some((p) => p.transport)
    ) {
      // for sharing "premium" route
      historyParts.push([
        'route-params-hash',
        hash([
          routePlanner.points,
          routePlanner.mode,
          routePlanner.transportType,
        ]),
      ]);
    }

    // Everything describing what the map holds; shared with the my-maps
    // unsaved-changes comparison so the two can't disagree.
    historyParts.push(...getMapContentParts(state));

    if (search.osmNodeId && search.osmNodeId > 0) {
      historyParts.push(['osm-node', search.osmNodeId]);
    }

    if (search.osmWayId && search.osmWayId > 0) {
      historyParts.push(['osm-way', search.osmWayId]);
    }

    if (search.osmRelationId && search.osmRelationId > 0) {
      historyParts.push(['osm-relation', search.osmRelationId]);
    }

    if (trackViewerSettings.colorizeTrackBy) {
      historyParts.push([
        'track-colorize-by',
        trackViewerSettings.colorizeTrackBy,
      ]);
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

    if (
      main.selection?.type === 'tracking' &&
      main.selection?.id !== undefined
    ) {
      queryParts.push(['follow', main.selection?.id]);
    }

    const sq = mapId ? serializeQuery(historyParts) : undefined;

    const urlSearch = serializeQuery(queryParts);

    const prevHistoryState = history.state as { sq?: string } | null;

    const contentChanged =
      (mapId && sq !== prevHistoryState?.sq) ||
      urlSearch !== window.location.hash.slice(1);

    if (contentChanged) {
      // A viewport-only change replaces the current entry when it continues a
      // recent panning session (last write was also viewport-only and within
      // the gap); otherwise it starts a fresh entry. Any non-viewport change
      // (map type, drawing, modals, …) always pushes.
      const viewOnly = !restChanged;

      const now = Date.now();

      const method =
        viewOnly &&
        lastWriteWasViewOnly &&
        now - lastViewWriteTs < VIEW_COALESCE_GAP_MS
          ? 'replaceState'
          : 'pushState';

      // Collapse repeated slashes so the pushed URL never begins with `//`.
      // If the document was opened at a path like `https://host//` (from an
      // external link with a stray double slash), `location.pathname` is `//`,
      // and `//#hash` parses as a protocol-relative URL with an empty host —
      // whose origin differs from the document, making pushState throw a
      // SecurityError. Normalizing also self-heals the address bar.
      const path = window.location.pathname.replace(/\/{2,}/g, '/');

      history[method]({ sq }, '', path + (urlSearch ? `#${urlSearch}` : ''));

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

      lastWriteWasViewOnly = viewOnly;

      if (viewOnly) {
        lastViewWriteTs = now;
      }
    }
  },
};

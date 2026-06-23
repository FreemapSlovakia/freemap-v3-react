import { serializeShading } from '@features/parameterizedShading/model/Shading.js';
import { wikiPreviewKey } from '@features/wiki/model/wikiPreviewKey.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import { hash } from 'ohash';
import { encodeActiveModal } from '../store/actions.js';
import type { Processor } from '../store/middleware/processorMiddleware.js';
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
    const {
      map,
      routePlanner,
      trackViewer,
      gallery,
      drawingPoints,
      changesets,
      drawingLines,
      gallery: { filter: galleryFilter },
      main,
      tracking,
      myMaps,
      search,
      objects,
      wikimediaCommons,
      wiki,
    } = getState();

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
      trackViewer.colorizeTrackBy,
      trackViewer.gpxUrl,
      search.osmNodeId,
      search.osmRelationId,
      search.osmWayId,
      trackViewer.trackUID,
      myMaps.activeMap,
      main.tools.join(','),
      objects.active,
      wikimediaCommons.preview?.pageId,
      wikimediaCommons.loading,
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

    const queryParts: [string, string | number | boolean][] = [
      ['map', `${map.zoom}/${serializePoint({ lat: map.lat, lon: map.lon })}`],
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

    const mapId = myMaps.loadMeta?.id || myMaps.activeMap?.id;

    if (mapId) {
      queryParts.push(['id', mapId]);
    }

    const historyParts: [string, string | number | boolean][] = mapId
      ? []
      : queryParts;

    const filteredCustomLayers = map.customLayers?.filter(({ type }) =>
      map.layers.includes(type),
    );

    if (filteredCustomLayers.length) {
      historyParts.push([
        'custom-layers',
        JSON.stringify(filteredCustomLayers),
      ]);
    }

    if (routePlanner.points.length) {
      // for sharing "premium" route
      if (routePlanner.points.some((point) => point.transport)) {
        historyParts.push([
          'route-params-hash',
          hash([
            routePlanner.points,
            routePlanner.mode,
            routePlanner.transportType,
          ]),
        ]);
      }

      historyParts.push([
        'points',
        (routePlanner.finishOnly ? ',' : '') +
          routePlanner.points
            .map(
              (point) =>
                (point.transport ? point.transport + '/' : '') +
                serializePoint(point),
            )
            .join(','),
      ]);

      historyParts.push(['transport', routePlanner.transportType]);

      if (routePlanner.mode !== 'route') {
        historyParts.push(['route-mode', routePlanner.mode]);
      }

      if (routePlanner.milestones) {
        historyParts.push(['milestones', routePlanner.milestones]);
      }

      if (
        transportTypeDefs[routePlanner.transportType].api === 'gh' &&
        routePlanner.mode === 'roundtrip'
      ) {
        historyParts.push([
          'trip-distance',
          routePlanner.roundtripParams.distance,
        ]);

        historyParts.push(['trip-seed', routePlanner.roundtripParams.seed]);
      }

      if (
        transportTypeDefs[routePlanner.transportType].api === 'gh' &&
        routePlanner.mode === 'isochrone'
      ) {
        historyParts.push([
          'iso-buckets',
          routePlanner.isochroneParams.buckets,
        ]);

        if (routePlanner.isochroneParams.distanceLimit) {
          historyParts.push([
            'iso-distance-limit',
            routePlanner.isochroneParams.distanceLimit,
          ]);
        } else {
          historyParts.push([
            'iso-time-limit',
            routePlanner.isochroneParams.timeLimit,
          ]);
        }
      }
    }

    if (trackViewer.trackUID) {
      historyParts.push(['track-uid', trackViewer.trackUID]);
    }

    if (trackViewer.gpxUrl) {
      historyParts.push(['gpx-url', trackViewer.gpxUrl]);
    }

    if (search.osmNodeId && search.osmNodeId > 0) {
      historyParts.push(['osm-node', search.osmNodeId]);
    }

    if (search.osmWayId && search.osmWayId > 0) {
      historyParts.push(['osm-way', search.osmWayId]);
    }

    if (search.osmRelationId && search.osmRelationId > 0) {
      historyParts.push(['osm-relation', search.osmRelationId]);
    }

    if (trackViewer.colorizeTrackBy) {
      historyParts.push(['track-colorize-by', trackViewer.colorizeTrackBy]);
    }

    if (changesets.days) {
      queryParts.push(['changesets-days', changesets.days]);
    }

    if (changesets.authorName) {
      queryParts.push(['changesets-author', changesets.authorName]);
    }

    if (drawingPoints.points.length) {
      for (const point of drawingPoints.points) {
        historyParts.push([
          'point',
          `${serializePoint(point.coords)}${point.color ? `\x1eC${point.color}` : ''}${
            point.label ? `\x1eL${point.label}` : ''
          }${
            point.markerType === 'square'
              ? '\x1eSs'
              : point.markerType === 'ring'
                ? '\x1eSr'
                : ''
          }${point.icon ? `\x1eI${point.icon}` : ''}`,
        ]);
      }
    }

    for (const line of drawingLines.lines) {
      historyParts.push([
        line.type,
        `${line.points.map((point) => serializePoint(point)).join(',')}${
          line.width ? `\x1eW${line.width}` : ''
        }${line.color ? `\x1eC${line.color}` : ''}${
          line.fillColor ? `\x1eF${line.fillColor}` : ''
        }${line.label ? `\x1eL${line.label}` : ''}${
          line.dashArray ? `\x1eD${line.dashArray}` : ''
        }${
          line.lineCap === 'butt'
            ? '\x1eKb'
            : line.lineCap === 'square'
              ? '\x1eKs'
              : ''
        }${
          line.lineJoin === 'miter'
            ? '\x1eJm'
            : line.lineJoin === 'bevel'
              ? '\x1eJb'
              : ''
        }`,
      ]);
    }

    if (galleryFilter.userId) {
      historyParts.push(['gallery-user-id', galleryFilter.userId]);
    }

    if (galleryFilter.tag != null) {
      historyParts.push(['gallery-tag', galleryFilter.tag]);
    }

    if (galleryFilter.ratingFrom) {
      historyParts.push(['gallery-rating-from', galleryFilter.ratingFrom]);
    }

    if (galleryFilter.ratingTo) {
      historyParts.push(['gallery-rating-to', galleryFilter.ratingTo]);
    }

    if (galleryFilter.takenAtFrom) {
      historyParts.push([
        'gallery-taken-at-from',
        dateToString(galleryFilter.takenAtFrom),
      ]);
    }

    if (galleryFilter.takenAtTo) {
      historyParts.push([
        'gallery-taken-at-to',
        dateToString(galleryFilter.takenAtTo),
      ]);
    }

    if (galleryFilter.createdAtFrom) {
      historyParts.push([
        'gallery-created-at-from',
        dateToString(galleryFilter.createdAtFrom),
      ]);
    }

    if (galleryFilter.createdAtTo) {
      historyParts.push([
        'gallery-created-at-to',
        dateToString(galleryFilter.createdAtTo),
      ]);
    }

    if (galleryFilter.pano !== undefined) {
      historyParts.push(['gallery-pano', galleryFilter.pano]);
    }

    if (galleryFilter.premium !== undefined) {
      historyParts.push(['gallery-premium', galleryFilter.premium]);
    }

    if (objects.active.length) {
      historyParts.push(['objects', objects.active.join(';')]);
    }

    {
      // The gallery viewer and the Wikimedia Commons preview keep their own
      // slice state but serialize through the same packed `show=` param.
      const wmcPageId =
        wikimediaCommons.preview?.pageId ?? wikimediaCommons.loading;

      const wikiKey =
        wiki.loading ?? (wiki.preview ? wikiPreviewKey(wiki.preview) : null);

      const show =
        encodeActiveModal(main.activeModal) ??
        encodeActiveModal(
          gallery.activeImageId
            ? { type: 'gallery-viewer', id: gallery.activeImageId }
            : wmcPageId
              ? { type: 'wmc', pageId: wmcPageId }
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

    for (const {
      token: id,
      label,
      color,
      width,
      fromTime,
      maxCount,
      maxAge,
      splitDistance,
      splitDuration,
    } of tracking.trackedDevices) {
      const parts = [id];

      if (fromTime) {
        parts.push(`f:${fromTime.toISOString()}`);
      }

      if (typeof maxCount === 'number') {
        parts.push(`n:${maxCount}`);
      }

      if (typeof maxAge === 'number') {
        parts.push(`a:${maxAge}`);
      }

      if (typeof width === 'number') {
        parts.push(`w:${width}`);
      }

      if (typeof splitDistance === 'number') {
        parts.push(`sd:${splitDistance}`);
      }

      if (typeof splitDuration === 'number') {
        parts.push(`st:${splitDuration}`);
      }

      if (color) {
        parts.push(`c:${color.replace(/\//g, '_')}`);
      }

      if (label) {
        parts.push(`l:${label.replace(/\//g, '_')}`);
      }

      historyParts.push(['track', parts.join('/')]);
    }

    if (
      main.selection?.type === 'tracking' &&
      main.selection?.id !== undefined
    ) {
      queryParts.push(['follow', main.selection?.id]);
    }

    const sq = mapId ? serializeQuery(historyParts) : undefined;

    const urlSearch = serializeQuery(queryParts);

    if (
      (mapId && sq !== (history.state as { sq: string })?.sq) ||
      urlSearch !== window.location.hash.slice(1)
    ) {
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

      history[method]({ sq }, '', '/' + (urlSearch ? '#' + urlSearch : ''));

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

function serializePoint(point: LatLon | null) {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

function dateToString(d: Date) {
  return d.toISOString().replace(/T.*/, '');
}

function serializeQuery(parts: [string, string | number | boolean][]) {
  return parts
    .map(
      (qp) =>
        encodeURIComponent(qp[0]) +
        '=' +
        // FIXME replacing is nonstandard
        encodeURIComponent(qp[1]).replace(/%2F/g, '/'),
    )
    .join('&');
}

import { drawingLineUpdatePoint } from 'fm3/actions/drawingLineActions';
import { ShowModal } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { basicModals } from 'fm3/constants';
import { DocumentKey } from 'fm3/documents';
import { history } from 'fm3/historyHolder';
import { OverlayLetters } from 'fm3/mapDefinitions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { transportTypeDefs } from 'fm3/transportTypeDefs';
import { LatLon } from 'fm3/types/common';
import { isActionOf } from 'typesafe-actions';
import { is } from 'typia';

let lastActionType: string | undefined;

let previous: unknown[] = [];

export const urlProcessor: Processor = {
  handle: async ({ getState, action }) => {
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
      maps,
      search,
      objects,
    } = getState();

    if (!main.urlUpdatingEnabled) {
      return;
    }

    const next = [
      changesets.authorName,
      changesets.days,
      drawingLines.lines,
      gallery.activeImageId,
      gallery.filter,
      drawingPoints.points,
      main.activeModal,
      main.embedFeatures,
      main.selection,
      main.urlUpdatingEnabled,
      map.lat,
      map.lon,
      map.zoom,
      map.mapType,
      map.overlays,
      map.customLayers,
      routePlanner,
      routePlanner.finish,
      routePlanner.midpoints,
      routePlanner.milestones,
      routePlanner.mode,
      routePlanner.weighting,
      routePlanner.start,
      routePlanner.transportType,
      routePlanner.roundtripParams,
      main.documentKey,
      tracking.trackedDevices,
      trackViewer.colorizeTrackBy,
      trackViewer.gpxUrl,
      search.osmNodeId,
      search.osmRelationId,
      search.osmWayId,
      trackViewer.trackUID,
      maps.activeMap,
      main.tool,
      objects.active,
    ];

    if (
      previous.length === next.length &&
      previous.every((item, i) => next[i] === item)
    ) {
      return;
    }

    previous = next;

    const queryParts: [string, string | number | boolean][] = [
      ['map', `${map.zoom}/${serializePoint({ lat: map.lat, lon: map.lon })}`],
      [
        'layers',
        `${map.mapType}${map.overlays.filter((l) => l !== 'i').join('')}`,
      ],
    ];

    if (main.tool) {
      queryParts.push(['tool', main.tool]);
    }

    const mapId = maps.loadMeta?.id || maps.activeMap?.id;

    if (mapId) {
      queryParts.push(['id', mapId]);
    }

    const historyParts: [string, string | number | boolean][] = mapId
      ? []
      : queryParts;

    const filteredCustomLayers = map.customLayers?.filter(
      ({ type }) =>
        type === map.mapType || map.overlays.includes(type as OverlayLetters),
    );

    if (filteredCustomLayers.length) {
      historyParts.push([
        'custom-layers',
        JSON.stringify(filteredCustomLayers),
      ]);
    }

    if (
      routePlanner.start ||
      routePlanner.finish ||
      routePlanner.midpoints.length
    ) {
      historyParts.push([
        'points',
        [routePlanner.start, ...routePlanner.midpoints, routePlanner.finish]
          .map((point) => serializePoint(point))
          .join(','),
      ]);

      historyParts.push(['transport', routePlanner.transportType]);

      if (routePlanner.mode !== 'route') {
        historyParts.push(['route-mode', routePlanner.mode]);
      }

      if (routePlanner.weighting !== 'fastest') {
        historyParts.push(['route-weighting', routePlanner.weighting]);
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

    if (gallery.activeImageId) {
      queryParts.push(['image', gallery.activeImageId]);
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
          `${serializePoint(point)}${point.color ? `\x1eC${point.color}` : ''}${
            point.label ? `\x1eL${point.label}` : ''
          }`,
        ]);
      }
    }

    for (const line of drawingLines.lines) {
      historyParts.push([
        line.type,
        `${line.points.map((point) => serializePoint(point)).join(',')}${
          line.width ? `\x1eW${line.width}` : ''
        }${line.color ? `\x1eC${line.color}` : ''}${
          line.label ? `\x1eL${line.label}` : ''
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

    if (objects.active.length) {
      historyParts.push(['objects', objects.active.join(';')]);
    }

    if (
      is<ShowModal>(main.activeModal) &&
      basicModals.includes(main.activeModal)
    ) {
      queryParts.push(['show', main.activeModal]);
    }

    if (is<DocumentKey>(main.documentKey)) {
      queryParts.push(['document', main.documentKey]);
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
      (mapId && sq !== (history.location.state as { sq: string })?.sq) ||
      urlSearch !== window.location.hash.slice(1)
    ) {
      const method =
        lastActionType &&
        isActionOf([mapRefocus, drawingLineUpdatePoint], action)
          ? 'replace'
          : 'push';

      history[method](
        {
          pathname: '/',
          // search: urlSearch,
          hash: urlSearch,
        },
        { sq },
      );

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

      lastActionType = action.type;
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

import { history } from 'fm3/historyHolder';
import refModals from 'fm3/refModals.json';
import allTips from 'fm3/tips/index.json';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapRefocus } from 'fm3/actions/mapActions';
import { LatLon } from 'fm3/types/common';
import { isActionOf } from 'typesafe-actions';
import { drawingLineUpdatePoint } from 'fm3/actions/drawingActions';

const tipKeys = allTips.map(([key]) => key);

let lastActionType: string | undefined;

let previous: any[] = [];

export const urlProcessor: Processor = {
  actionCreator: '*',
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
      tips,
      auth,
      tracking,
    } = getState();

    if (!main.urlUpdatingEnabled) {
      return;
    }

    const next = [
      auth.chooseLoginMethod,
      changesets.authorName,
      changesets.days,
      drawingLines.lines,
      gallery.activeImageId,
      gallery.filter,
      gallery.showFilter,
      gallery.showUploadModal,
      drawingPoints.points,
      main.activeModal,
      main.embedFeatures,
      main.selection?.type,
      main.selection?.id,
      main.urlUpdatingEnabled,
      map.lat,
      map.lon,
      map.mapType,
      map.overlays,
      routePlanner,
      routePlanner.finish,
      routePlanner.midpoints,
      routePlanner.milestones,
      routePlanner.mode,
      routePlanner.start,
      routePlanner.transportType,
      tips.tip,
      tracking.trackedDevices,
      trackViewer.colorizeTrackBy,
      trackViewer.gpxUrl,
      trackViewer.osmNodeId,
      trackViewer.osmRelationId,
      trackViewer.osmWayId,
      trackViewer.trackUID,
    ];

    if (
      previous.length === next.length &&
      previous.every((item, i) => next[i] === item)
    ) {
      return;
    }

    previous = next;

    const queryParts = [
      `map=${map.zoom}/${serializePoint({ lat: map.lat, lon: map.lon })}`,
      `layers=${map.mapType}${map.overlays.join('')}`,
    ];

    if (main.selection?.type) {
      queryParts.push(`tool=${main.selection?.type}`);
    }

    if (
      routePlanner.start ||
      routePlanner.finish ||
      routePlanner.midpoints.length
    ) {
      queryParts.push(
        `points=${[
          routePlanner.start,
          ...routePlanner.midpoints,
          routePlanner.finish,
        ]
          .map(point => serializePoint(point))
          .join(',')}`,
      );

      if (routePlanner.transportType) {
        queryParts.push(`transport=${routePlanner.transportType}`);
      }

      if (routePlanner.mode !== 'route') {
        queryParts.push(`route-mode=${routePlanner.mode}`);
      }

      if (routePlanner.milestones) {
        queryParts.push('milestones=1');
      }
    }

    if (trackViewer.trackUID) {
      queryParts.push(`track-uid=${trackViewer.trackUID}`);
    }

    if (trackViewer.gpxUrl) {
      queryParts.push(`gpx-url=${trackViewer.gpxUrl}`);
    }

    if (trackViewer.osmNodeId) {
      queryParts.push(`osm-node=${trackViewer.osmNodeId}`);
    }

    if (trackViewer.osmWayId) {
      queryParts.push(`osm-way=${trackViewer.osmWayId}`);
    }

    if (trackViewer.osmRelationId) {
      queryParts.push(`osm-relation=${trackViewer.osmRelationId}`);
    }

    if (trackViewer.colorizeTrackBy) {
      queryParts.push(`track-colorize-by=${trackViewer.colorizeTrackBy}`);
    }

    if (gallery.activeImageId) {
      queryParts.push(`image=${gallery.activeImageId}`);
    }

    if (changesets.days) {
      queryParts.push(`changesets-days=${changesets.days}`);
    }

    if (changesets.authorName) {
      queryParts.push(
        `changesets-author=${encodeURIComponent(changesets.authorName)}`,
      );
    }

    if (drawingPoints.points.length) {
      queryParts.push(
        ...drawingPoints.points.map(
          point =>
            `point=${serializePoint(point)}${
              point.label ? `;${encodeURIComponent(point.label)}` : ''
            }`,
        ),
      );
    }

    for (const line of drawingLines.lines) {
      queryParts.push(
        `${line.type === 'area' ? 'polygon' : 'line'}=${line.points
          .map(point => serializePoint(point))
          .join(',')}${line.label ? `;${encodeURIComponent(line.label)}` : ''}`,
      );
    }

    if (galleryFilter.userId) {
      queryParts.push(`gallery-user-id=${galleryFilter.userId}`);
    }

    if (galleryFilter.tag) {
      queryParts.push(`gallery-tag=${encodeURIComponent(galleryFilter.tag)}`);
    }

    if (galleryFilter.ratingFrom) {
      queryParts.push(`gallery-rating-from=${galleryFilter.ratingFrom}`);
    }

    if (galleryFilter.ratingTo) {
      queryParts.push(`gallery-rating-to=${galleryFilter.ratingTo}`);
    }

    if (galleryFilter.takenAtFrom) {
      queryParts.push(
        `gallery-taken-at-from=${galleryFilter.takenAtFrom
          .toISOString()
          .replace(/T.*/, '')}`,
      );
    }

    if (galleryFilter.takenAtTo) {
      queryParts.push(
        `gallery-taken-at-to=${galleryFilter.takenAtTo
          .toISOString()
          .replace(/T.*/, '')}`,
      );
    }

    if (galleryFilter.createdAtFrom) {
      queryParts.push(
        `gallery-created-at-from=${galleryFilter.createdAtFrom
          .toISOString()
          .replace(/T.*/, '')}`,
      );
    }

    if (galleryFilter.createdAtTo) {
      queryParts.push(
        `gallery-created-at-to=${galleryFilter.createdAtTo
          .toISOString()
          .replace(/T.*/, '')}`,
      );
    }

    if (main.activeModal && refModals.includes(main.activeModal)) {
      queryParts.push(`show=${main.activeModal}`);
    }

    if (gallery.showFilter) {
      queryParts.push('show=gallery-filter');
    }

    if (gallery.showUploadModal) {
      queryParts.push('show=gallery-upload');
    }

    if (auth.chooseLoginMethod) {
      queryParts.push('show=login');
    }

    if (main.activeModal === 'tips' && tips.tip && tipKeys.includes(tips.tip)) {
      queryParts.push(`tip=${tips.tip}`);
    }

    if (main.embedFeatures.length) {
      queryParts.push(`embed=${main.embedFeatures.join(',')}`);
    }

    for (const {
      id,
      label,
      color,
      width,
      fromTime,
      maxCount,
      maxAge,
      splitDistance,
      splitDuration,
    } of tracking.trackedDevices) {
      const parts = [`track=${encodeURIComponent(id)}`];
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
        parts.push(`c:${encodeURIComponent(color.replace(/\//g, '_'))}`);
      }
      if (label) {
        parts.push(`l:${encodeURIComponent(label.replace(/\//g, '_'))}`);
      }
      queryParts.push(parts.join('/'));
    }

    if (
      main.selection?.type === 'tracking' &&
      main.selection?.id !== undefined
    ) {
      queryParts.push(`follow=${encodeURIComponent(main.selection?.id)}`);
    }

    const search = `?${queryParts.join('&')}`;

    if (window.location.search !== search) {
      const method =
        lastActionType &&
        isActionOf([mapRefocus, drawingLineUpdatePoint], action)
          ? 'replace'
          : 'push';
      history[method]({ pathname: '/', search });
      lastActionType = action.type;
    }
  },
};

function serializePoint(point: LatLon | null) {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

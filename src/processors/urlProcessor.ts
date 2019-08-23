import history from 'fm3/historyHolder';
import refModals from 'fm3/refModals.json';
import allTips from 'fm3/tips/index.json';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { mapLoadState, mapRefocus, mapReset } from 'fm3/actions/mapActions';
import { LatLon } from 'fm3/types/common';
import {
  setTool,
  clearMap,
  setActiveModal,
  enableUpdatingUrl,
} from 'fm3/actions/mainActions';
import {
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import {
  galleryRequestImage,
  galleryClear,
  galleryShowFilter,
  galleryHideFilter,
  galleryShowUploadModal,
  galleryHideUploadModal,
  gallerySetFilter,
} from 'fm3/actions/galleryActions';
import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { elevationMeasurementSetPoint } from 'fm3/actions/elevationMeasurementActions';
import {
  authChooseLoginMethod,
  authLoginClose,
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginWithOsm,
} from 'fm3/actions/authActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { isActionOf } from 'typesafe-actions';
import {
  distanceMeasurementUpdatePoint,
  distanceMeasurementAddPoint,
  distanceMeasurementRemovePoint,
} from 'fm3/actions/distanceMeasurementActions';
import {
  areaMeasurementUpdatePoint,
  areaMeasurementAddPoint,
  areaMeasurementRemovePoint,
  areaMeasurementSetPoints,
} from 'fm3/actions/areaMeasurementActions';
import {
  infoPointAdd,
  infoPointChangeLabel,
  infoPointChangePosition,
  infoPointDelete,
  infoPointSetAll,
} from 'fm3/actions/infoPointActions';
import { tipsNext, tipsPrevious, tipsShow } from 'fm3/actions/tipsActions';
import {
  routePlannerAddMidpoint,
  routePlannerSetFinish,
  routePlannerSetStart,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSetMode,
  routePlannerSwapEnds,
  routePlannerSetParams,
  routePlannerSetTransportType,
  routePlannerSetPickMode,
  routePlannerRemoveMidpoint,
  routePlannerSetMidpoint,
  routePlannerToggleElevationChart,
} from 'fm3/actions/routePlannerActions';
import {
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';

const tipKeys = allTips.map(([key]) => key);

let lastActionType: string | undefined;

export const urlProcessor: IProcessor = {
  actionCreator: [
    mapLoadState,
    mapRefocus,
    setTool,
    clearMap,
    mapReset,
    trackViewerSetTrackUID,
    trackViewerColorizeTrackBy,
    trackViewerDownloadTrack,
    galleryRequestImage,
    galleryClear,
    galleryShowFilter,
    galleryHideFilter,
    galleryShowUploadModal,
    galleryHideUploadModal,
    changesetsSetDays,
    changesetsSetAuthorName,
    elevationMeasurementSetPoint,
    gallerySetFilter,
    setActiveModal,
    authChooseLoginMethod,
    authLoginClose,
    enableUpdatingUrl,
    trackingActions.setTrackedDevices,
    trackingActions.saveTrackedDevice,
    trackingActions.deleteTrackedDevice,
    trackingActions.setActive,
    authLoginWithOsm,
    authLoginWithFacebook,
    authLoginWithGoogle,
    areaMeasurementAddPoint,
    areaMeasurementUpdatePoint,
    areaMeasurementRemovePoint,
    areaMeasurementSetPoints,
    distanceMeasurementAddPoint,
    distanceMeasurementUpdatePoint,
    distanceMeasurementRemovePoint,
    infoPointAdd,
    infoPointChangeLabel,
    infoPointChangePosition,
    infoPointDelete,
    infoPointSetAll,
    tipsNext,
    tipsPrevious,
    tipsShow,
    osmLoadNode,
    osmLoadRelation,
    osmLoadWay,
    routePlannerSetStart,
    routePlannerSetFinish,
    routePlannerSetMidpoint,
    routePlannerAddMidpoint,
    routePlannerRemoveMidpoint,
    routePlannerSetActiveAlternativeIndex,
    routePlannerSetMode,
    routePlannerSetPickMode,
    routePlannerSwapEnds,
    routePlannerSetParams,
    routePlannerSetTransportType,
    routePlannerToggleElevationChart,
  ],
  handle: async ({ getState, action }) => {
    const {
      map,
      routePlanner,
      trackViewer,
      gallery,
      infoPoint,
      changesets,
      distanceMeasurement,
      areaMeasurement,
      elevationMeasurement,
      gallery: { filter: galleryFilter },
      main,
      tips,
      auth,
      tracking,
    } = getState();

    if (!main.urlUpdatingEnabled) {
      return;
    }

    const queryParts = [
      `map=${map.zoom}/${serializePoint({ lat: map.lat, lon: map.lon })}`,
      `layers=${map.mapType}${map.overlays.join('')}`,
    ];

    if (main.tool) {
      queryParts.push(`tool=${main.tool}`);
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

    if (infoPoint.points.length) {
      queryParts.push(
        ...infoPoint.points.map(
          point =>
            `info-point=${serializePoint(point)}${
              point.label ? `,${encodeURIComponent(point.label)}` : ''
            }`,
        ),
      );
    }

    if (distanceMeasurement.points && distanceMeasurement.points.length) {
      queryParts.push(
        `distance-measurement-points=${distanceMeasurement.points
          .map(point => serializePoint(point))
          .join(',')}`,
      );
    }

    if (areaMeasurement.points && areaMeasurement.points.length) {
      queryParts.push(
        `area-measurement-points=${areaMeasurement.points
          .map(point => serializePoint(point))
          .join(',')}`,
      );
    }

    if (elevationMeasurement.point) {
      queryParts.push(
        `elevation-measurement-point=${serializePoint(
          elevationMeasurement.point,
        )}`,
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

    if (tracking.activeTrackId) {
      queryParts.push(`follow=${encodeURIComponent(tracking.activeTrackId)}`);
    }

    const search = `?${queryParts.join('&')}`;

    if (window.location.search !== search) {
      const method =
        lastActionType &&
        isActionOf(
          [
            mapRefocus,
            distanceMeasurementUpdatePoint,
            areaMeasurementUpdatePoint,
          ],
          action,
        )
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

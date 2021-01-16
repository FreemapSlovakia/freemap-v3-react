import { authChooseLoginMethod, authLoginClose } from 'fm3/actions/authActions';
import {
  changesetsSet,
  changesetsSetAuthorName,
  changesetsSetDays,
} from 'fm3/actions/changesetsActions';
import { drawingLineSetLines, Line } from 'fm3/actions/drawingLineActions';
import {
  drawingPointAdd,
  drawingPointSetAll,
} from 'fm3/actions/drawingPointActions';
import {
  galleryClear,
  GalleryFilter,
  galleryHideFilter,
  galleryHideUploadModal,
  galleryRequestImage,
  gallerySetFilter,
  galleryShowFilter,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import {
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  Tool,
} from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import {
  osmClear,
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';
import { routePlannerSetParams } from 'fm3/actions/routePlannerActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import {
  ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
} from 'fm3/actions/trackViewerActions';
import { history } from 'fm3/historyHolder';
import {
  getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2,
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
} from 'fm3/oldFreemapUtils';
import refModals from 'fm3/refModals.json';
import tips from 'fm3/tips/index.json';
import { getMapStateDiffFromUrl, getMapStateFromUrl } from 'fm3/urlMapUtils';
import { Location } from 'history';
import queryString, { ParsedQuery } from 'query-string';
import { Dispatch } from 'redux';
import { is } from 'typescript-is';
import { RootAction } from './actions';
import { mapsLoad } from './actions/mapsActions';
import { searchSetQuery } from './actions/searchActions';
import { trackingActions } from './actions/trackingActions';
import { MyStore, RootState } from './storeCreator';
import { isTransportType } from './transportTypeDefs';
import { LatLon } from './types/common';
import { TrackedDevice } from './types/trackingTypes';

const tipKeys = tips.map(([key]) => key);

export const handleLocationChange = (
  store: MyStore,
  location: Location<{ sq?: string }>,
): void => {
  const { getState, dispatch } = store;

  const search = document.location.search;

  const sq = history.location.state?.sq ?? '';

  const parsedQuery = queryString.parse(search);

  const id =
    (typeof parsedQuery.id === 'string'
      ? parseInt(parsedQuery.id, 10)
      : undefined) || undefined;

  if (id !== getState().maps.id) {
    dispatch(
      mapsLoad({
        id,
        ignoreMap: 'map' in parsedQuery,
        ignoreLayers: 'layers' in parsedQuery,
      }),
    );
  }

  const query =
    id === undefined
      ? parsedQuery
      : {
          ...parsedQuery,
          ...queryString.parse(sq),
        };

  const params = new URLSearchParams(
    id === undefined ? search : sq,
  ) as URLSearchParams & Map<string, string>;

  {
    const points =
      typeof query.points === 'string'
        ? query.points
            .split(',')
            .map((point) =>
              point ? point.split('/').map((coord) => parseFloat(coord)) : null,
            )
        : [];

    const pointsOk =
      points.length > 0 &&
      points.every(
        (point, i) =>
          (point !== null || i === 0 || i === points.length - 1) &&
          (point === null ||
            (point.length === 2 &&
              !Number.isNaN(point[0]) &&
              !Number.isNaN(point[1]))),
      );

    if (
      typeof query.transport === 'string' &&
      isTransportType(query.transport) &&
      pointsOk
    ) {
      const {
        start,
        finish,
        midpoints,
        transportType,
        mode,
        milestones,
      } = getState().routePlanner;

      const latLons = points
        .map((point) => (point ? { lat: point[0], lon: point[1] } : null))
        .filter((x): x is LatLon => !!x);

      const nextStart = latLons[0];

      const nextMidpoints = latLons.slice(1, latLons.length - 1);

      const nextFinish =
        latLons.length > 1 ? latLons[latLons.length - 1] : null;

      if (
        query.transport !== transportType ||
        serializePoint(start) !== serializePoint(nextStart) ||
        serializePoint(finish) !== serializePoint(nextFinish) ||
        midpoints.length !== nextMidpoints.length ||
        midpoints.some(
          (midpoint, i) =>
            serializePoint(midpoint) !== serializePoint(nextMidpoints[i]),
        ) ||
        (mode === 'route' ? undefined : mode) !== query['route-mode'] ||
        (milestones && !query['milestones'])
      ) {
        const routeMode = query['route-mode'];

        dispatch(
          routePlannerSetParams({
            start: nextStart,
            finish: nextFinish,
            midpoints: nextMidpoints,
            transportType: query.transport,
            mode:
              routeMode === 'trip' || routeMode === 'roundtrip'
                ? routeMode
                : 'route',
            milestones: !!query['milestones'],
          }),
        );
      }
    } else if (
      getState().routePlanner.start ||
      getState().routePlanner.finish
    ) {
      dispatch(
        routePlannerSetParams({
          start: null,
          finish: null,
          midpoints: [],
          transportType: getState().routePlanner.transportType,
          milestones: !!query['milestones'],
        }),
      );
    }
  }

  const tool =
    !query.tool || typeof query.tool !== 'string'
      ? null
      : query.tool === 'info-point'
      ? 'draw-points'
      : query.tool === 'measure-area'
      ? 'draw-polygons'
      : query.tool === 'measure-dist'
      ? 'draw-lines'
      : query.tool === 'gallery'
      ? 'photos'
      : is<Tool>(query.tool)
      ? query.tool
      : null;

  if ((getState().main.selection?.type ?? null) !== tool) {
    dispatch(selectFeature(tool ? { type: tool } : null));
  }

  const trackUID = query['track-uid'];
  if (
    typeof trackUID === 'string' &&
    getState().trackViewer.trackUID !== trackUID
  ) {
    dispatch(trackViewerDownloadTrack(trackUID));
  }

  const colorizeTrackBy = query['track-colorize-by'];
  if (typeof colorizeTrackBy === 'string') {
    if (getState().trackViewer.colorizeTrackBy !== colorizeTrackBy) {
      dispatch(trackViewerColorizeTrackBy(colorizeTrackBy as ColorizingMode));
    }
  } else if (getState().trackViewer.colorizeTrackBy) {
    dispatch(trackViewerColorizeTrackBy(null));
  }

  handleInfoPoint(getState, dispatch, query);

  const changesetsDay = query['changesets-days'];
  if (typeof changesetsDay === 'string') {
    const urlDays = parseInt(changesetsDay, 10);

    const reduxDays = getState().changesets.days;

    const daysDiff = reduxDays !== urlDays;

    if (daysDiff) {
      dispatch(changesetsSetDays(urlDays));
    }

    const reduxAuthor = getState().changesets.authorName;

    const urlAuthor = query['changesets-author'];

    if (
      (urlAuthor === null || typeof urlAuthor === 'string') &&
      (daysDiff || (typeof urlAuthor === 'string' && reduxAuthor !== urlAuthor))
    ) {
      // we need timeout otherwise map bounds can't be read
      window.setTimeout(() => {
        dispatch(changesetsSetAuthorName(urlAuthor));
      }, 1000);
    }
  } else if (getState().changesets.changesets.length) {
    dispatch(changesetsSetDays(null));
    dispatch(changesetsSetAuthorName(null));
    dispatch(changesetsSet([]));
  }

  const lines: Line[] = [];

  for (const [key, value] of params) {
    if (
      key === 'distance-measurement-points' ||
      key === 'area-measurement-points' ||
      key === 'line' ||
      key === 'polygon'
    ) {
      const [line, label] = value.split(';');

      const points = line
        .split(',')
        .map((point) => point.split('/').map((coord) => parseFloat(coord)))
        .map((pair, id) => ({ lat: pair[0], lon: pair[1], id }));

      if (
        points.every(
          (point) => !Number.isNaN(point.lat) && !Number.isNaN(point.lon),
        )
      ) {
        lines.push({
          type:
            key === 'distance-measurement-points' || key === 'line'
              ? 'line'
              : 'polygon',
          points,
          label,
        });
      }
    }
  }

  if (
    lines.map(serializePoints).join(';') !==
    getState().drawingLines.lines.map(serializePoints).join(';')
  ) {
    dispatch(drawingLineSetLines(lines));
  }

  const transformed = getTrasformedParamsIfIsOldEmbeddedFreemapUrl(location);

  if (transformed) {
    const { lat, lon } = transformed;
    dispatch(drawingPointAdd({ lat, lon }));
  }

  const f2 = getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2(location);
  if (f2) {
    const { lat, lon, label } = f2;
    dispatch(drawingPointAdd({ lat, lon, label }));
  }

  const gpxUrl = query['gpx-url'] || query.load; /* backward compatibility */
  if (typeof gpxUrl === 'string' && gpxUrl !== getState().trackViewer.gpxUrl) {
    dispatch(trackViewerGpxLoad(gpxUrl));
  }

  const osmNode = query['osm-node'];
  const osmNodeId = typeof osmNode === 'string' && parseInt(osmNode, 10);
  if (osmNodeId) {
    if (osmNodeId !== getState().trackViewer.osmNodeId) {
      dispatch(osmLoadNode(osmNodeId));
    }
  } else if (getState().trackViewer.osmNodeId) {
    dispatch(osmClear());
  }

  const osmWay = query['osm-way'];
  const osmWayId = typeof osmWay === 'string' && parseInt(osmWay, 10);
  if (osmWayId) {
    if (osmWayId !== getState().trackViewer.osmWayId) {
      dispatch(osmLoadWay(osmWayId));
    }
  } else if (getState().trackViewer.osmWayId) {
    dispatch(osmClear());
  }

  const osmRelation = query['osm-relation'];
  const osmRelationId =
    typeof osmRelation === 'string' && parseInt(osmRelation, 10);

  if (osmRelationId) {
    if (osmRelationId !== getState().trackViewer.osmRelationId) {
      dispatch(osmLoadRelation(osmRelationId));
    }
  } else if (getState().trackViewer.osmRelationId) {
    dispatch(osmClear());
  }

  handleGallery(getState, dispatch, query);

  const diff = getMapStateDiffFromUrl(
    getMapStateFromUrl(location),
    getState().map,
  );

  if (diff && Object.keys(diff).length) {
    dispatch(mapRefocus(diff));
  }

  const activeModal = getState().main.activeModal;
  if (typeof query.show === 'string' && refModals.includes(query.show)) {
    if (query.show !== activeModal) {
      dispatch(setActiveModal(query.show));
    }
  } else if (
    typeof activeModal === 'string' &&
    refModals.includes(activeModal)
  ) {
    dispatch(setActiveModal(null));
  }

  if (typeof query.tip === 'string' && tipKeys.includes(query.tip)) {
    if (
      getState().main.activeModal !== 'tips' ||
      getState().tips.tip !== query.tip
    ) {
      dispatch(tipsShow(query.tip));
    }
  } else if (getState().main.activeModal === 'tips') {
    dispatch(setActiveModal(null));
  }

  if (query.show === 'login') {
    if (!getState().auth.chooseLoginMethod) {
      dispatch(authChooseLoginMethod());
    }
  } else if (getState().auth.chooseLoginMethod) {
    dispatch(authLoginClose());
  }

  if ((query.embed ?? '') !== getState().main.embedFeatures.join(',')) {
    dispatch(
      setEmbedFeatures(
        !query.embed || typeof query.embed !== 'string'
          ? []
          : query.embed.split(','),
      ),
    );
  }

  const { track } = query;
  const trackings = !track ? [] : Array.isArray(track) ? track : [track];
  const parsedTd: TrackedDevice[] = [];

  for (const tracking of trackings) {
    const [id0, ...parts] = tracking.split('/');
    const id = /^\d+$/.test(id0) ? Number.parseInt(id0) : id0;
    let fromTime: Date | null = null;
    let maxAge: number | null = null;
    let maxCount: number | null = null;
    let label: string | null = null;
    let color: string | null = null;
    let width: number | null = null;
    let splitDistance: number | null = null;
    let splitDuration: number | null = null;

    for (const part of parts) {
      const m = /^([a-z]+):(.+)/.exec(part);
      if (!m) {
        continue;
      }

      const [, type, value] = m;

      switch (type) {
        case 'f':
          fromTime = new Date(value);
          break;
        case 'a':
          maxAge = Number.parseInt(value, 10);
          break;
        case 'w':
          width = Number.parseFloat(value);
          break;
        case 'c':
          color = value;
          break;
        case 'n':
          maxCount = Number.parseInt(value, 10);
          break;
        case 'l':
          label = value;
          break;
        case 'sd':
          splitDistance = Number.parseInt(value, 10);
          break;
        case 'st':
          splitDuration = Number.parseInt(value, 10);
          break;
        default:
          break;
      }
    }

    parsedTd.push({
      id,
      fromTime,
      maxAge,
      maxCount,
      label,
      width,
      color,
      splitDistance,
      splitDuration,
    });
  }

  const { trackedDevices } = getState().tracking;

  outer: for (const newTd of parsedTd) {
    for (const trackedDevice of trackedDevices) {
      if (trackedDevicesEquals(trackedDevice, newTd)) {
        continue outer;
      }
    }
    dispatch(trackingActions.setTrackedDevices(parsedTd));
    break;
  }

  // eslint-disable-next-line
  const fq = query.follow;
  if (typeof fq === 'string') {
    const follow = /^\d+$/.test(fq) ? Number.parseInt(fq) : fq;
    const { selection } = getState().main;
    if (
      (selection?.type === 'tracking' ? selection?.id : undefined) !== follow
    ) {
      dispatch(selectFeature({ type: 'tracking', id: follow }));
    }
  }
};

// TODO use some generic deep compare fn
function trackedDevicesEquals(td1: TrackedDevice, td2: TrackedDevice): boolean {
  return (
    td1.id === td2.id &&
    td1.fromTime?.getTime() === td2.fromTime?.getTime() &&
    td1.maxAge === td2.maxAge &&
    td1.maxCount === td2.maxCount &&
    td1.label === td2.label
  );
}

function handleGallery(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
  query: ParsedQuery<string>,
) {
  let a = query['gallery-user-id'];
  const qUserId = typeof a === 'string' ? parseInt(a, 10) : undefined;
  a = query['gallery-tag'];
  const qGalleryTag = typeof a === 'string' ? a : undefined;
  a = query['gallery-rating-from'];
  const qRatingFrom = typeof a === 'string' ? parseFloat(a) : undefined;
  a = query['gallery-rating-to'];
  const qRatingTo = typeof a === 'string' ? parseFloat(a) : undefined;
  a = query['gallery-taken-at-from'];
  const qTakenAtFrom = typeof a === 'string' ? new Date(a) : undefined;
  a = query['gallery-taken-at-to'];
  const qTakenAtTo = typeof a === 'string' ? new Date(a) : undefined;
  a = query['gallery-created-at-from'];
  const qCreatedAtFrom = typeof a === 'string' ? new Date(a) : undefined;
  a = query['gallery-created-at-to'];
  const qCreatedAtTo = typeof a === 'string' ? new Date(a) : undefined;

  if (
    qUserId ||
    qGalleryTag != null ||
    qRatingFrom ||
    qRatingTo ||
    qTakenAtFrom ||
    qTakenAtTo ||
    qCreatedAtFrom ||
    qCreatedAtTo
  ) {
    const { filter } = getState().gallery;
    const newFilter: GalleryFilter = {};
    if (qUserId && filter.userId !== qUserId) {
      newFilter.userId = qUserId;
    }
    if (typeof qGalleryTag === 'string' && filter.tag !== qGalleryTag) {
      newFilter.tag = qGalleryTag;
    }
    if (qRatingFrom && filter.ratingFrom !== qRatingFrom) {
      newFilter.ratingFrom = qRatingFrom;
    }
    if (qRatingTo && filter.ratingTo !== qRatingTo) {
      newFilter.ratingTo = qRatingTo;
    }
    if (
      qTakenAtFrom &&
      (filter.takenAtFrom ? filter.takenAtFrom.getTime() : NaN) !==
        qTakenAtFrom.getTime()
    ) {
      newFilter.takenAtFrom = qTakenAtFrom;
    }
    if (
      qTakenAtTo &&
      (filter.takenAtTo ? filter.takenAtTo.getTime() : NaN) !==
        qTakenAtTo.getTime()
    ) {
      newFilter.takenAtTo = qTakenAtTo;
    }
    if (
      qCreatedAtFrom &&
      (filter.createdAtFrom ? filter.createdAtFrom.getTime() : NaN) !==
        qCreatedAtFrom.getTime()
    ) {
      newFilter.createdAtFrom = qCreatedAtFrom;
    }
    if (
      qCreatedAtTo &&
      (filter.createdAtTo ? filter.createdAtTo.getTime() : NaN) !==
        qCreatedAtTo.getTime()
    ) {
      newFilter.createdAtTo = qCreatedAtTo;
    }
    if (Object.keys(newFilter).length !== 0) {
      dispatch(gallerySetFilter({ ...filter, ...newFilter }));
    }
  }

  if (typeof query.image === 'string') {
    const imageId = parseInt(query.image, 10);
    if (getState().gallery.activeImageId !== imageId) {
      dispatch(galleryRequestImage(imageId));
    }
  } else if (getState().gallery.activeImageId) {
    dispatch(galleryClear());
  }

  if (query.show === 'gallery-filter') {
    if (!getState().gallery.showFilter) {
      dispatch(galleryShowFilter());
    }
  } else if (getState().gallery.showFilter) {
    dispatch(galleryHideFilter());
  }

  if (query.show === 'gallery-upload') {
    if (!getState().gallery.showUploadModal) {
      dispatch(galleryShowUploadModal());
    }
  } else if (getState().gallery.showUploadModal) {
    dispatch(galleryHideUploadModal());
  }
}

function handleInfoPoint(
  getState: () => RootState,
  dispatch: Dispatch,
  query: queryString.ParsedQuery<string>,
) {
  const drawingPoint =
    query['point'] || query['info-point']; /* compatibility */

  const emp = query['elevation-measurement-point']; // for compatibility

  const ips = (!drawingPoint
    ? []
    : Array.isArray(drawingPoint)
    ? drawingPoint
    : [drawingPoint]
  )
    .concat(typeof emp === 'string' ? [emp] : [])
    .map((ip) => /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)[,;]?(.*)$/.exec(ip)) // comma (,) is for compatibility
    .filter((ipMatch) => ipMatch)
    .map((ipMatch) => ({
      // see https://github.com/microsoft/TypeScript/issues/29642
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      lat: parseFloat(ipMatch![1]),
      lon: parseFloat(ipMatch![2]),
      label: ipMatch![3] ? decodeURIComponent(ipMatch![3]) : '',
    }));

  // backward compatibility
  const ipl = query['info-point-label'];
  if (ipl && ips.length) {
    ips[0].label = typeof ipl === 'string' ? decodeURIComponent(ipl) : '';
  }

  // compare
  if (
    ips
      .map(({ lat, lon, label }) => `${serializePoint({ lat, lon })},${label}`)
      .sort()
      .join('\n') !==
    getState()
      .drawingPoints.points.map(
        ({ lat, lon, label }) => `${serializePoint({ lat, lon })},${label}`,
      )
      .sort()
      .join('\n')
  ) {
    dispatch(drawingPointSetAll(ips));
  }

  if (typeof query.q === 'string') {
    dispatch(searchSetQuery({ query: query.q, fromUrl: true }));
  }
}

function serializePoints(line: Line): string {
  return `${line.type}:${line.points
    .map((point) => serializePoint(point))
    .join(',')}`;
}

function serializePoint(point: LatLon | null): string {
  return point && typeof point.lat === 'number' && typeof point.lon === 'number'
    ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}`
    : '';
}

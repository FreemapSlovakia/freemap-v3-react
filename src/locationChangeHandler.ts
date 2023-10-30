import {
  ChangesetParams,
  changesetsSet,
  changesetsSetParams,
} from 'fm3/actions/changesetsActions';
import { drawingLineSetLines, Line } from 'fm3/actions/drawingLineActions';
import {
  drawingPointAdd,
  drawingPointSetAll,
} from 'fm3/actions/drawingPointActions';
import {
  galleryClear,
  galleryColorizeBy,
  GalleryColorizeBy,
  GalleryFilter,
  galleryRequestImage,
  gallerySetFilter,
} from 'fm3/actions/galleryActions';
import {
  documentShow,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setTool,
  ShowModal,
  Tool,
} from 'fm3/actions/mainActions';
import {
  CustomLayer,
  mapRefocus,
  mapSetCustomLayers,
} from 'fm3/actions/mapActions';
import {
  osmClear,
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from 'fm3/actions/osmActions';
import {
  routePlannerSetParams,
  Weighting,
} from 'fm3/actions/routePlannerActions';
import {
  ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
} from 'fm3/actions/trackViewerActions';
import { DocumentKey } from 'fm3/documents';
import { history } from 'fm3/historyHolder';
import {
  getInfoPointDetailsIfIsOldEmbeddedFreemapUrlFormat2,
  getTrasformedParamsIfIsOldEmbeddedFreemapUrl,
} from 'fm3/oldFreemapUtils';
import { getMapStateDiffFromUrl, getMapStateFromUrl } from 'fm3/urlMapUtils';
import { Location } from 'history';
import { Dispatch } from 'redux';
import { assert, is } from 'typia';
import { RootAction } from './actions';
import { l10nSetChosenLanguage } from './actions/l10nActions';
import { mapsLoad } from './actions/mapsActions';
import { objectsSetFilter } from './actions/objectsActions';
import { searchSetQuery } from './actions/searchActions';
import { trackingActions } from './actions/trackingActions';
import { basicModals, tools } from './constants';
import { RootState } from './reducers';
import { MyStore } from './storeCreator';
import { TransportType, transportTypeDefs } from './transportTypeDefs';
import { LatLon } from './types/common';
import { TrackedDevice } from './types/trackingTypes';

function parseQuery(search: string) {
  const q: Record<string, string | string[]> = {};

  for (const [k, v] of new URLSearchParams(search)) {
    const e = q[k];

    if (Array.isArray(e)) {
      e.push(v);
    } else if (e === undefined) {
      q[k] = v;
    } else {
      q[k] = [e, v];
    }
  }

  return q;
}

export function handleLocationChange(store: MyStore, location: Location): void {
  const { getState, dispatch } = store;

  const search = (document.location.hash || document.location.search).slice(1);

  const { sq } = (history.location.state as any) ?? {
    sq: undefined,
  };

  const parsedQuery = parseQuery(search);

  const id =
    (typeof parsedQuery['id'] === 'string' ? parsedQuery['id'] : undefined) ||
    undefined;

  if (
    id !== undefined &&
    id !== (getState().maps.loadMeta?.id ?? getState().maps.activeMap?.id)
  ) {
    dispatch(
      mapsLoad({
        id,
        ignoreMap: 'map' in parsedQuery,
        ignoreLayers: 'layers' in parsedQuery,
      }),
    );
  }

  const query =
    id === undefined ? parsedQuery : { ...parsedQuery, ...parseQuery(sq) };

  const tool =
    !query['tool'] || typeof query['tool'] !== 'string'
      ? null
      : query['tool'] === 'info-point'
      ? 'draw-points'
      : query['tool'] === 'measure-area'
      ? 'draw-polygons'
      : query['tool'] === 'measure-dist'
      ? 'draw-lines'
      : tools.includes(query['tool'] as Tool)
      ? (query['tool'] as Tool)
      : null;

  if (getState().main.tool !== tool) {
    dispatch(setTool(tool));
  }

  {
    const points =
      typeof query['points'] === 'string'
        ? query['points']
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

    const qMilestones = query['milestones'];

    const reqMilestones =
      qMilestones === '1' || qMilestones === 'abs'
        ? 'abs'
        : qMilestones === 'rel'
        ? 'rel'
        : false;

    if (
      transportTypeDefs[query['transport'] as TransportType] && // for dev
      is<TransportType>(query['transport']) && // for prod
      pointsOk
    ) {
      const {
        start,
        finish,
        midpoints,
        transportType,
        mode,
        milestones,
        weighting,
        roundtripParams,
        isochroneParams,
      } = getState().routePlanner;

      const latLons = points.map((point) =>
        point ? { lat: point[0], lon: point[1] } : null,
      );

      const nextStart = latLons[0];

      const nextMidpoints = latLons
        .slice(1, latLons.length - 1)
        .filter((x): x is LatLon => !!x);

      const nextFinish = latLons[latLons.length - 1];

      if (
        query['transport'] !== transportType ||
        serializePoint(start) !== serializePoint(nextStart) ||
        serializePoint(finish) !== serializePoint(nextFinish) ||
        midpoints.length !== nextMidpoints.length ||
        midpoints.some(
          (midpoint, i) =>
            serializePoint(midpoint) !== serializePoint(nextMidpoints[i]),
        ) ||
        (mode === 'route' ? undefined : mode) !== query['route-mode'] ||
        (weighting === 'fastest' ? undefined : weighting) !==
          query['route-weighting'] ||
        milestones !== reqMilestones ||
        String(roundtripParams.seed) !== (query['trip-seed'] ?? '0') ||
        String(roundtripParams.distance) !==
          (query['trip-distance'] ?? '5000') ||
        String(isochroneParams.buckets) !== (query['iso-buckets'] ?? '1') ||
        String(isochroneParams.distanceLimit) !==
          (query['iso-distance-limit'] ?? '0') ||
        String(isochroneParams.timeLimit) !== (query['iso-time-limit'] ?? '600')
      ) {
        const routeMode = query['route-mode'];

        const weighting = query['route-weighting'];

        dispatch(
          routePlannerSetParams({
            start: nextStart,
            finish: nextFinish,
            midpoints: nextMidpoints,
            transportType: query['transport'],
            mode:
              routeMode === 'trip' ||
              routeMode === 'roundtrip' ||
              routeMode === 'isochrone'
                ? routeMode
                : 'route',
            weighting: is<Weighting>(weighting) ? weighting : undefined,
            milestones: reqMilestones,
            roundtripParams: {
              seed: Number(query['trip-seed']) || 0,
              distance: Number(query['trip-distance']) || 5000,
            },
            isochroneParams: {
              distanceLimit: Number(query['iso-distance-limit']) || 0,
              timeLimit: Number(query['iso-time-limit']) || 600,
              buckets: Number(query['iso-buckets']) || 1,
            },
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
          milestones: reqMilestones,
        }),
      );
    }
  }

  const lang = query['lang'];

  if (
    typeof lang === 'string' &&
    ['en', 'sk', 'cs', 'hu', 'it'].includes(lang as string)
  ) {
    dispatch(l10nSetChosenLanguage({ language: lang }));
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

  const changesetsDays = query['changesets-days'];

  const changesetParams: ChangesetParams = {};

  if (typeof changesetsDays === 'string') {
    const urlDays = Number(changesetsDays);

    const reduxDays = getState().changesets.days;

    const daysDiff = reduxDays !== urlDays;

    if (daysDiff) {
      changesetParams.days = urlDays;
    }

    const reduxAuthor = getState().changesets.authorName;

    const urlAuthor = query['changesets-author'];

    if (
      (urlAuthor === null || typeof urlAuthor === 'string') &&
      (daysDiff || (typeof urlAuthor === 'string' && reduxAuthor !== urlAuthor))
    ) {
      changesetParams.authorName = urlAuthor;
    }
  } else if (getState().changesets.changesets.length) {
    changesetParams.days = null;

    changesetParams.authorName = null;

    dispatch(changesetsSet([]));
  }

  if (Object.keys(changesetParams).length) {
    dispatch(changesetsSetParams(changesetParams));
  }

  const lines: Line[] = [];

  for (const [key, value] of new URLSearchParams(
    id === undefined ? search : sq,
  )) {
    if (
      key === 'distance-measurement-points' ||
      key === 'area-measurement-points' ||
      key === 'line' ||
      key === 'polygon'
    ) {
      const m = /([^;\x1e]*)([;\x1e].*)?/.exec(value);

      if (!m) {
        continue;
      }

      const points = m[1]
        .split(',')
        .map((point) =>
          point
            .split('/')
            .map((coord) => parseFloat(coord))
            .filter((x) => !isNaN(x)),
        )
        .filter((pair) => pair.length === 2)
        .map((pair, id) => ({ lat: pair[0], lon: pair[1], id }));

      if (points.length > 0) {
        lines.push({
          type:
            key === 'distance-measurement-points' || key === 'line'
              ? 'line'
              : 'polygon',
          points,
          ...parseColorAndLabel(m[2] ?? ''),
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

  const gpxUrl = query['gpx-url'] || query['load']; /* backward compatibility */

  if (typeof gpxUrl === 'string' && gpxUrl !== getState().trackViewer.gpxUrl) {
    dispatch(trackViewerGpxLoad(gpxUrl));
  }

  const focus = !/[?&#]map=/.test(
    window.location.search || window.location.hash,
  );

  const osmNode = query['osm-node'];

  const osmNodeId = typeof osmNode === 'string' && parseInt(osmNode, 10);

  if (osmNodeId) {
    if (osmNodeId !== getState().search.osmNodeId) {
      dispatch(osmLoadNode({ id: osmNodeId, focus }));
    }
  } else if (getState().search.osmNodeId) {
    dispatch(osmClear());
  }

  const osmWay = query['osm-way'];

  const osmWayId = typeof osmWay === 'string' && parseInt(osmWay, 10);

  if (osmWayId) {
    if (osmWayId !== getState().search.osmWayId) {
      dispatch(osmLoadWay({ id: osmWayId, focus }));
    }
  } else if (getState().search.osmWayId) {
    dispatch(osmClear());
  }

  const osmRelation = query['osm-relation'];

  const osmRelationId =
    typeof osmRelation === 'string' && parseInt(osmRelation, 10);

  if (osmRelationId) {
    if (osmRelationId !== getState().search.osmRelationId) {
      dispatch(osmLoadRelation({ id: osmRelationId, focus }));
    }
  } else if (getState().search.osmRelationId) {
    dispatch(osmClear());
  }

  handleGallery(getState, dispatch, query);

  const customLayers = query['custom-layers'];

  if (
    typeof customLayers === 'string' &&
    JSON.stringify(getState().map.customLayers) !== customLayers
  ) {
    const existingClsStrings = getState().map.customLayers.map((cl) =>
      JSON.stringify(cl),
    );

    try {
      const newCls = assert<CustomLayer[]>(JSON.parse(customLayers)).filter(
        (cl) => !existingClsStrings.includes(JSON.stringify(cl)),
      );

      if (newCls.length) {
        for (const cm of newCls) {
          if ((cm as any).tileSize) {
            cm.scaleWithDpi = true;
          }
        }

        dispatch(mapSetCustomLayers(newCls));
      }
    } catch {
      // ignore
    }
  }

  const diff = getMapStateDiffFromUrl(
    getMapStateFromUrl(location),
    getState().map,
  );

  if (diff && Object.keys(diff).length) {
    dispatch(mapRefocus(diff));
  }

  const activeModal = getState().main.activeModal;

  const { show } = query;

  if (is<ShowModal>(show) && show) {
    if (show !== activeModal) {
      dispatch(setActiveModal(show));
    }
  } else if (is<ShowModal>(activeModal) && basicModals.includes(activeModal)) {
    dispatch(setActiveModal(null));
  }

  const tip = query['tip'];

  if (typeof tip === 'string' && is<DocumentKey>(tip)) {
    if (getState().main.documentKey !== tip) {
      dispatch(documentShow(tip));
    }
  } else if (getState().main.documentKey) {
    dispatch(documentShow(null));
  }

  const embed = query['embed'];

  if ((embed ?? '') !== getState().main.embedFeatures.join(',')) {
    dispatch(
      setEmbedFeatures(
        embed && typeof embed === 'string' ? embed.split(',') : [],
      ),
    );
  }

  const objects = query['objects'];

  if ((objects ?? '') !== getState().objects.active.join(';')) {
    dispatch(
      objectsSetFilter(
        objects && typeof objects === 'string' ? objects.split(';') : [],
      ),
    );
  }

  const { track } = query;

  const trackings = !track ? [] : Array.isArray(track) ? track : [track];

  const parsedTd: TrackedDevice[] = [];

  for (const tracking of trackings) {
    if (!tracking) {
      continue;
    }

    const [id, ...parts] = tracking.split('/');

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
      token: id,
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
  const fq = query['follow'];

  if (typeof fq === 'string') {
    const follow = /^\d+$/.test(fq) ? Number.parseInt(fq) : fq;

    const { selection } = getState().main;

    if (
      (selection?.type === 'tracking' ? selection?.id : undefined) !== follow
    ) {
      dispatch(selectFeature({ type: 'tracking', id: follow }));
    }
  }
}

// TODO use some generic deep compare fn
function trackedDevicesEquals(td1: TrackedDevice, td2: TrackedDevice): boolean {
  return (
    td1.token === td2.token &&
    td1.fromTime?.getTime() === td2.fromTime?.getTime() &&
    td1.maxAge === td2.maxAge &&
    td1.maxCount === td2.maxCount &&
    td1.label === td2.label
  );
}

function handleGallery(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
  query: Record<string, string | string[]>,
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

  a = query['gallery-pano'];

  const qPano = typeof a !== 'string' ? undefined : a === 'true';

  if (
    qUserId ||
    qGalleryTag != null ||
    qRatingFrom ||
    qRatingTo ||
    qTakenAtFrom ||
    qTakenAtTo ||
    qCreatedAtFrom ||
    qCreatedAtTo ||
    qPano !== undefined
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

    if (qPano !== filter.pano) {
      newFilter.pano = qPano;
    }

    if (Object.keys(newFilter).length !== 0) {
      dispatch(gallerySetFilter({ ...filter, ...newFilter }));
    }
  }

  if (typeof query['image'] === 'string') {
    const imageId = Number(query['image']);

    if (getState().gallery.activeImageId !== imageId) {
      dispatch(galleryRequestImage(imageId));
    }
  } else if (getState().gallery.activeImageId) {
    dispatch(galleryClear());
  }

  const cb = query['gallery-cb'];

  if (cb && is<GalleryColorizeBy>(cb)) {
    dispatch(galleryColorizeBy(cb));
  }
}

function parseColorAndLabel(m: string) {
  let label: string | undefined;

  let color: string | undefined;

  let width: number | undefined;

  // compatibility
  if (m.startsWith(',') || m.startsWith(';')) {
    if (m[1] === '#') {
      color = m.slice(1, 8);

      label = m.slice(9);
    } else {
      label = m.replace(/^[,;]*/, '');
    }
  } else if (m.startsWith('\x1e')) {
    for (const field of m.slice(1).split('\x1e')) {
      if (field[0] === 'L') {
        label = field.slice(1);
      } else if (field[0] === 'C') {
        color = field.slice(1);
      } else if (field[0] === 'W') {
        width = Number(field.slice(1)) || undefined;
      }
    }
  }

  return { label, color, width };
}

function handleInfoPoint(
  getState: () => RootState,
  dispatch: Dispatch,
  query: Record<string, string | string[]>,
) {
  const drawingPoint =
    query['point'] || query['info-point']; /* compatibility */

  const emp = query['elevation-measurement-point']; // for compatibility

  const ips = (
    !drawingPoint
      ? []
      : Array.isArray(drawingPoint)
      ? drawingPoint
      : [drawingPoint]
  )
    .concat(typeof emp === 'string' ? [emp] : [])
    .map((ip) =>
      ip ? /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)(.*?)?$/.exec(ip) : null,
    )
    .filter((ipMatch) => ipMatch)
    .map((ipMatch) => {
      // see https://github.com/microsoft/TypeScript/issues/29642
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const m = ipMatch!;

      return {
        lat: parseFloat(m[1]),
        lon: parseFloat(m[2]),
        ...parseColorAndLabel(m[3] ?? ''),
      };
    });

  // backward compatibility
  const ipl = query['info-point-label'];

  if (ipl && ips.length) {
    ips[0].label = typeof ipl === 'string' ? decodeURIComponent(ipl) : '';
  }

  // compare
  if (
    ips
      .map(
        ({ lat, lon, label, color }) =>
          `${serializePoint({ lat, lon })},${label},${color}`,
      )
      .sort()
      .join('\n') !==
    getState()
      .drawingPoints.points.map(
        ({ lat, lon, label, color }) =>
          `${serializePoint({ lat, lon })},${label},${color}`,
      )
      .sort()
      .join('\n')
  ) {
    dispatch(drawingPointSetAll(ips));
  }

  if (typeof query['q'] === 'string') {
    dispatch(searchSetQuery({ query: query['q'], fromUrl: true }));
  }
}

function serializePoints(line: Line): string {
  return `${line.type}:${line.points
    .map((point) => serializePoint(point))
    .join(',')}`;
}

function serializePoint(point: LatLon | null | undefined): string {
  return point && typeof point.lat === 'number' && typeof point.lon === 'number'
    ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}`
    : '';
}

import {
  ChangesetParams,
  changesetsSet,
  changesetsSetParams,
} from '@features/changesets/model/actions.js';
import {
  drawingLineSetLines,
  Line,
  type LineCap,
  type LineJoin,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointSetAll } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  GalleryColorizeBySchema,
  GalleryFilter,
  galleryClear,
  galleryColorizeBy,
  galleryRequestImage,
  gallerySetFilter,
} from '@features/gallery/model/actions.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import {
  mapRefocus,
  mapSetCustomLayers,
  mapSetShading,
} from '@features/map/model/actions.js';
import { mapsLoad } from '@features/myMaps/model/actions.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import {
  osmClear,
  osmLoadNode,
  osmLoadRelation,
  osmLoadWay,
} from '@features/osm/model/osmActions.js';
import {
  type ColorStop,
  type Color as ColorType,
  ShadingComponent,
  serializeShading,
} from '@features/parameterizedShading/model/Shading.js';
import {
  RoutePoint,
  routePlannerSetParams,
} from '@features/routePlanner/model/actions.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import type { TrackedDevice } from '@features/tracking/model/types.js';
import {
  type ColorizingMode,
  trackViewerColorizeTrackBy,
  trackViewerDownloadTrack,
  trackViewerGpxLoad,
} from '@features/trackViewer/model/actions.js';
import {
  wikimediaCommonsLoadPreview,
  wikimediaCommonsSetPreview,
} from '@features/wikimediaCommons/model/actions.js';
import { isLanguage } from '@shared/langUtils.js';
import {
  CustomLayerDefArrayCompatSchema,
  integratedLayerDefMap,
} from '@shared/mapDefinitions.js';
import { dedupeOpenTools } from '@shared/toolDefinitions.js';
import {
  type TransportType,
  TransportTypeCompatSchema,
  TransportTypeSchema,
} from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import Color from 'color';
import type { Dispatch } from 'redux';
import {
  decodeShow,
  encodeActiveModal,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setTools,
  Tool,
  ToolSchema,
} from '../store/actions.js';
import type { RootAction } from '../store/rootAction.js';
import type { MyStore, RootState } from '../store/store.js';
import { getMapStateDiffFromUrl, getMapStateFromUrl } from './urlMapUtils.js';
import { setUrlUpdatingEnabled } from './urlUpdating.js';

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

export function handleLocationChange(store: MyStore): void {
  const { getState, dispatch } = store;

  setUrlUpdatingEnabled(false);

  const search = (document.location.hash || document.location.search).slice(1);

  const { sq } = (history.state as { sq: string }) ?? {
    sq: undefined,
  };

  const parsedQuery = parseQuery(search);

  const id =
    (typeof parsedQuery['id'] === 'string' ? parsedQuery['id'] : undefined) ||
    undefined;

  if (
    id !== undefined &&
    id !== (getState().myMaps.loadMeta?.id ?? getState().myMaps.activeMap?.id)
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

  // Map legacy URL tool tokens to their current ids so older shared/bookmarked
  // links keep working.
  const toolAliases: Record<string, Tool> = {
    'info-point': 'draw-points',
    'measure-area': 'draw-polygons',
    'measure-dist': 'draw-lines',
    'track-viewer': 'import-file',
  };

  // `tools=` is comma-separated; `tool=` is the legacy single-tool param.
  const toolParam = query['tools'] ?? query['tool'];

  const tools = dedupeOpenTools(
    typeof toolParam !== 'string' || !toolParam
      ? []
      : toolParam
          .split(',')
          .map((t) => toolAliases[t] ?? ToolSchema.safeParse(t).data)
          .filter((t): t is Tool => Boolean(t)),
  );

  // Compare against the deduped form `setTools` will store, so a URL with
  // duplicate/draw-collapsed tools doesn't re-dispatch on every location change.
  const currentTools = getState().main.tools;

  if (
    currentTools.length !== tools.length ||
    currentTools.some((t, i) => t !== tools[i])
  ) {
    dispatch(setTools(tools));
  }

  {
    const qPoints =
      typeof query['points'] === 'string'
        ? query['points'].split(',').map((p) => {
            let point = p;

            if (!point) {
              return null;
            }

            // backward compatibility
            const digit = point[1];

            if (point[0] === 'm' && digit && digit >= '0' && digit <= '9') {
              point = 'manual/' + point.slice(1);
            }

            const parts = point.split('/');

            const transport = parts.length === 3 ? parts.shift() : undefined;

            return [
              transport,
              ...parts.map((part) => parseFloat(part)),
            ] as unknown as [TransportType, number, number];
          })
        : [];

    if (qPoints.length === 2 && !qPoints[1]) {
      qPoints.splice(1);
    }

    const pointsOk =
      qPoints.length > 0 &&
      qPoints.every(
        (point, i) =>
          (point !== null || i === 0 || i === qPoints.length - 1) &&
          (point === null ||
            (point.length === 3 &&
              TransportTypeSchema.optional().safeParse(point[0]).success &&
              !Number.isNaN(point[1]) &&
              !Number.isNaN(point[2]))),
      );

    const qMilestones = query['milestones'];

    const reqMilestones =
      qMilestones === '1' || qMilestones === 'abs'
        ? 'abs'
        : qMilestones === 'rel'
          ? 'rel'
          : false;

    if (TransportTypeSchema.safeParse(query['transport']).success && pointsOk) {
      const {
        points,
        finishOnly,
        transportType,
        mode,
        milestones,
        roundtripParams,
        isochroneParams,
      } = getState().routePlanner;

      const latLons = qPoints.map(
        (point) =>
          point && {
            transport: point[0],
            lat: point[1],
            lon: point[2],
          },
      );

      const nextFinishOnly = latLons.length > 0 && !latLons[0];

      if (nextFinishOnly) {
        latLons.shift();
      }

      if (
        finishOnly !== nextFinishOnly ||
        query['transport'] !== transportType ||
        points.length !== latLons.length ||
        points.some(
          (point, i) =>
            (point.transport ?? '') + serializePoint(point) !==
            latLons[i]?.transport +
              serializePoint(latLons[i] as unknown as RoutePoint),
        ) ||
        (mode === 'route' ? undefined : mode) !== query['route-mode'] ||
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

        dispatch(
          routePlannerSetParams({
            points: latLons as unknown as RoutePoint[],
            finishOnly: nextFinishOnly,
            transportType: TransportTypeCompatSchema.parse(query['transport']),
            mode:
              routeMode === 'trip' ||
              routeMode === 'roundtrip' ||
              routeMode === 'isochrone'
                ? routeMode
                : 'route',
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
            hash: String(query['route-params-hash']),
          }),
        );
      }
    } else if (getState().routePlanner.points.length) {
      dispatch(
        routePlannerSetParams({
          points: [],
          finishOnly: false,
          transportType: getState().routePlanner.transportType,
          milestones: reqMilestones,
        }),
      );
    }
  }

  const lang = query['lang'];

  if (isLanguage(lang)) {
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
      // biome-ignore lint/suspicious/noControlCharactersInRegex: I am aware of this
      const m = /([^;\x1e]*)([;\x1e].*)?/.exec(value);

      if (!m) {
        continue;
      }

      const points = m[1]!
        .split(',')
        .map((point) =>
          point
            .split('/')
            .map((coord) => parseFloat(coord))
            .filter((x) => !isNaN(x)),
        )
        .filter((pair): pair is [number, number] => pair.length === 2)
        .map(([lat, lon], id) => ({ lat, lon, id }));

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

  const gpxUrl = query['gpx-url'] || query['load']; /* backward compatibility */

  if (typeof gpxUrl === 'string' && gpxUrl !== getState().trackViewer.gpxUrl) {
    dispatch(trackViewerGpxLoad(gpxUrl));
  }

  const focus = !parsedQuery['map'];

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

  const mapStateFromUrl = getMapStateFromUrl();

  const customLayerDefsStr = query['custom-layers'];

  const { customLayers } = getState().map;

  if (
    typeof customLayerDefsStr === 'string' &&
    JSON.stringify(getState().map.customLayers) !== customLayerDefsStr
  ) {
    const existingCustomLayersDefStrings = getState().map.customLayers.map(
      (cl) => JSON.stringify(cl),
    );

    try {
      const customLayerDefs = CustomLayerDefArrayCompatSchema.parse(
        JSON.parse(customLayerDefsStr),
      );

      (mapStateFromUrl.layers ??= []).push(
        ...customLayerDefs.map((def) => def.type),
      );

      const newCustomLayerDefs = customLayerDefs.filter(
        (cl) => !existingCustomLayersDefStrings.includes(JSON.stringify(cl)),
      );

      if (newCustomLayerDefs.length) {
        // for (const cm of newCustomLayerDefs) {
        //   if ('tileSize' in cm && cm.tileSize) {
        //     cm.scaleWithDpi = true;
        //   }
        // }

        dispatch(mapSetCustomLayers([...customLayers, ...newCustomLayerDefs]));
      }
    } catch {
      // ignore
    }
  }

  const diff = getMapStateDiffFromUrl(mapStateFromUrl, getState().map);

  if (diff && Object.keys(diff).length) {
    dispatch(mapRefocus(diff));
  }

  const { shading } = query;

  const map = getState().map;

  if (
    shading &&
    !Array.isArray(shading) &&
    map.layers.some(
      (layer) =>
        integratedLayerDefMap[layer]?.technology === 'parametricShading',
    ) &&
    shading !== serializeShading(map.shading)
  ) {
    function toColor(color = '00000000') {
      try {
        const bands = Color('#' + color).array();

        if (bands.length === 3) {
          bands.push(1);
        }

        return bands as ColorType;
      } catch {
        console.error('error parsing color: ' + color);

        return [0, 0, 0, 1] as ColorType;
      }
    }

    const [bg, ...comps] = shading.split('!');

    const components: ShadingComponent[] = comps
      .map((component) => {
        const [type, ...params] = component.split('_');

        let colorStops: ColorStop[];

        switch (type) {
          case 'hillshade-classic':
          case 'hillshade-igor':
          case 'slope-classic':
          case 'slope-igor':
            colorStops = [
              {
                value: 0,
                color: toColor(params.pop()),
              },
            ];

            break;
          case 'aspect':
          case 'color-relief':
            colorStops = [];

            for (let i = 0; i < params.length; i += 2) {
              colorStops.push({
                value: Number(params[i]),
                color: toColor(params[i + 1]),
              });
            }
            break;
          default:
            return undefined;
        }

        const base = {
          id: Math.random(),
          brightness: 0,
          contrast: 1,
          colorStops,
        };

        switch (type) {
          case 'hillshade-classic':
            return {
              ...base,
              type,
              azimuth: Number(params.shift()) * (Math.PI / 180),
              elevation: Number(params.shift()) * (Math.PI / 180),
              exaggeration: Number(params.shift()),
            };
          case 'hillshade-igor':
            return {
              ...base,
              type,
              azimuth: Number(params.shift()) * (Math.PI / 180),
              exaggeration: Number(params.shift()),
            };
          case 'slope-classic':
            return {
              ...base,
              type,
              elevation: Number(params.shift()) * (Math.PI / 180),
              exaggeration: Number(params.shift()),
            };
          case 'slope-igor':
            return {
              ...base,
              type,
              exaggeration: Number(params.shift()),
            };
          case 'aspect':
          case 'color-relief':
            return {
              ...base,
              type,
            };
          default:
            return undefined;
        }
      })
      .filter((a): a is ShadingComponent => Boolean(a));

    dispatch(
      mapSetShading({
        backgroundColor: toColor(bg),
        components,
      }),
    );
  }

  {
    // Unified modal/overlay param. Legacy `document=`/`tip=<key>` links fold
    // into the packed `show=document/<key>` form.
    const showRaw =
      typeof query['show'] === 'string'
        ? query['show']
        : typeof query['document'] === 'string'
          ? `document/${query['document']}`
          : typeof query['tip'] === 'string'
            ? `document/${query['tip']}`
            : undefined;

    const nextModal = showRaw === undefined ? null : decodeShow(showRaw);

    if (
      encodeActiveModal(getState().main.activeModal) !==
      encodeActiveModal(nextModal)
    ) {
      dispatch(setActiveModal(nextModal));
    }
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

    const [id = '', ...parts] = tracking.split('/');

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

      const [, type = '', value = ''] = m;

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

  setUrlUpdatingEnabled(true);
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

  a = query['gallery-premium'];

  const qPremium = typeof a !== 'string' ? undefined : a === 'true';

  if (
    qUserId ||
    qGalleryTag != null ||
    qRatingFrom ||
    qRatingTo ||
    qTakenAtFrom ||
    qTakenAtTo ||
    qCreatedAtFrom ||
    qCreatedAtTo ||
    qPano !== undefined ||
    qPremium !== undefined
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

    if (qPremium !== filter.premium) {
      newFilter.premium = qPremium;
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

  if (typeof query['wmc'] === 'string') {
    const pageId = Number(query['wmc']);

    const wmcState = getState().wikimediaCommons;

    if (
      Number.isFinite(pageId) &&
      wmcState.preview?.pageId !== pageId &&
      wmcState.loading !== pageId
    ) {
      dispatch(wikimediaCommonsLoadPreview(pageId));
    }
  } else if (
    getState().wikimediaCommons.preview ||
    getState().wikimediaCommons.loading
  ) {
    dispatch(wikimediaCommonsSetPreview(null));
  }

  const cb = GalleryColorizeBySchema.safeParse(query['gallery-cb']);

  if (cb.success) {
    dispatch(galleryColorizeBy(cb.data));
  }
}

function parseColorAndLabel(m: string) {
  let label: string | undefined;

  let color: string | undefined;

  let fillColor: string | undefined;

  let width: number | undefined;

  let dashArray: number[] | undefined;

  let lineCap: LineCap | undefined;

  let lineJoin: LineJoin | undefined;

  let markerType: 'pin' | 'square' | 'ring' | undefined;

  let icon: string | undefined;

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
      } else if (field[0] === 'F') {
        fillColor = field.slice(1);
      } else if (field[0] === 'W') {
        width = Number(field.slice(1)) || undefined;
      } else if (field[0] === 'D') {
        dashArray = field.slice(1)
          ? field.slice(1).split(',').map(Number)
          : undefined;
      } else if (field[0] === 'K') {
        lineCap =
          field[1] === 'b' ? 'butt' : field[1] === 's' ? 'square' : undefined;
      } else if (field[0] === 'J') {
        lineJoin =
          field[1] === 'm' ? 'miter' : field[1] === 'b' ? 'bevel' : undefined;
      } else if (field[0] === 'S') {
        markerType =
          field[1] === 's' ? 'square' : field[1] === 'r' ? 'ring' : undefined;
      } else if (field[0] === 'I') {
        icon = field.slice(1) || undefined;
      }
    }
  }

  return {
    label,
    color,
    fillColor,
    width,
    dashArray,
    lineCap,
    lineJoin,
    markerType,
    icon,
  };
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
      const m = ipMatch!;

      const { label, color, markerType, icon } = parseColorAndLabel(m[3] ?? '');

      return {
        coords: {
          lat: parseFloat(m[1]!),
          lon: parseFloat(m[2]!),
        },
        label,
        color,
        markerType,
        icon,
      };
    });

  // backward compatibility
  const ipl = query['info-point-label'];

  if (ipl && ips.length) {
    ips[0]!.label = typeof ipl === 'string' ? decodeURIComponent(ipl) : '';
  }

  // compare
  if (
    ips
      .map(
        ({ coords, label, color, markerType, icon }) =>
          `${serializePoint(coords)},${label},${color},${markerType},${icon}`,
      )
      .sort()
      .join('\n') !==
    getState()
      .drawingPoints.points.map(
        ({ coords, label, color, markerType, icon }) =>
          `${serializePoint(coords)},${label},${color},${markerType},${icon}`,
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
  return `${line.type}:${line.color ?? ''}:${line.fillColor ?? ''}:${line.points
    .map((point) => serializePoint(point))
    .join(',')}`;
}

function serializePoint(point: LatLon | null | undefined): string {
  return point && typeof point.lat === 'number' && typeof point.lon === 'number'
    ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}`
    : '';
}

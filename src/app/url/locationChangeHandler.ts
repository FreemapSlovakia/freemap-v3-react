import {
  type ChangesetParams,
  changesetsSet,
  changesetsSetParams,
} from '@features/changesets/model/actions.js';
import {
  type ColorizingMode,
  dataViewerColorizeTrackBy,
  dataViewerDownloadTrack,
  dataViewerGpxLoad,
  dataViewerRestoreStored,
  dataViewerSetStyle,
} from '@features/dataViewer/model/actions.js';
import {
  drawingLineSetLines,
  type Line,
  type LineCap,
  type LineJoin,
  toWireHoleIndexes,
} from '@features/drawing/model/actions/drawingLineActions.js';
import {
  type DrawingProps,
  drawingPointSetAll,
  normalizeProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import type { ElevationChartTarget } from '@features/elevationChart/model/target.js';
import { targetsEqual } from '@features/elevationChart/model/target.js';
import {
  GALLERY_SOURCES,
  type GallerySource,
} from '@features/gallery/galleryUtils.js';
import {
  type GalleryLicense,
  GalleryLicenseSchema,
} from '@features/gallery/licenses.js';
import {
  GalleryColorizeBySchema,
  type GalleryFilter,
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
import {
  type MapRestore,
  mapsRestore,
} from '@features/myMaps/model/actions.js';
import {
  objectsSetFilter,
  objectsSetStyle,
} from '@features/objects/model/actions.js';
import { osmLoad } from '@features/osm/model/osmActions.js';
import {
  panoramaClear,
  panoramaPick,
  panoramaSetAzimuth,
  panoramaSetSettings,
} from '@features/panorama/model/actions.js';
import {
  parsePanoramaTilt,
  parsePanoramaViewpoint,
  serializePanoramaTilt,
  serializePanoramaViewpoint,
} from '@features/panorama/panoramaUrl.js';
import {
  type ColorStop,
  type Color as ColorType,
  type ShadingComponent,
  serializeShading,
} from '@features/parameterizedShading/model/Shading.js';
import { isPremium } from '@features/premium/premium.js';
import {
  type RoutePoint,
  routePlannerSetParams,
} from '@features/routePlanner/model/actions.js';
import {
  searchKeepResult,
  searchSetQuery,
  searchSetResultStyle,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { toposcopeSet } from '@features/toposcope/model/actions.js';
import {
  parseToposcope,
  serializeToposcope,
} from '@features/toposcope/toposcopeUrl.js';
import { trackingActions } from '@features/tracking/model/actions.js';
import type { TrackedDevice } from '@features/tracking/model/types.js';
import { VIEWSHED_LAYER } from '@features/viewshed/api.js';
import {
  viewshedClear,
  viewshedPick,
  viewshedSetSettings,
} from '@features/viewshed/model/actions.js';
import { grantedRadiusKm } from '@features/viewshed/request.js';
import {
  parseViewshed,
  sameViewpoint,
} from '@features/viewshed/viewshedUrl.js';
import {
  wikiLoadPreview,
  wikiSetPreview,
} from '@features/wiki/model/actions.js';
import { wikiPreviewKey } from '@features/wiki/model/wikiPreviewKey.js';
import { isLanguage } from '@shared/langUtils.js';
import {
  CustomLayerDefArrayCompatSchema,
  integratedLayerDefMap,
} from '@shared/mapDefinitions.js';
import {
  isMapClickTool,
  isToolAvailable,
  unavailableToolsSelector,
} from '@shared/toolDefinitions.js';
import {
  type TransportType,
  TransportTypeCompatSchema,
  TransportTypeSchema,
} from '@shared/transportTypeDefs.js';
import type { LatLon } from '@shared/types/common.js';
import {
  featureIdsEqual,
  type OsmFeatureId,
  osmElementTypes,
} from '@shared/types/featureId.js';
import {
  serializeDrawingLine,
  serializeDrawingPoint,
} from '@shared/urlSerialization.js';
import Color from 'color';
import type { Dispatch } from 'redux';
import {
  closeTool,
  openTool,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  type Tool,
  ToolSchema,
} from '../store/actions.js';
import { decodeActiveModal, encodeActiveModal } from '../store/activeModal.js';
import type { RootAction } from '../store/rootAction.js';
import { isToolOpen, openToolsSelector } from '../store/selectors.js';
import type { MyStore, RootState } from '../store/store.js';
import { holdChartRequest, takeChartRequest } from './pendingChartRequest.js';
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

  const { sq, tr } = (history.state as {
    sq?: string;
    tr?: true;
  } | null) ?? { sq: undefined, tr: undefined };

  const parsedQuery = parseQuery(search);

  const id =
    (typeof parsedQuery['id'] === 'string' ? parsedQuery['id'] : undefined) ||
    undefined;

  // Set when the URL names a map, and dispatched at the end — once any
  // `track-uid=` / `import-url=` is known, so the restore owns the track instead
  // of racing a fetch started here. Whether the map continues from the browser's
  // working copy or is re-read from the backend is decided there.
  let restore: MapRestore | null = null;

  if (
    id !== undefined &&
    id !==
      (getState().myMaps.loadMeta?.id ??
        getState().myMaps.restoring?.mapId ??
        getState().myMaps.activeMap?.id)
  ) {
    restore = {
      mapId: id,
      ignoreMap: 'map' in parsedQuery,
      ignoreLayers: 'layers' in parsedQuery,
      // A fresh tab or a shared link has no entry of its own, so nothing of this
      // map's content was restored above.
      hasRestoredContent: sq !== undefined,
    };
  }

  const query =
    id === undefined
      ? parsedQuery
      : { ...parsedQuery, ...parseQuery(sq ?? '') };

  // Map legacy URL tool tokens to their current ids so older shared/bookmarked
  // links keep working.
  const toolAliases: Record<string, Tool> = {
    'info-point': 'draw-points',
    'measure-area': 'draw-polygons',
    'measure-dist': 'draw-lines',
    'track-viewer': 'import-file',
  };

  const unavailable = unavailableToolsSelector(getState());

  // `tools=` is the comma-separated list of open tools; `tool=` is the older
  // single-tool spelling, read the same way.
  const toolParam = query['tools'] ?? query['tool'];

  const tools =
    typeof toolParam !== 'string' || !toolParam
      ? []
      : toolParam
          .split(',')
          .map((t) => toolAliases[t] ?? ToolSchema.safeParse(t).data)
          .filter((t): t is Tool => Boolean(t))
          // A tool this device or account can't offer brings no toolbar, so once
          // opened nothing could close it again — and it would be written back
          // into every URL from then on. (`Main` re-checks the gate anyway, for
          // a tool that becomes unavailable while it is open.)
          .filter((t) => isToolAvailable(unavailable, t))
          // Only one tool can own map clicks, so a link naming several opens the
          // first of them and drops the rest.
          .filter(
            (t, i, all) =>
              !isMapClickTool(t) || all.findIndex(isMapClickTool) === i,
          );

  const openTools = openToolsSelector(getState());

  for (const t of openTools) {
    if (!tools.includes(t)) {
      dispatch(closeTool(t));
    }
  }

  for (const t of tools) {
    if (!openTools.includes(t)) {
      dispatch(openTool(t));
    }
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
              point = `manual/${point.slice(1)}`;
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
            deferRouting: restore !== null,
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
    if (restore) {
      restore.trackUID = trackUID;
    } else {
      dispatch(dataViewerDownloadTrack(trackUID));
    }
  }

  const colorizeTrackBy = query['track-colorize-by'];

  if (typeof colorizeTrackBy === 'string') {
    if (getState().trackViewerSettings.colorizeTrackBy !== colorizeTrackBy) {
      dispatch(dataViewerColorizeTrackBy(colorizeTrackBy as ColorizingMode));
    }
  } else if (getState().trackViewerSettings.colorizeTrackBy) {
    dispatch(dataViewerColorizeTrackBy(null));
  }

  handleInfoPoint(getState, dispatch, query);

  handleFeatureStyles(getState, dispatch, query);

  handleToposcope(getState, dispatch, query);

  handlePanorama(getState, dispatch, query);

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
      // `s` so the style fields survive a label written on several lines: a
      // bare `.` stops at a newline and would drop every field after it.
      // biome-ignore lint/suspicious/noControlCharactersInRegex: I am aware of this
      const m = /([^;\x1e]*)([;\x1e][\s\S]*)?/.exec(value);

      if (!m) {
        continue;
      }

      const points = m[1]!
        .split(',')
        .map((point) =>
          point
            .split('/')
            .map((coord) => parseFloat(coord))
            .filter((x) => !Number.isNaN(x)),
        )
        .filter((pair): pair is [number, number] => pair.length === 2)
        .map(([lat, lon], id) => ({ lat, lon, id }));

      if (points.length > 0) {
        // `H` is geometry-only (the index of the polygon this ring is a hole
        // of), so it stays out of the style-field codec the point params share.
        // biome-ignore lint/suspicious/noControlCharactersInRegex: the field separator
        const holeOf = /\x1eH(\d+)/.exec(m[2] ?? '');

        lines.push({
          type:
            key === 'distance-measurement-points' || key === 'line'
              ? 'line'
              : 'polygon',
          points,
          ...parseColorAndLabel(m[2] ?? ''),
          holeOf: holeOf ? Number(holeOf[1]) : undefined,
        });
      }
    }
  }

  const stateLines = getState().drawingLines.lines;

  const stateHoleIndexes = toWireHoleIndexes(stateLines);

  // The type prefixes the digest because it is the URL's parameter *name*
  // (`line=` / `polygon=`) rather than one of the fields the serializer writes,
  // so without it a polygon and a line of the same shape read alike and a
  // history entry that only changed the type never arrives.
  const digestLine = (line: Line, holeOf: number | undefined) =>
    `${line.type}${serializeDrawingLine(line, holeOf)}`;

  if (
    lines.map((line) => digestLine(line, line.holeOf)).join('\x1d') !==
    stateLines
      .map((line, i) => digestLine(line, stateHoleIndexes[i]))
      .join('\x1d')
  ) {
    dispatch(drawingLineSetLines(lines));
  }

  const gpxUrl =
    query['import-url'] ||
    query['gpx-url'] ||
    query['load']; /* `gpx-url` and `load` kept for backward compatibility */

  if (typeof gpxUrl === 'string' && gpxUrl !== getState().trackViewer.gpxUrl) {
    if (restore) {
      restore.gpxUrl = gpxUrl;
    } else {
      dispatch(dataViewerGpxLoad(gpxUrl));
    }
  }

  const focus = !parsedQuery['map'];

  handleOsmElements(getState, dispatch, query, focus);

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

      mapStateFromUrl.layers ??= [];

      mapStateFromUrl.layers.push(...customLayerDefs.map((def) => def.type));

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

  // After the layers the URL names are on: until here `map.layers` still holds
  // whatever was stored from last time, and the viewshed gates on it.
  handleViewshed(getState, dispatch, query);

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
        const bands = Color(`#${color}`).array();

        if (bands.length === 3) {
          bands.push(1);
        }

        return bands as ColorType;
      } catch {
        console.error(`error parsing color: ${color}`);

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
    // Unified modal/overlay param. Legacy `document=`/`tip=`/`image=`/`wmc=`
    // links fold into the packed `show=type/arg` form.
    const showRaw =
      typeof query['show'] === 'string'
        ? query['show']
        : typeof query['document'] === 'string'
          ? `document/${query['document']}`
          : typeof query['tip'] === 'string'
            ? `document/${query['tip']}`
            : typeof query['image'] === 'string'
              ? `gallery-viewer/${query['image']}`
              : typeof query['wmc'] === 'string'
                ? `wmc/${query['wmc']}`
                : undefined;

    const next = showRaw === undefined ? null : decodeActiveModal(showRaw);

    // The gallery viewer and the Wikimedia Commons preview own their own slice
    // state; everything else lives in main.activeModal.
    if (next?.type === 'gallery-viewer') {
      if (getState().gallery.activeImageId !== next.id) {
        dispatch(galleryRequestImage(next.id));
      }
    } else if (getState().gallery.activeImageId) {
      dispatch(galleryClear());
    }

    if (next?.type === 'wiki') {
      const w = getState().wiki;

      const current =
        w.loading ?? (w.preview ? wikiPreviewKey(w.preview) : null);

      if (current !== next.key) {
        dispatch(wikiLoadPreview(next.key));
      }
    } else if (getState().wiki.preview || getState().wiki.loading) {
      dispatch(wikiSetPreview(null));
    }

    const mainNext =
      next?.type === 'gallery-viewer' || next?.type === 'wiki' ? null : next;

    if (
      encodeActiveModal(getState().main.activeModal) !==
      encodeActiveModal(mainNext)
    ) {
      dispatch(setActiveModal(mainNext));
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
          fromTime = parseDate(value) ?? null;

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
    const follow = /^\d+$/.test(fq) ? Number.parseInt(fq, 10) : fq;

    const { selection } = getState().main;

    if (
      (selection?.type === 'tracking' ? selection?.id : undefined) !== follow
    ) {
      dispatch(selectFeature({ type: 'tracking', id: follow }));
    }
  }

  handleElevationChart(getState, dispatch, query, restore !== null);

  if (restore) {
    dispatch(mapsRestore(restore));
  }

  // The track this browser stored for this history entry. Dispatched last, and a
  // no-op when something else already owns the track viewer, so a map or a shared
  // track named in the URL wins.
  //
  // A load carrying no flag deliberately does *not* evict the store. The record is
  // one per origin while the flag is one per history entry, so a second tab — a
  // fresh load with no flag of its own — would delete the only durable copy of a
  // ride the first tab is still holding. Hygiene is left to the store being a
  // single entry that its own delete and the next write reclaim.
  if (tr) {
    dispatch(dataViewerRestoreStored());
  }

  setUrlUpdatingEnabled(true);
}

/**
 * Re-applies a deferred `elevation-chart=` once the feature it names is in the
 * store — a drawn line is named by position and has no id until then. A no-op
 * when nothing is held, and the hold expires per `takeChartRequest`.
 */
export function applyElevationChartFromUrl(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
) {
  const { loadMeta, restoring } = getState().myMaps;

  const target = takeChartRequest(
    (raw) => parseChartTarget(getState, raw),
    Boolean(loadMeta || restoring),
  );

  if (target && !targetsEqual(getState().elevationChart.target, target)) {
    dispatch(elevationChartOpen(target, { fromUrl: true }));
  }
}

/** The target an `elevation-chart=` value names, if it can be resolved now. */
function parseChartTarget(
  getState: () => RootState,
  raw: string,
): ElevationChartTarget | null {
  const slash = raw.indexOf('/');

  const type = slash < 0 ? raw : raw.slice(0, slash);

  // A token may itself contain a slash, so the key is everything after the
  // first one.
  const key = slash < 0 ? undefined : raw.slice(slash + 1);

  switch (type) {
    case 'route-planner':
    case 'track-viewer':
    case 'gps-recorder':
      return { type };

    case 'tracking':
      return key ? { type: 'tracking', token: key } : null;

    case 'drawing': {
      const line = getState().drawingLines.lines[Number(key ?? Number.NaN)];

      return line ? { type: 'drawing', lineId: line.id } : null;
    }

    default:
      return null;
  }
}

/**
 * `elevation-chart=` — which feature's profile is shown, if any: a drawn line
 * names its position (`drawing/2`), a tracked device its token. Whether a
 * target that doesn't resolve yet is worth waiting for is the resolver's call,
 * not this one's; `mapPending` only says whether a map is still to arrive with
 * content this could name.
 */
function handleElevationChart(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
  query: Record<string, string | string[]>,
  mapPending = false,
) {
  const raw = query['elevation-chart'];

  const target =
    typeof raw === 'string' ? parseChartTarget(getState, raw) : null;

  holdChartRequest(
    target === null && typeof raw === 'string' ? raw : null,
    mapPending,
  );

  if (!targetsEqual(getState().elevationChart.target, target)) {
    dispatch(
      target
        ? elevationChartOpen(target, { fromUrl: true })
        : elevationChartClose(),
    );
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

/**
 * Brings the shown OSM elements in line with the `osm-node` / `osm-way` /
 * `osm-relation` params, each of which can appear any number of times.
 *
 * The URL is what a map holds after it is closed, so what it names is kept
 * rather than previewed, and the first of them is selected — a link to an
 * element is a link to looking at it. A previewed result is named by nothing
 * here, so a location change takes it off, which is what leaving the page it
 * was picked on means.
 *
 * A load that is already in flight has its element among the shown results
 * (as a placeholder), so it isn't started again by a second location change
 * arriving before it lands. Shown results the URL can't name — a WMS or a
 * plain-coordinates one — are left alone: they are no more contradicted by
 * these params than they are described by them.
 */
function handleOsmElements(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
  query: Record<string, string | string[]>,
  focus: boolean,
) {
  const wanted = osmElementTypes.flatMap((elementType) => {
    const param = query[`osm-${elementType}`];

    return (param === undefined ? [] : Array.isArray(param) ? param : [param])
      .map((value) => parseInt(value, 10))
      .filter((id) => id > 0)
      .map((id): OsmFeatureId => ({ type: 'osm', elementType, id }));
  });

  const shown = getState()
    .search.selectedResults.map(({ id }) => id)
    .filter((id): id is OsmFeatureId => id.type === 'osm' && id.id > 0);

  for (const id of shown) {
    if (!wanted.some((w) => featureIdsEqual(w, id))) {
      dispatch(searchUnselectResult(id));
    }
  }

  // In one go, so a link naming many elements is one Overpass query rather
  // than a query per element.
  const toLoad = wanted.filter(
    (id) => !shown.some((s) => featureIdsEqual(s, id)),
  );

  if (toLoad.length > 0) {
    dispatch(osmLoad({ ids: toLoad, focus, pin: true }));
  }

  // An element the URL names that is currently the previewed one is neither
  // loaded (it is already shown) nor taken off (it is wanted), so it is
  // promoted here: the URL carries kept results, and one left transient would
  // be dropped from the very entry it was just restored from.
  const { previewId } = getState().search;

  if (previewId && wanted.some((w) => featureIdsEqual(w, previewId))) {
    dispatch(searchKeepResult(previewId));
  }

  const [first] = wanted;

  if (first && getState().main.selection === null) {
    dispatch(selectFeature({ type: 'search', id: first }));
  }
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

  const qTakenAtFrom = parseDate(a);

  a = query['gallery-taken-at-to'];

  const qTakenAtTo = parseDate(a);

  a = query['gallery-created-at-from'];

  const qCreatedAtFrom = parseDate(a);

  a = query['gallery-created-at-to'];

  const qCreatedAtTo = parseDate(a);

  a = query['gallery-pano'];

  const qPano = typeof a !== 'string' ? undefined : a === 'true';

  a = query['gallery-premium'];

  const qPremium = typeof a !== 'string' ? undefined : a === 'true';

  a = query['gallery-license'];

  const qLicenseAll = (
    a === undefined ? [] : Array.isArray(a) ? a : [a]
  ).filter(
    (x): x is GalleryLicense => GalleryLicenseSchema.safeParse(x).success,
  );

  const qLicense = qLicenseAll.length > 0 ? qLicenseAll : undefined;

  a = query['gallery-source'];

  const qSourcesAll = (
    a === undefined ? [] : Array.isArray(a) ? a : [a]
  ).filter((x): x is GallerySource =>
    (GALLERY_SOURCES as string[]).includes(x),
  );

  const qSources =
    qSourcesAll.length > 0 && qSourcesAll.length < GALLERY_SOURCES.length
      ? qSourcesAll
      : undefined;

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
    qPremium !== undefined ||
    qLicense ||
    qSources
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

    if (qLicense && (filter.license ?? []).join(',') !== qLicense.join(',')) {
      newFilter.license = qLicense;
    }

    if (qSources && (filter.sources ?? []).join(',') !== qSources.join(',')) {
      newFilter.sources = qSources;
    }

    if (Object.keys(newFilter).length !== 0) {
      dispatch(gallerySetFilter({ ...filter, ...newFilter }));
    }
  }

  const cb = GalleryColorizeBySchema.safeParse(query['gallery-cb']);

  if (cb.success) {
    dispatch(galleryColorizeBy(cb.data));
  }
}

function parseColorAndLabel(m: string): ReturnType<typeof parseStyleFields> {
  // compatibility
  if (m.startsWith(',') || m.startsWith(';')) {
    return m[1] === '#'
      ? { color: m.slice(1, 8), label: m.slice(9) }
      : { label: m.replace(/^[,;]*/, '') };
  }

  if (m.startsWith('\x1e')) {
    return parseStyleFields(m);
  }

  return {};
}

/**
 * Parses the `\x1e`-separated style field string shared by the drawing
 * geometry params and the per-feature default-style params (`track-style`,
 * `objects-style`, `search-style`). Field codes: `L`abel, `C`olor,
 * `F`illColor, `W`idth, `D`ashArray, line`K`ap, line`J`oin, `S`hape
 * (markerType), `I`con, `P`roperties. A leading separator is tolerated. Only
 * present fields are returned.
 */
export function parseStyleFields(s: string): {
  label?: string;
  color?: string;
  fillColor?: string;
  width?: number;
  dashArray?: number[];
  lineCap?: LineCap;
  lineJoin?: LineJoin;
  markerType?: 'pin' | 'square' | 'ring';
  icon?: string;
  props?: DrawingProps;
} {
  const out: ReturnType<typeof parseStyleFields> = {};

  for (const field of s.split('\x1e')) {
    if (!field) {
      continue;
    }

    if (field[0] === 'L') {
      out.label = field.slice(1);
    } else if (field[0] === 'C') {
      out.color = field.slice(1);
    } else if (field[0] === 'F') {
      out.fillColor = field.slice(1);
    } else if (field[0] === 'W') {
      out.width = Number(field.slice(1)) || undefined;
    } else if (field[0] === 'D') {
      out.dashArray = field.slice(1)
        ? field.slice(1).split(',').map(Number)
        : undefined;
    } else if (field[0] === 'K') {
      out.lineCap =
        field[1] === 'b' ? 'butt' : field[1] === 's' ? 'square' : undefined;
    } else if (field[0] === 'J') {
      out.lineJoin =
        field[1] === 'm' ? 'miter' : field[1] === 'b' ? 'bevel' : undefined;
    } else if (field[0] === 'S') {
      out.markerType =
        field[1] === 's' ? 'square' : field[1] === 'r' ? 'ring' : undefined;
    } else if (field[0] === 'I') {
      out.icon = field.slice(1) || undefined;
    } else if (field[0] === 'P') {
      // Key/value pairs, unit-separated. A trailing key with no value is
      // dropped rather than read as empty, so a truncated link can't invent a
      // property nobody wrote.
      const parts = field.slice(1).split('\x1f');

      const props: DrawingProps = {};

      for (let i = 0; i + 1 < parts.length; i += 2) {
        props[parts[i]!] = parts[i + 1]!;
      }

      out.props = normalizeProps(props);
    }
  }

  return out;
}

/**
 * Read-only, load-time style overrides (useful for map embedding). Each param
 * value is a `\x1e`-separated style field string (same codec as the drawing
 * geometry params; see {@link parseStyleFields}). Not written back to the URL.
 *
 * - `track-style` — default style for unstyled imported track-viewer features
 * - `objects-style` — POI marker color (`C`) and shape (`S`)
 * - `search-style` — search / map-details result `C`olor, `F`illColor, `W`idth
 */
function handleFeatureStyles(
  getState: () => RootState,
  dispatch: Dispatch,
  query: Record<string, string | string[]>,
) {
  const trackStyle = query['track-style'];

  if (typeof trackStyle === 'string') {
    const f = parseStyleFields(trackStyle);

    const cur = getState().trackViewerSettings.style;

    const next = {
      color: f.color ?? cur.color,
      fillColor: f.fillColor ?? cur.fillColor,
      width: f.width ?? cur.width,
      dashArray: f.dashArray ?? cur.dashArray,
      lineCap: f.lineCap ?? cur.lineCap,
      lineJoin: f.lineJoin ?? cur.lineJoin,
      markerType: f.markerType ?? cur.markerType,
    };

    if (JSON.stringify(next) !== JSON.stringify(cur)) {
      dispatch(dataViewerSetStyle(next));
    }
  }

  const objectsStyle = query['objects-style'];

  if (typeof objectsStyle === 'string') {
    const f = parseStyleFields(objectsStyle);

    const cur = getState().objectsSettings;

    const next = {
      selectedIcon: f.markerType ?? cur.selectedIcon,
      color: f.color ?? cur.color,
    };

    if (next.selectedIcon !== cur.selectedIcon || next.color !== cur.color) {
      dispatch(objectsSetStyle(next));
    }
  }

  const searchStyle = query['search-style'];

  if (typeof searchStyle === 'string') {
    const f = parseStyleFields(searchStyle);

    const cur = getState().searchSettings.resultStyle;

    const next = {
      color: f.color ?? cur.color,
      fillColor: f.fillColor ?? cur.fillColor,
      width: f.width ?? cur.width,
      dashArray: f.dashArray ?? cur.dashArray,
      lineCap: f.lineCap ?? cur.lineCap,
      lineJoin: f.lineJoin ?? cur.lineJoin,
      markerType: f.markerType ?? cur.markerType,
    };

    if (JSON.stringify(next) !== JSON.stringify(cur)) {
      dispatch(searchSetResultStyle(next));
    }
  }
}

/**
 * The toposcope dial's own settings — a `\x1e`-separated field string; see
 * `serializeToposcope`. Its centre and rays are drawn points and arrive with
 * the `point=` params instead.
 */
function handleToposcope(
  getState: () => RootState,
  dispatch: Dispatch,
  query: Record<string, string | string[]>,
) {
  const param =
    typeof query['toposcope'] === 'string' ? query['toposcope'] : '';

  // Compared through the serializer that wrote it rather than field by field,
  // so a setting added later can't be left out of the comparison and quietly
  // stop arriving.
  if (param !== serializeToposcope(getState().toposcope)) {
    dispatch(toposcopeSet(parseToposcope(param)));
  }
}

/**
 * `panorama=` the viewpoint, `panorama-az=` the bearing, `panorama-tilt=` the
 * vertical band; see `panoramaUrl.ts` for the formats. The picture is not in
 * the link: arriving with a viewpoint renders it again, which is the same
 * explicit action a click on the map is.
 *
 * A link's tilt is applied whatever the standing preference — what the sender
 * framed is part of what they are showing.
 */
function handlePanorama(
  getState: () => RootState,
  dispatch: Dispatch,
  query: Record<string, string | string[]>,
) {
  const { viewpoint, azimuth } = getState().panorama;

  // Compared through the serializer that wrote it: a full coordinate rounded on
  // the way out would otherwise read back as a different place and pay for a
  // whole render on every step through the history.
  const next = parsePanoramaViewpoint(
    typeof query['panorama'] === 'string' ? query['panorama'] : '',
  );

  if (!next) {
    if (viewpoint) {
      dispatch(panoramaClear());
    }

    return;
  }

  // Without its panel there is nothing to render into, and a render is seconds
  // of somebody else's server.
  if (!isToolOpen(getState(), 'panorama')) {
    return;
  }

  const az = Number(query['panorama-az']);

  if (Number.isFinite(az) && az !== azimuth) {
    dispatch(panoramaSetAzimuth(az));
  }

  const tilt = parsePanoramaTilt(
    typeof query['panorama-tilt'] === 'string' ? query['panorama-tilt'] : '',
  );

  const settings = getState().panoramaSettings;

  if (
    tilt &&
    serializePanoramaTilt({ ...settings, ...tilt }) !==
      serializePanoramaTilt(settings)
  ) {
    dispatch(panoramaSetSettings(tilt));
  }

  if (
    !viewpoint ||
    serializePanoramaViewpoint(viewpoint) !== serializePanoramaViewpoint(next)
  ) {
    dispatch(panoramaPick(next));
  }
}

/**
 * `viewshed=lat,lon,radiusKm` — where one stands and how far it looks. The
 * overlay is not in the link: arriving with a viewpoint computes it again.
 */
function handleViewshed(
  getState: () => RootState,
  dispatch: Dispatch,
  query: Record<string, string | string[]>,
) {
  const { viewpoint } = getState().viewshed;

  // The layer being off keeps the viewpoint on purpose, and stops the URL
  // carrying the param — which must not read as "the viewshed went".
  if (!getState().map.layers.includes(VIEWSHED_LAYER)) {
    return;
  }

  const next = parseViewshed(
    typeof query['viewshed'] === 'string' ? query['viewshed'] : '',
  );

  if (!next) {
    if (viewpoint) {
      dispatch(viewshedClear());
    }

    return;
  }

  const state = getState();

  // Against what was granted, which is what the URL was written from: an account
  // looking at a clamped picture would otherwise read its own link back as a
  // change and store the clamped figure over the one it asked for. Before the
  // pick, so a link naming both is computed at the radius it names.
  if (
    next.radiusKm !== undefined &&
    next.radiusKm !==
      grantedRadiusKm(
        state.viewshedSettings.radiusKm,
        isPremium(state.auth.user),
      )
  ) {
    dispatch(viewshedSetSettings({ radiusKm: next.radiusKm }));
  }

  // Only the viewpoint pays for a render, as a click on the map does; a step
  // through the history that moved only the radius stages it and offers Update.
  if (!viewpoint || !sameViewpoint(viewpoint, next.viewpoint)) {
    dispatch(viewshedPick(next.viewpoint));
  }
}

/**
 * One `point=` value: `lat/lon` followed by optional style fields. Returns
 * `undefined` for anything that isn't a pair of coordinates.
 *
 * The tail is matched with `[\s\S]` rather than `.` because a label may be
 * written on several lines — a bare `.` stops at the newline, the match then
 * fails against the anchored end, and the point is dropped altogether.
 */
export function parseDrawingPointParam(value: string | undefined) {
  const m = value
    ? /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)([\s\S]*)$/.exec(value)
    : null;

  if (!m) {
    return undefined;
  }

  const { label, color, markerType, icon, props } = parseColorAndLabel(
    m[3] ?? '',
  );

  return {
    coords: { lat: parseFloat(m[1]!), lon: parseFloat(m[2]!) },
    label,
    color,
    markerType,
    icon,
    props,
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
    .map(parseDrawingPointParam)
    .filter((point) => point !== undefined);

  // backward compatibility
  const ipl = query['info-point-label'];

  if (ipl && ips.length) {
    ips[0]!.label = typeof ipl === 'string' ? decodeURIComponent(ipl) : '';
  }

  // Compared through the very serializer that wrote the URL, so the comparison
  // can't overlook a field the way a hand-rolled list of them did. Joined on a
  // separator no label can contain, so two different sets can't digest alike.
  if (
    ips.map(serializeDrawingPoint).sort().join('\x1d') !==
    getState()
      .drawingPoints.points.map(serializeDrawingPoint)
      .sort()
      .join('\x1d')
  ) {
    dispatch(drawingPointSetAll(ips));
  }

  if (typeof query['q'] === 'string') {
    dispatch(searchSetQuery({ query: query['q'], fromUrl: true }));
  }
}

/**
 * A date from the URL, or nothing if it isn't one.
 *
 * `new Date('xyz')` yields an Invalid Date, which is truthy and compares
 * unequal to everything — so unchecked it settles into the store and throws
 * from `toISOString()` the next time the state is serialized, which since the
 * unsaved-changes comparison happens during render means a blank screen.
 */
function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function serializePoint(point: LatLon | null | undefined): string {
  return point && typeof point.lat === 'number' && typeof point.lon === 'number'
    ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}`
    : '';
}

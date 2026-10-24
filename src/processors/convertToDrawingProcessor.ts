import { type ConvertCarry, convertToDrawing } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import { changesetCenter } from '@features/changesets/model/changesetDiff.js';
import { fromWire, type WireItem } from '@features/dataViewer/drawingWire.js';
import { dataViewerAddFeatures } from '@features/dataViewer/model/actions.js';
import { interpolateLabel } from '@features/drawing/interpolateLabel.js';
import { withProps } from '@features/drawing/labelValues.js';
import type {
  Line,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import {
  type DrawingPoint,
  type DrawingProps,
  normalizeProps,
  pickDrawingProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { loadObjectsMessages } from '@features/objects/translations/loadObjectsMessages.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
import type { OsmGeojson } from '@features/osm/model/osmGeojson.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import {
  ISOCHRONE_FILL_OPACITY,
  isochroneColor,
  isochroneLabel,
} from '@features/routePlanner/model/isochrones.js';
import {
  dominantStepMode,
  STEP_MODE_COLORS,
  stepModeDashArray,
  stopNumber,
  WAYPOINT_COLORS,
  WAYPOINT_ICONS,
  waypointKind,
} from '@features/routePlanner/model/routeColors.js';
import { alternativeCoordinates } from '@features/routePlanner/model/routeGeometry.js';
import { loadRoutePlannerMessages } from '@features/routePlanner/translations/loadRoutePlannerMessages.js';
import { searchUnselectResult } from '@features/search/model/actions.js';
import { hasGeometry } from '@features/search/model/resultUtils.js';
import { activeSearchResultSelector } from '@features/search/model/selectors.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { joinColorAlpha } from '@shared/colorAlpha.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import {
  convertibleProps,
  defaultLabel,
  ownTable,
} from '@shared/featureProperties.js';
import { flattenTracks } from '@shared/flattenTracks.js';
import { mergeLines } from '@shared/geoutils.js';
import { isAbortError } from '@shared/isAbortError.js';
import { askSimplification } from '@shared/simplifyDialog.js';
import {
  simplifyFeature,
  simplifyPositions,
  simplifyRing,
} from '@shared/simplifyGeo.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Feature, FeatureCollection, Position } from 'geojson';
import type { Dispatch } from 'redux';

/**
 * What a conversion draws, gathered so it lands as one addition — one history
 * entry, and the selection of what it made where that is one feature.
 */
class Batch {
  private items: WireItem[] = [];

  private lineCount = 0;

  point(point: DrawingPoint): void {
    this.items.push({ kind: 'point', point });
  }

  /** Lines whose `holeOf` indexes address the given lines themselves. */
  lines(lines: Line[]): void {
    const offset = this.lineCount;

    for (const line of lines) {
      this.items.push({
        kind: 'line',
        line:
          line.holeOf === undefined
            ? line
            : { ...line, holeOf: line.holeOf + offset },
      });
    }

    this.lineCount += lines.length;
  }

  /** Adds what was gathered; `select` picks the first of it. */
  flush(dispatch: Dispatch, select?: boolean): number {
    const features = fromWire(this.items);

    if (features.length) {
      dispatch(
        dataViewerAddFeatures({
          features,
          select: select ?? features.length === 1,
        }),
      );
    }

    return features.length;
  }
}

// Build drawing-line points from a single ring/line. `dropClosing` strips the
// duplicate closing coordinate of an explicitly-closed ring, since drawing
// polygons are stored open and closed at render time.
function ringToPoints(ring: Position[], dropClosing: boolean): Point[] {
  return (dropClosing ? ring.slice(0, -1) : ring).map((node, id) => ({
    lat: node[1],
    lon: node[0],
    id,
  }));
}

/**
 * The property table an imported feature brings. Our own exports write it whole
 * — GPX as `<fm:prop>`, GeoJSON as a `freemap:props` object — so every key
 * survives, not just the OSM tags `pickDrawingProps` carries. Anything else
 * states its data in the properties themselves.
 */
function importedProps(
  properties: Record<string, unknown> | null | undefined,
): DrawingProps | undefined {
  const own = ownTable(properties);

  return own ? normalizeProps(own) : pickDrawingProps(properties ?? undefined);
}

/**
 * The label a converted feature takes: the dialog's, else the one this feature
 * would have got — baked from its own properties where that was asked. A
 * computed key (`{location}`, `{length}`) is left for the drawing to answer.
 */
function carriedLabel(
  carry: ConvertCarry | undefined,
  all: DrawingProps,
  fallback: string | undefined,
): string | undefined {
  const template = carry ? (carry.label ?? fallback) : fallback;

  return (
    (carry?.resolveLabel && template
      ? interpolateLabel(template, withProps(all))
      : template) || undefined
  );
}

/** The ticked properties alone; unasked, what the conversion always carried. */
function carriedProps(
  carry: ConvertCarry | undefined,
  all: DrawingProps,
  fallback: DrawingProps | undefined,
): DrawingProps | undefined {
  if (!carry) {
    return fallback;
  }

  const props: DrawingProps = {};

  for (const key of carry.keys) {
    const value = all[key];

    if (value !== undefined) {
      props[key] = value;
    }
  }

  return normalizeProps(props);
}

function featuresToLines(
  features: Feature[],
  base: Partial<Line>,
  labelLinesToo: boolean,
  carry?: ConvertCarry,
): Line[] {
  const lines: Line[] = [];

  const polygonAt = new Map<string, number>();

  const holeRefs: { at: number; of: string }[] = [];

  for (const feature of features) {
    const { geometry } = feature;

    if (geometry?.type !== 'LineString' && geometry?.type !== 'Polygon') {
      continue;
    }

    const isGeoJsonPolygon = geometry.type === 'Polygon';

    const rings: Position[][] = isGeoJsonPolygon
      ? geometry.coordinates
      : [geometry.coordinates];

    const start = lines.length;

    // Once per feature: every ring of a polygon shares its table.
    const all = convertibleProps(feature.properties);

    const props = carriedProps(carry, all, importedProps(feature.properties));

    for (const [i, ring] of rings.entries()) {
      const closed =
        !isGeoJsonPolygon &&
        ring.length > 2 &&
        ring[0][0] === ring.at(-1)![0] &&
        ring[0][1] === ring.at(-1)![1];

      const style = lineStyleFromProperties(feature.properties, closed);

      const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

      lines.push({
        ...base,
        ...style,
        type: isPolygon ? 'polygon' : 'line',
        label: carriedLabel(carry, all, defaultLabel(feature, labelLinesToo)),
        props,
        points: ringToPoints(ring, isGeoJsonPolygon || (isPolygon && closed)),
        holeOf: isGeoJsonPolygon && i > 0 ? start : undefined,
      });
    }

    const polygonId = feature.properties?.['freemap:polygonId'];

    if (typeof polygonId === 'string' && !polygonAt.has(polygonId)) {
      polygonAt.set(polygonId, start);
    }

    const holeOf = feature.properties?.['freemap:holeOf'];

    if (typeof holeOf === 'string') {
      holeRefs.push({ at: start, of: holeOf });
    }
  }

  for (const { at, of } of holeRefs) {
    const parent = polygonAt.get(of);

    if (parent !== undefined && parent !== at) {
      lines[at] = { ...lines[at]!, holeOf: parent };
    }
  }

  return lines;
}

// Converts an arbitrary GeoJSON Feature/FeatureCollection into drawn points and
// lines/polygons, and adds them. Shared between the `search-result`,
// `objects-geometry` and `geojson` branches.
function geojsonToDrawing(
  geojson: Feature | FeatureCollection,
  getState: () => RootState,
  dispatch: Dispatch,
  tolerance = 0,
  carry?: ConvertCarry,
): void {
  const features = flattenTracks(geojson);

  mergeLines(features);

  if (tolerance) {
    for (const [i, feature] of features.entries()) {
      features[i] = simplifyFeature(feature, tolerance);
    }
  }

  const batch = new Batch();

  const { style: defaults } = getState().drawingSettings;

  for (const feature of features) {
    const { geometry } = feature;

    if (geometry?.type === 'Point') {
      // Explicit styling (freemap extensions / Garmin sym / simplestyle) wins
      // over OSM tag inference, then falls back to drawing settings.
      const style = pointStyleFromProperties(feature.properties);

      const all = convertibleProps(feature.properties);

      batch.point({
        ...defaults,
        ...style,
        label: carriedLabel(carry, all, defaultLabel(feature, false)),
        props: carriedProps(carry, all, importedProps(feature.properties)),
        coords: {
          lat: geometry.coordinates[1]!,
          lon: geometry.coordinates[0]!,
        },
        icon: style.icon ?? tagsToPoiIconSpec(feature.properties),
      });
    }
  }

  batch.lines(featuresToLines(features, defaults, false, carry));

  batch.flush(dispatch);
}

/**
 * Turns the route-planner result into drawing features, in the colors the map
 * gives it: the active alternative as one line (or, for an isochrone, one
 * polygon per ring, named after the limit it reaches), plus a point per
 * start/finish/stop. Needs the route-planner messages for the names, so it runs
 * asynchronously.
 */
async function convertPlannedRoute(
  getState: () => RootState,
  dispatch: Dispatch,
  tolerance: number,
): Promise<void> {
  const state = getState();

  const { language } = state.l10n;

  const {
    isochrones,
    alternatives,
    activeAlternativeIndex,
    points,
    waypoints,
    finishOnly,
    mode,
  } = state.routePlanner;

  const alternative = alternatives[activeAlternativeIndex];

  if (!isochrones?.length && !alternative) {
    return;
  }

  const rpm = await loadRoutePlannerMessages(language);

  // Keep the width and opacity the route had on the map, rather than falling
  // back to the (narrower, opaque) drawing defaults. Opacity rides on the
  // color's alpha, which is how a drawing feature carries it.
  const {
    lineWidth: width,
    lineOpacity,
    markerOpacity,
  } = state.routePlannerSettings;

  const batch = new Batch();

  let selectLine = false;

  if (isochrones?.length) {
    // A band is one polygon with its inner rings as holes, exactly as it draws
    // on the map.
    const lines: Line[] = [];

    for (const isochrone of isochrones) {
      const bucket = isochrone.properties?.['bucket'] ?? 0;

      const color = isochroneColor(bucket, isochrones.length);

      const start = lines.length;

      for (const [i, ring] of isochrone.geometry.coordinates.entries()) {
        lines.push({
          ...state.drawingSettings.style,
          type: 'polygon',
          label: isochroneLabel(isochrone, bucket, rpm.isochroneRing, language),
          color: joinColorAlpha(color, lineOpacity),
          width,
          // Only the outermost band is filled, as on the map; the inner ones
          // keep a transparent fill so their interior stays clickable.
          fillColor: joinColorAlpha(
            color,
            bucket === isochrones.length - 1
              ? ISOCHRONE_FILL_OPACITY * lineOpacity
              : 0,
          ),
          points: ringToPoints(simplifyRing(ring, tolerance), true),
          holeOf: i > 0 ? start : undefined,
        });
      }
    }

    batch.lines(lines);
  } else if (alternative) {
    const raw = alternativeCoordinates(alternative);

    const coords = simplifyPositions(raw, tolerance);

    const dominant = dominantStepMode(alternative);

    batch.lines([
      {
        ...state.drawingSettings.style,
        type: 'line',
        // A drawing line is one color and one dash pattern, so a multimodal
        // route takes those of the mode covering most of it. The dash is set
        // explicitly rather than left to the drawing defaults, which the user
        // may have made dashed.
        color: joinColorAlpha(STEP_MODE_COLORS[dominant], lineOpacity),
        dashArray: stepModeDashArray(dominant) ?? [],
        width,
        points: coords.map(([lon, lat], id) => ({ lat: lat!, lon: lon!, id })),
      },
    ]);

    selectLine = true;
  }

  for (const [i, pt] of points.entries()) {
    const kind = waypointKind(i, points.length, finishOnly, mode);

    const number = stopNumber(i, mode, waypoints);

    batch.point({
      ...state.drawingSettings.style,
      coords: { lat: pt.lat, lon: pt.lon },
      color: joinColorAlpha(WAYPOINT_COLORS[kind], markerOpacity),
      // The marker carries the same glyph the map gives it — a play/stop icon
      // for the ends, the visiting number for a stop. No `label`: that would
      // hang a permanent tooltip off every waypoint.
      icon:
        WAYPOINT_ICONS[kind] ??
        (number === undefined ? undefined : String(number)),
    });
  }

  // The route's line is gathered before its waypoints, so it comes first.
  batch.flush(dispatch, selectLine);

  dispatch(routePlannerDelete());
}

export const convertToDrawingProcessor: Processor<typeof convertToDrawing> = {
  actionCreator: convertToDrawing,
  id: 'convertToDrawing',
  transform: ({ getState, dispatch, action }) => {
    const { payload } = action;

    trackMatomo(['trackEvent', 'Drawing', 'convertToDrawing', payload.type]);

    const state = getState();

    if (payload.type === 'planned-route') {
      // Naming the waypoints needs the route-planner messages, so this path
      // runs in `handle` — leave the action alone for it.
      return action;
    } else if (payload.type === 'objects') {
      // `id` present → convert just that object as a point.
      // `id` absent  → bulk-convert every visible object (points only;
      //                full-geometry bulk would mean N OSM API fetches).
      const targets = payload.id
        ? state.objects.objects.filter((object) => object.id === payload.id)
        : state.objects.objects;

      if (targets.length === 0) {
        return;
      }

      const batch = new Batch();

      for (const object of targets) {
        const tags = object.tags ?? {};

        batch.point({
          ...state.drawingSettings.style,
          coords: object.coords,
          // The name is referenced rather than copied, so editing the property
          // below moves the drawn label with it.
          label: carriedLabel(
            payload.carry,
            tags,
            tags['name'] ? '{p:name}' : undefined,
          ),
          props: carriedProps(
            payload.carry,
            tags,
            pickDrawingProps(object.tags),
          ),
          color: state.drawingSettings.style.color,
          markerType: state.objectsSettings.selectedIcon,
          icon: tagsToPoiIconSpec(object.tags),
        });
      }

      if (!payload.id) {
        // Every visible object is a drawing now, so the predicate that fetched
        // them goes with them: left set, it would fetch them again on the next
        // pan and draw them over what they became. The tool goes too, through
        // `convertSourceTools` in the main reducer.
        dispatch(objectsSetFilter([]));
      }

      batch.flush(dispatch);
    } else if (payload.type === 'objects-geometry') {
      // Async fetch path — leave the action alone so `handle` picks it up.
      return action;
    } else if (payload.type === 'changesets') {
      const { changesets } = state.changesets;

      if (changesets.length === 0) {
        return;
      }

      const batch = new Batch();

      for (const changeset of changesets) {
        batch.point({
          ...state.drawingSettings.style,
          coords: changesetCenter(changeset),
          label: changeset.description,
          color: state.drawingSettings.style.color,
        });
      }

      dispatch(changesetsSet([]));

      batch.flush(dispatch);
    } else if (payload.type === 'search-result') {
      // The result acted upon becomes a drawing; the others stay results.
      const result = activeSearchResultSelector(state);

      if (!result || !hasGeometry(result)) {
        return;
      }

      // Unselected first, which would otherwise drop the drawing's selection.
      dispatch(searchUnselectResult(result.id));

      geojsonToDrawing(
        result.geojson,
        getState,
        dispatch,
        payload.tolerance,
        payload.carry,
      );
    } else if (payload.type === 'geojson') {
      geojsonToDrawing(payload.geojson, getState, dispatch);
    }

    // The conversion is done here, but the action still has to reach the
    // reducers: closing the tool it was reached for from is theirs to do
    // (`convertSourceTools` in the main reducer). A transform that answers
    // nothing drops the action instead.
    return action;
  },
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload.type === 'planned-route') {
      await convertPlannedRoute(getState, dispatch, action.payload.tolerance);

      return;
    }

    if (action.payload.type !== 'objects-geometry') {
      return;
    }

    const { id, carry } = action.payload;

    // The dialog that asked already fetched it and settled the tolerance on it.
    if (action.payload.geojson) {
      geojsonToDrawing(
        action.payload.geojson,
        getState,
        dispatch,
        action.payload.tolerance,
        carry,
      );

      return;
    }

    const report = (err: unknown) => {
      if (!isAbortError(err)) {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'fetchingError',
            messageParams: { err },
            messageLoader: loadObjectsMessages,
          }),
        );
      }
    };

    let geojson: OsmGeojson;

    try {
      geojson = await fetchOsmFullGeojson(id, getState);
    } catch (err) {
      report(err);

      return;
    }

    // Asked here rather than in the menu, which is the one conversion that
    // doesn't know its own geometry until it has been fetched — a relation can
    // be tens of thousands of nodes. Left unawaited so `handle` settles with the
    // fetch: the middleware runs the busy indicator until it does, and the
    // dialog waits on the user.
    void askSimplification({ lines: convertibleLines(geojson) })
      .then((tolerance) => {
        if (tolerance === null) {
          return;
        }

        geojsonToDrawing(geojson, getState, dispatch, tolerance, carry);
      })
      // Nothing awaits this any more, so the conversion has to report for
      // itself. Not as a fetch error: that is done by here, and naming it one
      // would send the user looking in the wrong place.
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.operationError',
            messageParams: { err },
          }),
        );
      });
  },
};

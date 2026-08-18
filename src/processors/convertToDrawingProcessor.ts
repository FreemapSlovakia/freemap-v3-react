import { convertToDrawing, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import { dataViewerDelete } from '@features/dataViewer/model/actions.js';
import {
  drawingLineAdd,
  type Line,
  type Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import {
  drawingPointAdd,
  pickDrawingProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import { getMessages } from '@features/l10n/messagesStore.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { loadObjectsMessages } from '@features/objects/translations/loadObjectsMessages.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
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
import {
  DEFAULT_TRACK_COLOR,
  DEFAULT_TRACK_WIDTH,
  resolveTracks,
  trackLineSegments,
} from '@features/tracking/tracks.js';
import { joinColorAlpha } from '@shared/colorAlpha.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import { mergeLines } from '@shared/geoutils.js';
import { isAbortError } from '@shared/isAbortError.js';
import { promptSimplification } from '@shared/simplifyPrompt.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { flatten as turfFlatten } from '@turf/flatten';
import { simplify } from '@turf/simplify';
import type { Feature, FeatureCollection, Position } from 'geojson';
import type { Dispatch } from 'redux';

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

// A polygon ring simplified as a ring: `simplify` keeps one from degenerating
// into fewer points than a polygon can be made of.
function simplifyRing(ring: Position[], tolerance: number): Position[] {
  return tolerance
    ? simplify(
        { type: 'Polygon', coordinates: [ring] },
        { mutate: true, highQuality: true, tolerance },
      ).coordinates[0]!
    : ring;
}

/**
 * The line/polygon features of an import as one drawing batch.
 *
 * Holes reach us two ways and both land as a `holeOf` index into the batch: a
 * GeoJSON polygon carries them as its own interior rings, while GPX has no
 * polygon type, so our writer emits them as sibling tracks tied together by
 * `fm:polygonId` / `fm:holeOf`.
 */
function featuresToLines(
  features: Feature[],
  base: Partial<Line>,
  labelLinesToo: boolean,
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

    for (const [i, ring] of rings.entries()) {
      const closed =
        !isGeoJsonPolygon &&
        ring.length > 2 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1];

      const style = lineStyleFromProperties(feature.properties, closed);

      const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

      lines.push({
        ...base,
        ...style,
        type: isPolygon ? 'polygon' : 'line',
        // Referenced rather than copied, so editing the property moves the
        // label with it.
        // Our own export writes the label as written into `freemap:label`;
        // anything else names the feature and gets a reference to that name.
        label:
          typeof feature.properties?.['freemap:label'] === 'string'
            ? feature.properties['freemap:label']
            : (isPolygon || labelLinesToo) && feature.properties?.['name']
              ? '{name}'
              : undefined /* ignore street names */,
        props: pickDrawingProps(
          feature.properties as Record<string, string> | undefined,
        ),
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

// Convert an arbitrary GeoJSON Feature/FeatureCollection into drawing points
// and lines/polygons. Returns counts so callers can decide what to select.
// Shared between the `search-result` and `objects-geometry` branches.
function geojsonToDrawing(
  geojson: Feature | FeatureCollection,
  getState: () => RootState,
  dispatch: Dispatch,
  tolerance = 0,
): { lineCount: number; pointCount: number } {
  const { features } = turfFlatten(geojson);

  mergeLines(features);

  if (tolerance) {
    for (const [i, feature] of features.entries()) {
      features[i] = simplify(feature, {
        mutate: false,
        highQuality: true,
        tolerance,
      });
    }
  }

  let lineCount = 0;

  let pointCount = 0;

  for (const feature of features) {
    const { geometry } = feature;

    if (geometry?.type === 'Point') {
      const tags = (feature.properties ?? {}) as Record<string, string>;

      // Explicit styling (freemap extensions / Garmin sym / simplestyle) wins
      // over OSM tag inference, then falls back to drawing settings.
      const style = pointStyleFromProperties(feature.properties);

      const state = getState();

      dispatch(
        drawingPointAdd({
          ...state.drawingSettings.style,
          ...style,
          label:
            typeof feature.properties?.['freemap:label'] === 'string'
              ? feature.properties['freemap:label']
              : feature.properties?.['name']
                ? '{name}'
                : undefined,
          props: pickDrawingProps(tags),
          coords: {
            lat: geometry.coordinates[1],
            lon: geometry.coordinates[0],
          },
          icon: style.icon ?? tagsToPoiIconSpec(tags),
          id: state.drawingPoints.points.length,
        }),
      );

      pointCount++;
    }
  }

  const lines = featuresToLines(
    features,
    getState().drawingSettings.style,
    false,
  );

  if (lines.length) {
    dispatch(drawingLineAdd(lines));

    lineCount += lines.length;
  }

  return { lineCount, pointCount };
}

/**
 * Selects what was converted when it is a single feature — by its position in
 * the list, which is what a drawing selection names. `first` holds the two
 * lengths from before the conversion, so the index is the one the feature
 * actually landed at.
 */
function selectAfterConvert(
  dispatch: Dispatch,
  first: { lineIndex: number; pointIndex: number },
  lineCount: number,
  pointCount: number,
): void {
  dispatch(
    selectFeature(
      lineCount === 1
        ? { type: 'draw-line-poly', id: first.lineIndex }
        : pointCount === 1
          ? { type: 'draw-points', id: first.pointIndex }
          : null,
    ),
  );
}

/** Where the next converted line and point land. */
function firstIndexes(state: RootState) {
  return {
    lineIndex: state.drawingLines.lines.length,
    pointIndex: state.drawingPoints.points.length,
  };
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

  const firstLineIndex = state.drawingLines.lines.length;

  let lineCount = 0;

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

    dispatch(drawingLineAdd(lines));

    lineCount += lines.length;
  } else if (alternative) {
    const raw = alternativeCoordinates(alternative);

    const coords = tolerance
      ? simplify(
          { type: 'LineString', coordinates: raw },
          { mutate: true, highQuality: true, tolerance },
        ).coordinates
      : raw;

    const dominant = dominantStepMode(alternative);

    dispatch(
      drawingLineAdd({
        ...state.drawingSettings.style,
        type: 'line',
        // A drawing line is one color and one dash pattern, so a multimodal
        // route takes those of the mode covering most of it. The dash is set
        // explicitly rather than left to the drawing defaults, which the user
        // may have made dashed.
        color: joinColorAlpha(STEP_MODE_COLORS[dominant], lineOpacity),
        dashArray: stepModeDashArray(dominant) ?? [],
        width,
        points: coords.map(([lon, lat], id) => ({ lat, lon, id })),
      }),
    );

    lineCount++;
  }

  for (const [i, pt] of points.entries()) {
    const kind = waypointKind(i, points.length, finishOnly, mode);

    const number = stopNumber(i, mode, waypoints);

    dispatch(
      drawingPointAdd({
        ...state.drawingSettings.style,
        coords: { lat: pt.lat, lon: pt.lon },
        color: joinColorAlpha(WAYPOINT_COLORS[kind], markerOpacity),
        // The marker carries the same glyph the map gives it — a play/stop icon
        // for the ends, the visiting number for a stop. No `label`: that would
        // hang a permanent tooltip off every waypoint.
        icon:
          WAYPOINT_ICONS[kind] ??
          (number === undefined ? undefined : String(number)),
        id: getState().drawingPoints.points.length,
      }),
    );
  }

  dispatch(
    selectFeature(
      lineCount === 1 ? { type: 'draw-line-poly', id: firstLineIndex } : null,
    ),
  );

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

      for (const object of targets) {
        dispatch(
          drawingPointAdd({
            ...state.drawingSettings.style,
            coords: object.coords,
            // The name is referenced rather than copied, so editing the
            // property below moves the drawn label with it.
            label: object.tags?.['name'] ? '{name}' : undefined,
            props: pickDrawingProps(object.tags),
            color: state.drawingSettings.style.color,
            markerType: state.objectsSettings.selectedIcon,
            icon: tagsToPoiIconSpec(object.tags),
            id: getState().drawingPoints.points.length,
          }),
        );
      }

      if (!payload.id) {
        // Every visible object is a drawing now, so the predicate that fetched
        // them goes with them: left set, it would fetch them again on the next
        // pan and draw them over what they became. The tool goes too, through
        // `convertSourceTools` in the main reducer.
        dispatch(objectsSetFilter([]));
      }

      if (targets.length === 1) {
        dispatch(
          selectFeature({
            type: 'draw-points',
            id: state.drawingPoints.points.length,
          }),
        );
      }
    } else if (payload.type === 'objects-geometry') {
      // Async fetch path — leave the action alone so `handle` picks it up.
      return action;
    } else if (payload.type === 'track') {
      if (!state.trackViewer.trackGeojson) {
        return;
      }

      const first = firstIndexes(state);

      let lineCount = 0;

      let pointCount = 0;

      const features = turfFlatten(state.trackViewer.trackGeojson).features.map(
        (feature) =>
          payload.tolerance
            ? simplify(feature, {
                mutate: false,
                highQuality: true,
                tolerance: payload.tolerance,
              })
            : feature,
      );

      for (const feature of features) {
        const { geometry } = feature;

        if (geometry?.type === 'Point') {
          const style = pointStyleFromProperties(feature.properties);

          dispatch(
            drawingPointAdd({
              ...state.drawingSettings.style,
              ...style,
              label: feature.properties?.['name'],
              markerType:
                style.markerType ?? state.objectsSettings.selectedIcon,
              coords: {
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
              },
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        }
      }

      // GPX tracks arrive as LineStrings; imported GeoJSON may carry native
      // Polygon geometry (MultiPolygon is split by `turfFlatten`).
      const lines = featuresToLines(
        features,
        state.drawingSettings.style,
        true,
      );

      if (lines.length) {
        dispatch(drawingLineAdd(lines));

        lineCount += lines.length;
      }

      // The drawing is a lossy editable copy (per-vertex elevation/heart-rate/
      // time can't live in the URL-hashed drawing state). Replace the source
      // rather than leave both: a static duplicate over the original would
      // double the geometry and its click hit-area. The menu warns first when
      // there's recorded data to lose.
      dispatch(dataViewerDelete());

      selectAfterConvert(dispatch, first, lineCount, pointCount);
    } else if (payload.type === 'tracking') {
      // The live tracks stay where they are — the feed goes on, so this is a
      // copy. Each continuous segment converts on its own, at full fidelity, in
      // the color and width the device is drawn in.
      const tracks = resolveTracks(
        state.tracking.tracks,
        state.tracking.trackedDevices,
      ).filter(
        (track) => payload.id === undefined || track.token === payload.id,
      );

      const first = firstIndexes(state);

      const lines = tracks.flatMap((track) =>
        trackLineSegments(track).map((segment): Line => {
          const coords = segment.map(
            (point): Position => [point.lon, point.lat],
          );

          return {
            ...state.drawingSettings.style,
            type: 'line',
            label: track.label ?? undefined,
            color: track.color || DEFAULT_TRACK_COLOR,
            width: track.width || DEFAULT_TRACK_WIDTH,
            points: ringToPoints(
              payload.tolerance
                ? simplify(
                    { type: 'LineString', coordinates: coords },
                    {
                      mutate: true,
                      highQuality: true,
                      tolerance: payload.tolerance,
                    },
                  ).coordinates
                : coords,
              false,
            ),
          };
        }),
      );

      if (lines.length === 0) {
        return;
      }

      dispatch(drawingLineAdd(lines));

      // Only a single line takes the selection over. The other branches drop it
      // when there is nothing to select, but here the device stays watched and
      // stays selectable, so its selection is left where it is.
      if (lines.length === 1) {
        dispatch(
          selectFeature({ type: 'draw-line-poly', id: first.lineIndex }),
        );
      }
    } else if (payload.type === 'changesets') {
      const { changesets } = state.changesets;

      if (changesets.length === 0) {
        return;
      }

      for (const changeset of changesets) {
        dispatch(
          drawingPointAdd({
            ...state.drawingSettings.style,
            coords: { lat: changeset.centerLat, lon: changeset.centerLon },
            label: changeset.description,
            color: state.drawingSettings.style.color,
            id: getState().drawingPoints.points.length,
          }),
        );
      }

      dispatch(changesetsSet([]));

      dispatch(
        selectFeature(
          changesets.length === 1
            ? { type: 'draw-points', id: state.drawingPoints.points.length }
            : null,
        ),
      );
    } else if (payload.type === 'search-result') {
      // The result acted upon becomes a drawing; the others stay results.
      const result = activeSearchResultSelector(state);

      if (!result || !hasGeometry(result)) {
        return;
      }

      const first = firstIndexes(state);

      const { lineCount, pointCount } = geojsonToDrawing(
        result.geojson,
        getState,
        dispatch,
        payload.tolerance,
      );

      dispatch(searchUnselectResult(result.id));

      selectAfterConvert(dispatch, first, lineCount, pointCount);
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

    const { id } = action.payload;

    try {
      const geojson = await fetchOsmFullGeojson(id, getState);

      // Asked here rather than in the menu, which is the one conversion that
      // doesn't know its own geometry until it has been fetched — a relation
      // can be tens of thousands of nodes.
      const tolerance = promptSimplification(
        convertibleLines(geojson),
        getMessages()?.general.simplifyPrompt,
      );

      if (tolerance === null) {
        return;
      }

      const first = firstIndexes(getState());

      const { lineCount, pointCount } = geojsonToDrawing(
        geojson,
        getState,
        dispatch,
        tolerance,
      );

      selectAfterConvert(dispatch, first, lineCount, pointCount);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }

      dispatch(
        toastsAdd({
          style: 'danger',
          messageKey: 'fetchingError',
          messageParams: { err },
          messageLoader: loadObjectsMessages,
        }),
      );
    }
  },
};

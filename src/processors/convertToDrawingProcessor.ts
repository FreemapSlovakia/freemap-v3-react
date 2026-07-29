import { convertToDrawing, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import {
  drawingLineAdd,
  type Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointAdd } from '@features/drawing/model/actions/drawingPointActions.js';
import { recorderPointsToFeature } from '@features/gpsRecorder/trackGeojson.js';
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
import { loadRoutePlannerMessages } from '@features/routePlanner/translations/loadRoutePlannerMessages.js';
import { searchClear } from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackViewerDelete } from '@features/trackViewer/model/actions.js';
import { joinColorAlpha } from '@shared/colorAlpha.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import { mergeLines } from '@shared/geoutils.js';
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

// Convert an arbitrary GeoJSON Feature/FeatureCollection into drawing points
// and lines/polygons. Returns counts so callers can decide what to select.
// Shared between the `search-result` and `objects-geometry` branches.
function geojsonToDrawing(
  geojson: Feature | FeatureCollection,
  getState: () => RootState,
  dispatch: Dispatch,
): { lineCount: number; pointCount: number } {
  const { features } = turfFlatten(geojson);

  mergeLines(features);

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
          label: feature.properties?.['name'],
          coords: {
            lat: geometry.coordinates[1],
            lon: geometry.coordinates[0],
          },
          icon: style.icon ?? tagsToPoiIconSpec(tags),
          id: state.drawingPoints.points.length,
        }),
      );

      pointCount++;
    } else if (
      geometry?.type === 'LineString' ||
      geometry?.type === 'Polygon'
    ) {
      // Drawing can't represent holes, so emit every ring (outer + holes) as
      // its own polygon.
      const isGeoJsonPolygon = geometry.type === 'Polygon';

      const rings: Position[][] =
        geometry.type === 'Polygon'
          ? geometry.coordinates
          : [geometry.coordinates];

      for (const ring of rings) {
        const closed =
          !isGeoJsonPolygon &&
          ring.length > 2 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1];

        const style = lineStyleFromProperties(feature.properties, closed);

        const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

        const points = ringToPoints(
          ring,
          isGeoJsonPolygon || (isPolygon && closed),
        );

        const state = getState();

        dispatch(
          drawingLineAdd({
            ...state.drawingSettings.style,
            ...style,
            type: isPolygon ? 'polygon' : 'line',
            label: isPolygon ? feature.properties?.['name'] : undefined, // ignore street names
            points,
          }),
        );

        lineCount++;
      }
    }
  }

  return { lineCount, pointCount };
}

function selectAfterConvert(
  dispatch: Dispatch,
  getState: () => RootState,
  lineCount: number,
  pointCount: number,
): void {
  dispatch(
    selectFeature(
      lineCount === 1
        ? { type: 'draw-line-poly', id: getState().drawingLines.lines.length }
        : pointCount === 1
          ? { type: 'draw-points', id: getState().drawingPoints.points.length }
          : null,
    ),
  );
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
    // Every ring (outer and holes alike) becomes its own polygon, since drawing
    // has no hole representation.
    for (const isochrone of isochrones) {
      const bucket = isochrone.properties?.['bucket'] ?? 0;

      const color = isochroneColor(bucket, isochrones.length);

      for (const ring of isochrone.geometry.coordinates) {
        dispatch(
          drawingLineAdd({
            ...state.drawingSettings.style,
            type: 'polygon',
            label: isochroneLabel(
              isochrone,
              bucket,
              rpm.isochroneRing,
              language,
            ),
            color: joinColorAlpha(color, lineOpacity),
            width,
            // Only the outermost ring is filled, as on the map; the inner ones
            // keep a transparent fill so their interior stays clickable.
            fillColor: joinColorAlpha(
              color,
              bucket === isochrones.length - 1
                ? ISOCHRONE_FILL_OPACITY * lineOpacity
                : 0,
            ),
            points: ringToPoints(ring, true),
          }),
        );

        lineCount++;
      }
    }
  } else if (alternative) {
    // Each leg/step shares its endpoint with the next one's start, so drop
    // consecutive duplicate coordinates to avoid stacked nodes at the joints.
    const coords = alternative.legs
      .flatMap((leg) => leg.steps.flatMap((step) => step.geometry.coordinates))
      .filter(
        (coord, i, all) =>
          i === 0 || coord[0] !== all[i - 1][0] || coord[1] !== all[i - 1][1],
      );

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
            label: object.tags?.['name'], // TODO put object type and some other tags to name
            color: state.drawingSettings.style.color,
            markerType: state.objectsSettings.selectedIcon,
            icon: tagsToPoiIconSpec(object.tags),
            id: getState().drawingPoints.points.length,
          }),
        );
      }

      if (targets.length === 1) {
        dispatch(
          selectFeature({
            type: 'draw-points',
            id: state.drawingPoints.points.length,
          }),
        );
      }
    } else if (payload.type === 'gps-recorder') {
      const { points } = state.gpsRecorder;

      if (points.length < 2) {
        return;
      }

      const feature = recorderPointsToFeature(points);

      const { geometry } = payload.tolerance
        ? simplify(feature, {
            mutate: false,
            highQuality: true,
            tolerance: payload.tolerance,
          })
        : feature;

      dispatch(
        drawingLineAdd({
          ...state.drawingSettings.style,
          type: 'line',
          points: ringToPoints(geometry.coordinates, false),
        }),
      );

      // No delete counterpart to the track branch's `trackViewerDelete`: the
      // recording continues and the recorder owns it, so this is a copy taken
      // at a moment in time, not a hand-over.
      selectAfterConvert(dispatch, getState, 1, 0);
    } else if (payload.type === 'objects-geometry') {
      // Async fetch path — leave the action alone so `handle` picks it up.
      return action;
    } else if (payload.type === 'track') {
      if (!state.trackViewer.trackGeojson) {
        return;
      }

      let lineCount = 0;

      let pointCount = 0;

      const { features } = turfFlatten(state.trackViewer.trackGeojson);

      for (const feature of features) {
        const { geometry } = payload.tolerance
          ? simplify(feature, {
              mutate: false,
              highQuality: true,
              tolerance: payload.tolerance,
            })
          : feature;

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
        } else if (
          geometry?.type === 'LineString' ||
          geometry?.type === 'Polygon'
        ) {
          // GPX tracks arrive as LineStrings; imported GeoJSON may carry native
          // Polygon geometry (MultiPolygon is split by `turfFlatten`). Drawing
          // can't represent holes, so emit every ring (outer + holes) as its
          // own polygon.
          const isGeoJsonPolygon = geometry.type === 'Polygon';

          const rings: Position[][] =
            geometry.type === 'Polygon'
              ? geometry.coordinates
              : [geometry.coordinates];

          for (const ring of rings) {
            const closed =
              !isGeoJsonPolygon &&
              ring.length > 2 &&
              ring[0][0] === ring[ring.length - 1][0] &&
              ring[0][1] === ring[ring.length - 1][1];

            const style = lineStyleFromProperties(feature.properties, closed);

            const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

            const points = ringToPoints(
              ring,
              isGeoJsonPolygon || (isPolygon && closed),
            );

            dispatch(
              drawingLineAdd({
                ...state.drawingSettings.style,
                ...style,
                type: isPolygon ? 'polygon' : 'line',
                label: feature.properties?.['name'],
                points,
              }),
            );

            lineCount++;
          }
        }
      }

      // The drawing is a lossy editable copy (per-vertex elevation/heart-rate/
      // time can't live in the URL-hashed drawing state). Replace the source
      // rather than leave both: a static duplicate over the original would
      // double the geometry and its click hit-area. The menu warns first when
      // there's recorded data to lose.
      dispatch(trackViewerDelete());

      selectAfterConvert(dispatch, getState, lineCount, pointCount);
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
      if (!state.search.selectedResult?.geojson) {
        return;
      }

      const { lineCount, pointCount } = geojsonToDrawing(
        state.search.selectedResult.geojson,

        getState,
        dispatch,
      );

      dispatch(searchClear());

      selectAfterConvert(dispatch, getState, lineCount, pointCount);
    }
  },
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload.type === 'planned-route') {
      await convertPlannedRoute(getState, dispatch);

      return;
    }

    if (action.payload.type !== 'objects-geometry') {
      return;
    }

    const { id } = action.payload;

    try {
      const geojson = await fetchOsmFullGeojson(id, getState);

      if (!geojson) {
        return;
      }

      const { lineCount, pointCount } = geojsonToDrawing(
        geojson,

        getState,
        dispatch,
      );

      selectAfterConvert(dispatch, getState, lineCount, pointCount);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
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

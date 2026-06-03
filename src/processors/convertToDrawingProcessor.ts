import { convertToDrawing, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { changesetsSet } from '@features/changesets/model/actions.js';
import {
  drawingLineAdd,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointAdd } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@features/drawing/model/styleFromProperties.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchClear } from '@features/search/model/actions.js';
import { trackViewerDelete } from '@features/trackViewer/model/actions.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import { mergeLines } from '@shared/geoutils.js';
import { flatten as turfFlatten } from '@turf/flatten';
import { lineString } from '@turf/helpers';
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
  tolerance: number | undefined,
  getState: () => RootState,
  dispatch: Dispatch,
): { lineCount: number; pointCount: number } {
  const { features } = turfFlatten(
    tolerance
      ? simplify(geojson, { mutate: false, highQuality: true, tolerance })
      : geojson,
  );

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

export const convertToDrawingProcessor: Processor<typeof convertToDrawing> = {
  actionCreator: convertToDrawing,
  id: 'convertToDrawing',
  transform: ({ getState, dispatch, action }) => {
    const { payload } = action;

    const state = getState();

    if (payload.type === 'planned-route') {
      const alt =
        state.routePlanner.alternatives[
          state.routePlanner.activeAlternativeIndex
        ];

      if (!alt) {
        return;
      }

      const coords = alt.legs.flatMap((leg) =>
        leg.steps.flatMap((step) => step.geometry.coordinates),
      );

      const ls = lineString(coords.map(([lat, lon]) => [lon, lat]));

      if (payload.tolerance) {
        simplify(ls, {
          mutate: true,
          highQuality: true,
          tolerance: payload.tolerance,
        });
      }

      dispatch(
        drawingLineAdd({
          ...state.drawingSettings.style,
          type: 'line',
          points: ls.geometry.coordinates.map((p, id) => ({
            lat: p[0],
            lon: p[1],
            id,
          })),
        }),
      );

      dispatch(
        selectFeature({
          type: 'draw-line-poly',
          id: state.drawingLines.lines.length,
        }),
      );

      dispatch(routePlannerDelete());
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
            markerType: state.objects.selectedIcon,
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
              markerType: style.markerType ?? state.objects.selectedIcon,
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
        payload.tolerance,
        getState,
        dispatch,
      );

      dispatch(searchClear());

      selectAfterConvert(dispatch, getState, lineCount, pointCount);
    }
  },
  handle: async ({ getState, dispatch, action }) => {
    if (action.payload.type !== 'objects-geometry') {
      return;
    }

    const { id, tolerance } = action.payload;

    const geojson = await fetchOsmFullGeojson(id, getState);

    if (!geojson) {
      return;
    }

    const { lineCount, pointCount } = geojsonToDrawing(
      geojson,
      tolerance,
      getState,
      dispatch,
    );

    selectAfterConvert(dispatch, getState, lineCount, pointCount);
  },
  errorKey: 'objects.fetchingError',
};

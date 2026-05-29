import { convertToDrawing, selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
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
import { normalizeMarkerType } from '@features/objects/model/actions.js';
import { routePlannerDelete } from '@features/routePlanner/model/actions.js';
import { searchClear } from '@features/search/model/actions.js';
import { trackViewerDelete } from '@features/trackViewer/model/actions.js';
import { tagsToPoiIconSpec } from '@shared/drawingIcons.js';
import { mergeLines } from '@shared/geoutils.js';
import { flatten as turfFlatten } from '@turf/flatten';
import { lineString } from '@turf/helpers';
import { simplify } from '@turf/simplify';
import type { Position } from 'geojson';

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

export const convertToDrawingProcessor: Processor<typeof convertToDrawing> = {
  actionCreator: convertToDrawing,
  id: 'deleteFeature',
  transform: ({ getState, dispatch, action: { payload } }) => {
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
          type: 'line',
          color: state.drawingSettings.drawingColor,
          width: state.drawingSettings.drawingWidth,
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
      const object = state.objects.objects.find(
        (object) => object.id === payload.id,
      );

      if (object) {
        dispatch(
          drawingPointAdd({
            coords: object.coords,
            label: object.tags?.['name'], // TODO put object type and some other tags to name
            color: state.drawingSettings.drawingColor,
            markerType: normalizeMarkerType(state.objects.selectedIcon),
            icon: tagsToPoiIconSpec(object.tags),
            id: getState().drawingPoints.points.length,
          }),
        );

        dispatch(
          selectFeature({
            type: 'draw-points',
            id: state.drawingPoints.points.length,
          }),
        );
      }
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
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              markerType: normalizeMarkerType(
                style.markerType ?? state.objects.selectedIcon,
              ),
              icon: style.icon,
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
                type: isPolygon ? 'polygon' : 'line',
                label: feature.properties?.['name'],
                color: style.color ?? state.drawingSettings.drawingColor,
                // Bake the fill default in here (like color/width above) so the
                // semitransparency survives — a freshly drawn polygon uses
                // drawingFillColor, so match it for unstyled imported polygons.
                fillColor:
                  style.fillColor ??
                  (isPolygon
                    ? state.drawingSettings.drawingFillColor
                    : undefined),
                width: style.width ?? state.drawingSettings.drawingWidth,
                lineCap: style.lineCap,
                lineJoin: style.lineJoin,
                dashArray: style.dashArray,
                points,
              }),
            );

            lineCount++;
          }
        }
      }

      dispatch(trackViewerDelete());

      dispatch(
        selectFeature(
          lineCount === 1
            ? { type: 'draw-line-poly', id: state.drawingLines.lines.length }
            : pointCount === 1
              ? { type: 'draw-points', id: state.drawingPoints.points.length }
              : null,
        ),
      );
    } else if (payload.type === 'changesets') {
      const { changesets } = state.changesets;

      if (changesets.length === 0) {
        return;
      }

      for (const changeset of changesets) {
        dispatch(
          drawingPointAdd({
            coords: { lat: changeset.centerLat, lon: changeset.centerLon },
            label: changeset.description,
            color: state.drawingSettings.drawingColor,
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
      // TODO very similar to route conversion - use functions

      if (!state.search.selectedResult?.geojson) {
        return;
      }

      const { geojson } = state.search.selectedResult;

      const { features } = turfFlatten(
        payload.tolerance
          ? simplify(geojson, {
              mutate: false,
              highQuality: true,
              tolerance: payload.tolerance,
            })
          : geojson,
      );

      mergeLines(features);

      let lineCount = 0;

      let pointCount = 0;

      for (const feature of features) {
        const { geometry } = feature;

        if (geometry?.type === 'Point') {
          const tags = (feature.properties ?? {}) as Record<string, string>;

          // Explicit styling (freemap extensions / Garmin sym / simplestyle)
          // wins over OSM tag inference, then falls back to drawing settings.
          const style = pointStyleFromProperties(feature.properties);

          dispatch(
            drawingPointAdd({
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              coords: {
                lat: geometry.coordinates[1],
                lon: geometry.coordinates[0],
              },
              markerType: normalizeMarkerType(
                style.markerType ?? state.objects.selectedIcon,
              ),
              icon: style.icon ?? tagsToPoiIconSpec(tags),
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        } else if (
          geometry?.type === 'LineString' ||
          geometry?.type === 'Polygon'
        ) {
          // Drawing can't represent holes, so emit every ring (outer + holes)
          // as its own polygon.
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
                type: isPolygon ? 'polygon' : 'line',
                label: isPolygon ? feature.properties?.['name'] : undefined, // ignore street names
                color: style.color ?? state.drawingSettings.drawingColor,
                fillColor:
                  style.fillColor ??
                  (isPolygon
                    ? state.drawingSettings.drawingFillColor
                    : undefined),
                width: style.width ?? state.drawingSettings.drawingWidth,
                lineCap: style.lineCap,
                lineJoin: style.lineJoin,
                dashArray: style.dashArray,
                points,
              }),
            );

            lineCount++;
          }
        }
      }

      dispatch(searchClear());

      dispatch(
        selectFeature(
          lineCount === 1
            ? { type: 'draw-line-poly', id: state.drawingLines.lines.length }
            : pointCount === 1
              ? { type: 'draw-points', id: state.drawingPoints.points.length }
              : null,
        ),
      );
    }
  },
};

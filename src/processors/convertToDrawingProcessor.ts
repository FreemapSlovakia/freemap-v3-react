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
        } else if (geometry?.type === 'LineString') {
          const coords = geometry.coordinates;

          const closed =
            coords.length > 2 &&
            coords[0][0] === coords[coords.length - 1][0] &&
            coords[0][1] === coords[coords.length - 1][1];

          const style = lineStyleFromProperties(feature.properties, closed);

          const isPolygon = style.type === 'polygon';

          // For a closed ring rendered as a polygon, drop the duplicate
          // closing point — drawing-lines stores polygons open-ended and
          // closes them at render time.
          const ringCoords = isPolygon && closed ? coords.slice(0, -1) : coords;

          let id = 0;

          const points: Point[] = [];

          for (const node of ringCoords) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: isPolygon ? 'polygon' : 'line',
              label: feature.properties?.['name'],
              color: style.color ?? state.drawingSettings.drawingColor,
              fillColor: style.fillColor,
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
          const isGeoJsonPolygon = geometry.type === 'Polygon';

          const rawCoords = isGeoJsonPolygon
            ? geometry.coordinates[0]
            : geometry.coordinates;

          const closed =
            !isGeoJsonPolygon &&
            rawCoords.length > 2 &&
            rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] &&
            rawCoords[0][1] === rawCoords[rawCoords.length - 1][1];

          const style = lineStyleFromProperties(feature.properties, closed);

          const isPolygon = isGeoJsonPolygon || style.type === 'polygon';

          const ringCoords =
            !isGeoJsonPolygon && isPolygon && closed
              ? rawCoords.slice(0, -1)
              : rawCoords;

          let id = 0;

          const points: Point[] = [];

          for (const node of ringCoords) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: isPolygon ? 'polygon' : 'line',
              label: isPolygon ? feature.properties?.['name'] : undefined, // ignore street names
              color: style.color ?? state.drawingSettings.drawingColor,
              fillColor: style.fillColor,
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

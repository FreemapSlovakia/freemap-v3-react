import { convertToDrawing, selectFeature } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import turfFlatten from '@turf/flatten';
import { lineString } from '@turf/helpers';
import simplify from '@turf/simplify';
import { drawingLineAdd, Point } from 'fm3/actions/drawingLineActions';
import { mergeLines } from 'fm3/geoutils';
import { routePlannerDelete } from 'fm3/actions/routePlannerActions';
import { drawingPointAdd } from 'fm3/actions/drawingPointActions';
import { trackViewerDelete } from 'fm3/actions/trackViewerActions';
import { searchClear } from 'fm3/actions/searchActions';

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
          color: state.main.drawingColor,
          width: state.main.drawingWidth,
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
            lat: object.lat,
            lon: object.lon,
            label: object.tags?.['name'], // TODO put object type and some other tags to name
            color: state.main.drawingColor,
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
          dispatch(
            drawingPointAdd({
              label: feature.properties?.['name'],
              color: state.main.drawingColor,
              lat: geometry.coordinates[1],
              lon: geometry.coordinates[0],
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        } else if (geometry?.type === 'LineString') {
          let id = 0;

          const points: Point[] = [];

          for (const node of geometry.coordinates) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: 'line',
              label: feature.properties?.['name'],
              color: state.main.drawingColor,
              width: state.main.drawingWidth,
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
          dispatch(
            drawingPointAdd({
              label: feature.properties?.['name'],
              color: state.main.drawingColor,
              lat: geometry.coordinates[1],
              lon: geometry.coordinates[0],
              id: getState().drawingPoints.points.length,
            }),
          );

          pointCount++;
        } else if (
          geometry?.type === 'LineString' ||
          geometry?.type === 'Polygon'
        ) {
          let id = 0;

          const points: Point[] = [];

          for (const node of geometry?.type === 'Polygon'
            ? geometry.coordinates[0]
            : geometry.coordinates) {
            points.push({
              lat: node[1],
              lon: node[0],
              id: id++,
            });
          }

          dispatch(
            drawingLineAdd({
              type: geometry?.type === 'Polygon' ? 'polygon' : 'line',
              label:
                geometry?.type === 'Polygon'
                  ? feature.properties?.['name']
                  : undefined, // ignore street names
              color: state.main.drawingColor,
              width: state.main.drawingWidth,
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

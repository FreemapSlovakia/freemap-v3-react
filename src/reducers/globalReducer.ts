import turfFlatten from '@turf/flatten';
import { AllGeoJSON, lineString } from '@turf/helpers';
import simplify from '@turf/simplify';
import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineRemovePoint,
  drawingLineUpdatePoint,
  Point,
} from 'fm3/actions/drawingLineActions';
import {
  drawingChangeLabel,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { convertToDrawing } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import produce from 'immer';
import { isActionOf } from 'typesafe-actions';
import { cleanState as routePlannerCleanState } from './routePlannerReducer';
import { cleanState as trackViewerCleanState } from './trackViewerReducer';

export function globalReducer(state: RootState, action: RootAction): RootState {
  if (isActionOf(convertToDrawing, action)) {
    if (state.main.selection?.type === 'route-planner') {
      return produce(state, (draft) => {
        const alt =
          draft.routePlanner.alternatives[
            draft.routePlanner.activeAlternativeIndex
          ];

        if (!alt) {
          return;
        }

        const points: Point[] = [];

        const coords: number[][] = [];

        for (const leg of alt.legs) {
          for (const step of leg.steps) {
            coords.push(...step.geometry.coordinates);
          }
        }

        let id = 0;

        const ls = lineString(coords);

        if (action.payload !== undefined) {
          simplify(ls, {
            mutate: true,
            highQuality: true,
            tolerance: action.payload / 100000,
          });
        }

        for (const p of ls.geometry.coordinates) {
          points.push({
            lat: p[0],
            lon: p[1],
            id,
          });

          id++;
        }

        draft.drawingLines.lines.push({
          type: 'line',
          points,
        });

        draft.main.selection = {
          type: 'draw-lines',
          id: draft.drawingLines.lines.length - 1,
        };

        Object.assign(draft.routePlanner, routePlannerCleanState);
      });
    } else if (state.main.selection?.type === 'objects') {
      return produce(state, (draft) => {
        for (const object of draft.objects.objects) {
          draft.drawingPoints.points.push({
            lat: object.lat,
            lon: object.lon,
            label: object.tags?.name, // TODO put object type and some other tags to name
          });
        }

        draft.drawingPoints.change++;

        draft.objects.objects = [];
      });
    } else if (state.main.selection?.type === 'track-viewer') {
      return produce(state, (draft) => {
        if (!draft.trackViewer.trackGeojson) {
          return;
        }

        const { features } = turfFlatten(
          draft.trackViewer.trackGeojson as AllGeoJSON,
        );

        for (const feature of features) {
          const { geometry } =
            action.payload === undefined
              ? feature
              : simplify(feature, {
                  mutate: false,
                  highQuality: true,
                  tolerance: action.payload / 100000,
                });

          if (geometry?.type === 'Point') {
            draft.drawingPoints.points.push({
              label: feature.properties?.name,
              lat: geometry.coordinates[1],
              lon: geometry.coordinates[0],
            });
          } else if (geometry?.type == 'LineString') {
            let id = 0;

            const points: Point[] = [];

            for (const node of geometry.coordinates) {
              points.push({
                lat: node[1],
                lon: node[0],
                id: id++,
              });
            }

            draft.drawingLines.lines.push({
              type: 'line',
              label: feature.properties?.name,
              points,
            });
          }
        }

        Object.assign(draft.trackViewer, trackViewerCleanState);
      });
    }
  } else if (isActionOf(drawingLineAddPoint, action)) {
    return produce(state, (draft) => {
      const index = action.payload.index ?? draft.drawingLines.lines.length - 1;

      draft.main.selection = {
        type:
          draft.drawingLines.lines[index].type === 'polygon'
            ? 'draw-polygons'
            : 'draw-lines',
        id: index,
      };
    });
  } else if (
    isActionOf([drawingLineUpdatePoint, drawingLineRemovePoint], action)
  ) {
    return produce(state, (draft) => {
      draft.main.selection = {
        type:
          draft.drawingLines.lines[action.payload.index].type === 'polygon'
            ? 'draw-polygons'
            : 'draw-lines',
        id: action.payload.index,
      };
    });
  } else if (isActionOf(drawingPointAdd, action)) {
    return produce(state, (draft) => {
      draft.main.selection = {
        type: 'draw-points',
        id: draft.drawingPoints.points.length - 1,
      };
    });
  } else if (isActionOf(drawingChangeLabel, action)) {
    return produce(state, (draft) => {
      const selection = draft.main.selection;
      if (
        (selection?.type === 'draw-polygons' ||
          selection?.type === 'draw-lines') &&
        selection?.id !== undefined
      ) {
        draft.drawingLines.lines[selection.id].label = action.payload.label;
      } else if (
        selection?.type === 'draw-points' &&
        selection?.id !== undefined
      ) {
        draft.drawingPoints.points[selection.id].label = action.payload.label;
      }
    });
  }

  return state;
}

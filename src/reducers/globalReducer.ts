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
import { convertToDrawing, deleteFeature } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import produce from 'immer';
import { isActionOf } from 'typesafe-actions';
import {
  cleanState as routePlannerCleanState,
  initialState as routePlannerInitialState,
} from './routePlannerReducer';
import {
  cleanState as trackViewerCleanState,
  initialState as trackViewerInitialState,
} from './trackViewerReducer';

export function preGlobalReducer(
  state: RootState,
  action: RootAction,
): RootState {
  if (isActionOf(convertToDrawing, action)) {
    if (state.main.tool === 'route-planner') {
      return produce(state, (draft) => {
        const alt =
          draft.routePlanner.alternatives[
            draft.routePlanner.activeAlternativeIndex
          ];

        if (!alt) {
          return;
        }

        const coords = alt.legs.flatMap((leg) =>
          leg.steps.flatMap((step) => step.geometry.coordinates),
        );

        const ls = lineString(coords.map(([lat, lon]) => [lon, lat]));

        if (action.payload !== undefined) {
          simplify(ls, {
            mutate: true,
            highQuality: true,
            tolerance: action.payload / 100000,
          });
        }

        draft.drawingLines.lines.push({
          type: 'line',
          points: ls.geometry.coordinates.map((p, id) => ({
            lat: p[0],
            lon: p[1],
            id,
          })),
        });

        draft.main.selection = {
          type: 'draw-line-poly',
          id: draft.drawingLines.lines.length - 1,
        };

        Object.assign(draft.routePlanner, routePlannerCleanState);
      });
    } else if (state.main.selection?.type === 'objects') {
      const { selection } = state.main;

      return produce(state, (draft) => {
        const object = draft.objects.objects.find(
          (object) => object.id === selection.id,
        );

        if (object) {
          draft.drawingPoints.points.push({
            lat: object.lat,
            lon: object.lon,
            label: object.tags?.['name'], // TODO put object type and some other tags to name
          });

          draft.drawingPoints.change++;

          draft.objects.objects = draft.objects.objects.filter(
            (object) => object.id !== selection.id,
          );

          draft.main.selection = {
            type: 'draw-points',
            id: draft.drawingPoints.points.length - 1,
          };
        }
      });
    } else if (state.main.tool === 'track-viewer') {
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
              label: feature.properties?.['name'],
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
              label: feature.properties?.['name'],
              points,
            });
          }
        }

        Object.assign(draft.trackViewer, trackViewerCleanState);
      });
    }
  } else if (isActionOf(deleteFeature, action)) {
    if (
      state.main.tool === 'track-viewer' ||
      state.main.tool === 'map-details'
    ) {
      const { trackViewer } = state;

      return {
        ...state,
        trackViewer: {
          ...trackViewerInitialState,
          colorizeTrackBy: trackViewer.colorizeTrackBy,
          eleSmoothingFactor: trackViewer.eleSmoothingFactor,
        },
      };
    } else if (state.main.selection?.type === 'objects') {
      const {
        objects,
        main: { selection },
      } = state;

      return {
        ...state,
        objects: {
          ...objects,
          objects: objects.objects.filter(
            (object) => object.id !== selection.id,
          ),
        },
      };
    } else if (state.main.tool === 'route-planner') {
      const { routePlanner } = state;

      return {
        ...state,
        routePlanner: {
          ...routePlannerInitialState,
          transportType: routePlanner.transportType,
          mode: routePlanner.mode,
          milestones: routePlanner.milestones,
          pickMode: 'start',
        },
      };
    } else if (state.main.selection?.type === 'draw-line-poly') {
      const {
        drawingLines,
        main: { selection },
      } = state;

      return {
        ...state,
        drawingLines: {
          ...drawingLines,
          lines: drawingLines.lines.filter((_, i) => i !== selection.id),
        },
      };
    } else if (state.main.selection?.type === 'draw-points') {
      const {
        drawingPoints,
        main: { selection },
      } = state;

      return {
        ...state,
        drawingPoints: {
          ...drawingPoints,
          points: drawingPoints.points.filter((_, i) => i !== selection.id),
        },
      };
    } else if (state.main.selection?.type === 'tracking') {
      const {
        tracking,
        main: { selection },
      } = state;

      return {
        ...state,
        tracking: {
          ...tracking,
          trackedDevices: tracking.trackedDevices.filter(
            (td) => td.id !== selection.id,
          ),
        },
      };
    }
  }

  return state;
}

export function postGlobalReducer(
  state: RootState,
  action: RootAction,
): RootState {
  if (isActionOf(drawingLineAddPoint, action)) {
    return produce(state, (draft) => {
      const index = action.payload.index ?? draft.drawingLines.lines.length - 1;

      draft.main.selection = {
        type: 'draw-line-poly',
        id: index,
      };
    });
  } else if (
    isActionOf([drawingLineUpdatePoint, drawingLineRemovePoint], action)
  ) {
    return produce(state, (draft) => {
      draft.main.selection = {
        type: 'draw-line-poly',
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
      if (selection?.type === 'draw-line-poly' && selection?.id !== undefined) {
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

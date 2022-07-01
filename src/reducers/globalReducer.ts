import turfFlatten from '@turf/flatten';
import { AllGeoJSON, lineString } from '@turf/helpers';
import simplify from '@turf/simplify';
import { RootAction } from 'fm3/actions';
import {
  drawingLineAddPoint,
  drawingLineJoinFinish,
  Line,
  Point,
} from 'fm3/actions/drawingLineActions';
import {
  drawingChangeProperties,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { convertToDrawing, deleteFeature } from 'fm3/actions/mainActions';
import { mergeLines } from 'fm3/geoutils';
import { RootState } from 'fm3/reducers';
import produce from 'immer';
import { isActionOf } from 'typesafe-actions';
import {
  cleanState as routePlannerCleanState,
  routePlannerInitialState,
} from './routePlannerReducer';
import { searchInitialState } from './searchReducer';
import {
  cleanState as trackViewerCleanState,
  trackViewerInitialState,
} from './trackViewerReducer';

export function preGlobalReducer(
  state: RootState,
  action: RootAction,
): RootState {
  if (isActionOf(convertToDrawing, action)) {
    const payload = action.payload;

    if (payload.type === 'planned-route') {
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

        if (payload.tolerance) {
          simplify(ls, {
            mutate: true,
            highQuality: true,
            tolerance: payload.tolerance,
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
    } else if (payload.type === 'objects') {
      return produce(state, (draft) => {
        const object = draft.objects.objects.find(
          (object) => object.id === payload.id,
        );

        if (object) {
          draft.drawingPoints.points.push({
            lat: object.lat,
            lon: object.lon,
            label: object.tags?.['name'], // TODO put object type and some other tags to name
          });

          draft.drawingPoints.change++;

          draft.main.selection = {
            type: 'draw-points',
            id: draft.drawingPoints.points.length - 1,
          };
        }
      });
    } else if (payload.type === 'track') {
      return produce(state, (draft) => {
        if (!draft.trackViewer.trackGeojson) {
          return;
        }

        const { features } = turfFlatten(draft.trackViewer.trackGeojson);

        for (const feature of features) {
          const { geometry } = payload.tolerance
            ? simplify(feature, {
                mutate: false,
                highQuality: true,
                tolerance: payload.tolerance,
              })
            : feature;

          if (geometry?.type === 'Point') {
            draft.drawingPoints.points.push({
              label: feature.properties?.['name'],
              lat: geometry.coordinates[1],
              lon: geometry.coordinates[0],
            });
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

            draft.drawingLines.lines.push({
              type: 'line',
              label: feature.properties?.['name'],
              points,
            });
          }
        }

        Object.assign(draft.trackViewer, trackViewerCleanState);
      });
    } else if (payload.type === 'search-result') {
      return produce(state, (draft) => {
        // TODO very similar to route conversion - use functions

        if (!draft.search.selectedResult?.geojson) {
          return;
        }

        const gjs = draft.search.selectedResult.geojson as AllGeoJSON;

        const { features } = turfFlatten(
          payload.tolerance
            ? simplify(gjs, {
                mutate: false,
                highQuality: true,
                tolerance: payload.tolerance,
              })
            : gjs,
        );

        const lines: Line[] = [];

        mergeLines(features);

        for (const feature of features) {
          const { geometry } = feature;

          if (geometry?.type === 'Point') {
            draft.drawingPoints.points.push({
              label: feature.properties?.['name'],
              lat: geometry.coordinates[1],
              lon: geometry.coordinates[0],
            });
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

            lines.push({
              type: 'line',
              // label: feature.properties?.['name'], // ignore street names
              points,
            });
          } else if (geometry?.type === 'Polygon') {
            let id = 0;

            const points: Point[] = [];

            // TODO add suport for inner rings

            for (const node of geometry.coordinates[0]) {
              points.push({
                lat: node[1],
                lon: node[0],
                id: id++,
              });
            }

            lines.push({
              type: 'line',
              label: feature.properties?.['name'],
              points,
            });
          }
        }

        draft.drawingLines.lines.push(...lines);

        draft.search = searchInitialState;
      });
    }
  } else if (
    isActionOf(drawingLineJoinFinish, action) &&
    state.drawingLines.joinWith
  ) {
    // this is to fix selection on join

    return {
      ...state,
      main: {
        ...state.main,
        selection: {
          type: 'draw-line-poly',
          id:
            state.drawingLines.joinWith.lineIndex -
            (action.payload.lineIndex > state.drawingLines.joinWith.lineIndex
              ? 0
              : 1),
        },
      },
    };
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
          preventHint: routePlanner.preventHint,
        },
      };
    } else if (state.main.selection?.type === 'line-point') {
      const { selection } = state.main;

      return produce(state, (draft) => {
        const line = draft.drawingLines.lines[selection.lineIndex];

        line.points = line.points.filter(
          (point) => point.id !== selection.pointId,
        );
      });
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
            (td) => td.token !== selection.id,
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
  } else if (isActionOf(drawingPointAdd, action)) {
    return produce(state, (draft) => {
      draft.main.selection = {
        type: 'draw-points',
        id: draft.drawingPoints.points.length - 1,
      };
    });
  } else if (isActionOf(drawingChangeProperties, action)) {
    return produce(state, (draft) => {
      const selection = draft.main.selection;

      if (selection?.type === 'draw-line-poly' && selection?.id !== undefined) {
        Object.assign(draft.drawingLines.lines[selection.id], action.payload);
      } else if (
        selection?.type === 'draw-points' &&
        selection?.id !== undefined
      ) {
        Object.assign(draft.drawingPoints.points[selection.id], action.payload);
      }
    });
  }

  return state;
}

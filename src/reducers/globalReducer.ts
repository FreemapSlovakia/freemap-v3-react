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
  drawingChangeLabel,
  drawingPointAdd,
} from 'fm3/actions/drawingPointActions';
import { convertToDrawing, deleteFeature } from 'fm3/actions/mainActions';
import produce from 'immer';
import { DefaultRootState } from 'react-redux';
import { isActionOf } from 'typesafe-actions';
import {
  cleanState as routePlannerCleanState,
  routePlannerInitialState as routePlannerInitialState,
} from './routePlannerReducer';
import { searchInitialState } from './searchReducer';
import {
  cleanState as trackViewerCleanState,
  trackViewerInitialState as trackViewerInitialState,
} from './trackViewerReducer';

export function preGlobalReducer(
  state: DefaultRootState,
  action: RootAction,
): DefaultRootState {
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

          draft.objects.objects = draft.objects.objects.filter(
            (object) => object.id !== payload.id,
          );

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
    } else if (payload.type === 'search-result') {
      return produce(state, (draft) => {
        // TODO very similar to route conversion - use functions

        if (!draft.search.selectedResult?.geojson) {
          return;
        }

        const { features } = turfFlatten(
          draft.search.selectedResult.geojson as AllGeoJSON,
        );

        const lines: Line[] = [];

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

        mergeLines(lines);

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
  state: DefaultRootState,
  action: RootAction,
): DefaultRootState {
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

// TODO to utils

function eq(pt1: Point, pt2: Point) {
  return pt1.lat === pt2.lat && pt1.lon === pt2.lon;
}

function renumber(line: Line) {
  line.points.forEach((point, i) => {
    point.id = i;
  });
}

function mergeLines(lines: Line[]) {
  restart: for (;;) {
    for (let i = 0; i < lines.length - 1; i++) {
      const line1 = lines[i];

      for (let j = i + 1; j < lines.length; j++) {
        const line2 = lines[j];

        if (eq(line1.points[0], line2.points[0])) {
          line1.points.unshift(...line2.points.slice(1).reverse());
          renumber(line1);
          lines.splice(j, 1);
          continue restart;
        }

        if (eq(line1.points[0], line2.points[line2.points.length - 1])) {
          line1.points.splice(0, 1).unshift(...line2.points.slice(1));
          renumber(line1);
          lines.splice(j, 1);
          continue restart;
        }

        if (eq(line1.points[line1.points.length - 1], line2.points[0])) {
          line1.points.push(...line2.points.slice(1));
          renumber(line1);
          lines.splice(j, 1);
          continue restart;
        }

        if (
          eq(
            line1.points[line1.points.length - 1],
            line2.points[line2.points.length - 1],
          )
        ) {
          line1.points.push(...line2.points.reverse().slice(1));
          renumber(line1);
          lines.splice(j, 1);
          continue restart;
        }
      }
    }

    break;
  }
}

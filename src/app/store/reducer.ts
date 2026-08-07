import {
  authWithApple,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithPopupOAuth,
} from '@features/auth/model/actions.js';
import { documentShow } from '@features/documents/model/actions.js';
import {
  drawingLineAddPoint,
  drawingLineContinue,
  drawingLineJoinFinish,
  drawingLineSetLines,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointAdd } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  routePlannerAddPoint,
  routePlannerDelete,
  routePlannerSetPoint,
} from '@features/routePlanner/model/actions.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import { isMapClickTool } from '@shared/toolDefinitions.js';
import {
  clearMapFeatures,
  closeTool,
  convertToDrawing,
  deleteFeature,
  hideInfoBar,
  infoBarShown,
  openTool,
  type Selection,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setErrorTicketId,
  type Tool,
} from './actions.js';
import type { ActiveModal } from './activeModal.js';

export interface MainState {
  /**
   * The open map-click tool — the owner of map clicks, and at most one of them,
   * so which toolbar takes a click never has to be stored separately.
   */
  mapTool: Tool | null;
  /**
   * The open tools that only bring a toolbar, in the order they were opened —
   * any number of them, alongside each other and alongside `mapTool`.
   */
  panelTools: Tool[];
  activeModal: ActiveModal | null;
  errorTicketId: string | undefined;
  embedFeatures: string[];
  selection: Selection | null;
  hiddenInfoBars: Record<string, number>;
  shownInfoBars: Record<string, number>;
}

export const mainInitialState: MainState = {
  mapTool: null,
  panelTools: [],
  activeModal: null,
  errorTicketId: undefined,
  embedFeatures: [],
  selection: null,
  hiddenInfoBars: {},
  shownInfoBars: {},
};

/**
 * Whether the selected feature belongs to `tool` — such a tool keeps the
 * selection when opened, so reaching for a feature's tool from its selection
 * toolbar doesn't throw the selection away.
 */
function ownsSelection(tool: Tool, selection: Selection | null): boolean {
  switch (selection?.type) {
    case 'draw-points':
      return tool === 'draw-points';

    case 'draw-line-poly':
    case 'line-point':
      return tool === 'draw-lines' || tool === 'draw-polygons';

    case 'objects':
      return tool === 'objects';

    case 'tracking':
      return tool === 'tracking';

    case 'route-point':
    case 'route-leg':
      return tool === 'route-planner';

    default:
      return false;
  }
}

/**
 * The tool a conversion to drawing was reached for from — its toolbar acted on
 * features that are a drawing now, so it goes with them. A search result is
 * converted from its selection toolbar, which belongs to no tool.
 */
const convertSourceTools: Record<
  ReturnType<typeof convertToDrawing>['payload']['type'],
  Tool | undefined
> = {
  objects: 'objects',
  'objects-geometry': 'objects',
  'planned-route': 'route-planner',
  track: 'import-file',
  changesets: 'changesets',
  'search-result': undefined,
};

export const mainReducer = createReducer(mainInitialState, (builder) => {
  builder
    .addCase(openTool, (state, action) => {
      if (window.fmEmbedded) {
        return;
      }

      const tool = action.payload;

      if (!isMapClickTool(tool)) {
        if (!state.panelTools.includes(tool)) {
          state.panelTools.push(tool);
        }

        return;
      }

      // Taking the map-click slot from another tool leaves the selected feature
      // behind; reopening the one the feature belongs to keeps it, so reaching
      // for a feature's tool from its selection toolbar doesn't throw the
      // selection away. Opening a toolbar-only tool says nothing about the
      // selection at all.
      if (tool !== state.mapTool && !ownsSelection(tool, state.selection)) {
        state.selection = null;
      }

      state.mapTool = tool;
    })
    .addCase(closeTool, (state, action) => {
      const tool = action.payload;

      if (state.mapTool === tool) {
        state.mapTool = null;
      }

      if (state.panelTools.includes(tool)) {
        state.panelTools = state.panelTools.filter((t) => t !== tool);
      }
    })
    .addCase(clearMapFeatures, (state) => {
      state.selection = null;
    })
    .addCase(setActiveModal, (state, action) => {
      state.activeModal = action.payload;
    })
    .addCase(documentShow, (state, action) => {
      state.activeModal = action.payload
        ? { type: 'document', key: action.payload }
        : null;
    })
    .addCase(setErrorTicketId, (state, action) => {
      state.errorTicketId = action.payload;
    })
    .addCase(setEmbedFeatures, (state, action) => {
      state.embedFeatures = action.payload;
    })
    .addCase(drawingLineContinue, (state, action) => {
      state.selection = {
        type: 'draw-line-poly',
        id: action.payload.lineIndex,
      };
    })
    // Only a result selects: clearing one leaves the selection to whoever
    // cleared it, so a `search` selection can't outlive the result behind it.
    .addCase(searchSelectResult, (state, action) => {
      if (action.payload) {
        state.selection = {
          type: 'search',
        };
      }
    })
    .addCase(selectFeature, (state, action) => {
      if (
        window.fmEmbedded &&
        action.payload &&
        action.payload.type !== 'tracking'
      ) {
        return;
      }

      state.selection = action.payload;
    })
    .addCase(convertToDrawing, (state, action) => {
      const source = convertSourceTools[action.payload.type];

      if (state.mapTool === source) {
        state.mapTool = null;
      }

      if (source && state.panelTools.includes(source)) {
        state.panelTools = state.panelTools.filter((t) => t !== source);
      }
    })
    .addCase(drawingLineJoinFinish, (state, { payload }) => {
      state.selection = payload.selection;
    })
    .addCase(drawingLineAddPoint, (state, { payload }) => {
      state.selection = {
        type: 'draw-line-poly',
        id: payload.indexOfLineToSelect,
      };
    })
    .addCase(drawingPointAdd, (state, { payload }) => {
      state.selection = {
        type: 'draw-points',
        id: payload.id,
      };
    })
    .addCase(drawingLineSetLines, (state) => {
      state.selection =
        state.selection?.type === 'line-point'
          ? { type: 'draw-line-poly', id: state.selection.lineIndex }
          : null;
    })
    .addCase(hideInfoBar, (state, action) => {
      state.hiddenInfoBars[action.payload.key] = action.payload.ts;
    })
    .addCase(infoBarShown, (state, action) => {
      state.shownInfoBars[action.payload.key] = action.payload.ts;
    })
    .addCase(routePlannerAddPoint, (state, action) => {
      return {
        ...state,
        selection: { type: 'route-point', id: action.payload.position + 1 },
      };
    })
    // The route's own toolbar deletes it directly, so what it deletes must not
    // stay selected. Only a route selection goes: `convertToDrawing` deletes the
    // route too, after selecting the drawing line it turned into.
    .addCase(routePlannerDelete, (state) => {
      if (
        state.selection?.type === 'route-point' ||
        state.selection?.type === 'route-leg'
      ) {
        state.selection = null;
      }
    })
    .addCase(routePlannerSetPoint, (state, action) => {
      return action.payload.preventSelect
        ? state
        : {
            ...state,
            selection: { type: 'route-point', id: action.payload.position },
          };
    })
    .addMatcher(isAnyOf(drawingLineSetLines, deleteFeature), (state) => {
      state.selection =
        state.selection?.type === 'line-point'
          ? { type: 'draw-line-poly', id: state.selection.lineIndex }
          : null;
    })
    .addMatcher(
      isAnyOf(
        authWithFacebook,
        authWithGoogle,
        authWithPopupOAuth,
        authWithGarmin,
        authWithApple,
      ),
      (state) => {
        state.activeModal = null; // state.activeModal === 'login' ? null : state.activeModal
      },
    );
});

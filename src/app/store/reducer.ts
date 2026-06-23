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
  drawingLineStopDrawing,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingPointAdd } from '@features/drawing/model/actions/drawingPointActions.js';
import {
  routePlannerAddPoint,
  routePlannerSetPoint,
} from '@features/routePlanner/model/actions.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  dedupeOpenTools,
  isDrawTool,
  isMapClickTool,
} from '@shared/toolDefinitions.js';
import {
  ActiveModal,
  clearMapFeatures,
  convertToDrawing,
  deleteFeature,
  hideInfoBar,
  Selection,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setErrorTicketId,
  setTool,
  setTools,
  Tool,
} from './actions.js';

export interface MainState {
  tools: Tool[];
  /** The focused tool whose toolbar is highlighted; the click owner if it's a map-click tool. */
  activeTool: Tool | null;
  activeModal: ActiveModal | null;
  errorTicketId: string | undefined;
  embedFeatures: string[];
  selection: Selection | null;
  hiddenInfoBars: Record<string, number>;
}

export const mainInitialState: MainState = {
  tools: [],
  activeTool: null,
  activeModal: null,
  errorTicketId: undefined,
  embedFeatures: [],
  selection: null,
  hiddenInfoBars: {},
};

export const mainReducer = createReducer(mainInitialState, (builder) => {
  builder
    .addCase(setTool, (state, action) => {
      if (window.fmEmbedded) {
        return;
      }

      const { tool, mode } = action.payload;

      if (mode === 'close') {
        state.tools = state.tools.filter((t) => t !== tool);

        if (state.activeTool === tool) {
          state.activeTool = null;
        }

        return;
      }

      // open / activate: ensure the tool is open, keeping the order tools were
      // opened in (already-open keeps its slot). The draw-* tools share one menu,
      // so a new draw tool replaces the open one in place.
      const drawIndex = isDrawTool(tool)
        ? state.tools.findIndex(isDrawTool)
        : -1;

      if (drawIndex >= 0) {
        state.tools[drawIndex] = tool;
      } else if (!state.tools.includes(tool)) {
        state.tools.push(tool);
      }

      if (mode === 'activate') {
        // Focus it (overlays can't be active); a tool and a selection are
        // mutually exclusive, so drop the selection.
        state.activeTool = isMapClickTool(tool) ? tool : null;
        state.selection = null;
      } else if (state.activeTool === tool) {
        // mode 'open' is passive — deactivate this tool if it was the active one.
        state.activeTool = null;
      }
    })
    .addCase(setTools, (state, action) => {
      const tools = dedupeOpenTools(action.payload);

      state.tools = tools;

      state.activeTool = tools.filter(isMapClickTool).at(-1) ?? null;
    })
    .addCase(drawingLineStopDrawing, (state) => {
      state.tools = state.tools.filter((t) => !isDrawTool(t));

      if (state.activeTool && isDrawTool(state.activeTool)) {
        state.activeTool = null;
      }
    })
    .addCase(clearMapFeatures, (state) => {
      state.selection = null;
    })
    .addCase(setActiveModal, (state, action) => {
      state.activeModal =
        typeof action.payload === 'string'
          ? ({ type: action.payload } as ActiveModal)
          : action.payload;
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
    .addCase(searchSelectResult, (state) => {
      state.selection = {
        type: 'search',
      };
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

      // Selecting a feature is the active thing now — deactivate any tool (its
      // toolbar stays open, just unfocused).
      if (action.payload) {
        state.activeTool = null;
      }
    })
    .addCase(convertToDrawing, (state) => {
      state.tools = [];
      state.activeTool = null;
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
    .addCase(routePlannerAddPoint, (state, action) => {
      return {
        ...state,
        selection: { type: 'route-point', id: action.payload.position + 1 },
      };
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

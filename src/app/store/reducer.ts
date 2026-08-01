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
import {
  clearMapFeatures,
  convertToDrawing,
  deleteFeature,
  hideInfoBar,
  infoBarShown,
  type Selection,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setErrorTicketId,
  setTool,
  type Tool,
} from './actions.js';
import type { ActiveModal } from './activeModal.js';

export interface MainState {
  /** The open tool — at most one, and the owner of map clicks when it takes them. */
  tool: Tool | null;
  activeModal: ActiveModal | null;
  errorTicketId: string | undefined;
  embedFeatures: string[];
  selection: Selection | null;
  hiddenInfoBars: Record<string, number>;
  shownInfoBars: Record<string, number>;
}

export const mainInitialState: MainState = {
  tool: null,
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

export const mainReducer = createReducer(mainInitialState, (builder) => {
  builder
    .addCase(setTool, (state, action) => {
      if (window.fmEmbedded) {
        return;
      }

      const tool = action.payload;

      // Switching to another tool leaves the selected feature behind; closing
      // the tool (or reopening the one the feature belongs to) keeps it.
      if (
        tool &&
        tool !== state.tool &&
        !ownsSelection(tool, state.selection)
      ) {
        state.selection = null;
      }

      state.tool = tool;
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
    })
    .addCase(convertToDrawing, (state) => {
      state.tool = null;
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

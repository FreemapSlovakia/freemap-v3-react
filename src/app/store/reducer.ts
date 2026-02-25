import {
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithOsm,
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
  clearMapFeatures,
  convertToDrawing,
  deleteFeature,
  enableUpdatingUrl,
  hideInfoBar,
  Modal,
  Selection,
  selectFeature,
  setActiveModal,
  setEmbedFeatures,
  setErrorTicketId,
  setTool,
  Tool,
} from './actions.js';

export interface MainState {
  tool: Tool | null;
  activeModal: Modal | null;
  urlUpdatingEnabled: boolean;
  errorTicketId: string | undefined;
  embedFeatures: string[];
  selection: Selection | null;
  documentKey: string | null;
  hiddenInfoBars: Record<string, number>;
}

export const mainInitialState: MainState = {
  tool: null,
  activeModal: null,
  urlUpdatingEnabled: false,
  errorTicketId: undefined,
  embedFeatures: [],
  selection: null,
  documentKey: null,
  hiddenInfoBars: {},
};

export const mainReducer = createReducer(mainInitialState, (builder) => {
  builder
    .addCase(setTool, (state, action) => {
      if (window.fmEmbedded) {
        return;
      }

      state.selection =
        action.payload === state.tool || action.payload === null
          ? state.selection
          : null;

      state.tool = action.payload;
    })
    .addCase(drawingLineStopDrawing, (state) => {
      state.tool = null;
    })
    .addCase(clearMapFeatures, (state) => {
      state.selection = null;
    })
    .addCase(setActiveModal, (state, action) => {
      state.activeModal = action.payload;
    })
    .addCase(documentShow, (state, action) => {
      state.documentKey = action.payload;

      if (action.payload) {
        state.activeModal = null;
      }
    })
    .addCase(enableUpdatingUrl, (state, action) => {
      state.urlUpdatingEnabled = action.payload;
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

      if (action.payload?.type === 'objects' && state.tool !== 'objects') {
        state.tool = 'objects';
      }
      // else if (
      //   state.tool !== 'objects' &&
      //   state.tool !== 'changesets' &&
      //   state.tool !== 'track-viewer' &&
      //   (state.tool !== 'route-planner' ||
      //     (action.payload?.type !== 'route-point' &&
      //       action.payload?.type !== 'route-leg')) &&
      //   action.payload !== null
      // ) {
      //   state.tool = null;
      // }
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
      isAnyOf(authWithFacebook, authWithGoogle, authWithOsm, authWithGarmin),
      (state) => {
        state.activeModal = null; // state.activeModal === 'login' ? null : state.activeModal
      },
    );
});

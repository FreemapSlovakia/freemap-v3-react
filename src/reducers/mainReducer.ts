import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  authLogout,
  authSetUser,
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithOsm,
} from '../actions/authActions.js';
import {
  drawingLineAddPoint,
  drawingLineChangeProperties,
  drawingLineContinue,
  drawingLineJoinFinish,
  drawingLineSetLines,
  drawingLineStopDrawing,
} from '../actions/drawingLineActions.js';
import {
  drawingPointAdd,
  drawingPointChangeProperties,
} from '../actions/drawingPointActions.js';
import {
  applyCookieConsent,
  applySettings,
  clearMapFeatures,
  convertToDrawing,
  deleteFeature,
  documentShow,
  enableUpdatingUrl,
  hideInfoBar,
  Modal,
  purchaseOnLogin,
  saveHomeLocation,
  selectFeature,
  Selection,
  setActiveModal,
  setAnalyticCookiesAllowed,
  setEmbedFeatures,
  setErrorTicketId,
  setLocation,
  setSelectingHomeLocation,
  setTool,
  startProgress,
  stopProgress,
  toggleLocate,
  Tool,
} from '../actions/mainActions.js';
import { Purchase } from '../types/auth.js';
import type { LatLon } from '../types/common.js';

interface Location extends LatLon {
  accuracy: number;
}

export interface MainState {
  tool: Tool | null;
  activeModal: Modal | null;
  homeLocation: LatLon | null;
  progress: Array<string | number>;
  location: Location | null;
  locate: boolean;
  selectingHomeLocation: LatLon | null | false;
  urlUpdatingEnabled: boolean;
  errorTicketId: string | undefined;
  embedFeatures: string[];
  selection: Selection | null;
  cookieConsentResult: boolean | null; // true if analyticCookiesAllowed; false if not; null if no cookies accepted
  analyticCookiesAllowed: boolean; // NOTE this is a local "thing"
  purchaseOnLogin: Purchase | undefined;
  documentKey: string | null;
  hiddenInfoBars: Record<string, number>;
  drawingColor: string;
  drawingWidth: number;
  drawingRecentColors: string[];
}

export const mainInitialState: MainState = {
  tool: null,
  activeModal: null,
  homeLocation: null,
  progress: [],
  location: null,
  locate: false,
  selectingHomeLocation: false,
  urlUpdatingEnabled: false,
  errorTicketId: undefined,
  embedFeatures: [],
  selection: null,
  cookieConsentResult: null,
  analyticCookiesAllowed: true, // NOTE this is a local "thing" used only for applyCookieConsent action
  purchaseOnLogin: undefined,
  documentKey: null,
  hiddenInfoBars: {},
  drawingColor: '#ff00ff',
  drawingWidth: 4,
  drawingRecentColors: [],
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
    .addCase(authSetUser, (state, action) => {
      if (action.payload?.lat != null && action.payload?.lon != null) {
        state.homeLocation = {
          lat: action.payload?.lat,
          lon: action.payload?.lon,
        };
      }
    })
    .addCase(authLogout, (state) => ({ ...state, homeLocation: null }))
    .addCase(setActiveModal, (state, action) => {
      state.activeModal = action.payload;

      if (!action.payload) {
        state.purchaseOnLogin = undefined;
      }
    })
    .addCase(startProgress, (state, action) => {
      state.progress.push(action.payload);
    })
    .addCase(stopProgress, (state, action) => {
      state.progress = state.progress.filter((pid) => pid !== action.payload);
    })
    .addCase(setLocation, (state, action) => {
      state.location = {
        lat: action.payload.lat,
        lon: action.payload.lon,
        accuracy: action.payload.accuracy,
      };
    })
    .addCase(toggleLocate, (state, action) => {
      state.locate = action.payload ?? !state.locate;

      state.location = null;
    })
    .addCase(setSelectingHomeLocation, (state, action) => {
      state.selectingHomeLocation =
        action.payload === true ? state.homeLocation : action.payload;
    })
    .addCase(saveHomeLocation, (state) => {
      state.selectingHomeLocation = false;

      state.homeLocation = state.selectingHomeLocation || null;
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
    .addCase(selectFeature, (state, action) => {
      if (
        window.fmEmbedded &&
        action.payload &&
        action.payload.type !== 'tracking'
      ) {
        return;
      }

      state.selection = action.payload;

      if (
        state.tool !== 'objects' &&
        state.tool !== 'changesets' &&
        state.tool !== 'track-viewer' &&
        (state.tool !== 'route-planner' ||
          action.payload?.type !== 'route-point') &&
        action.payload !== null
      ) {
        state.tool = null;
      }
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
    .addCase(applyCookieConsent, (state) => {
      state.cookieConsentResult = state.analyticCookiesAllowed;
    })
    .addCase(setAnalyticCookiesAllowed, (state, action) => {
      state.analyticCookiesAllowed = action.payload;
    })
    .addCase(purchaseOnLogin, (state, action) => {
      state.purchaseOnLogin = action.payload;
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
    .addCase(applySettings, (state, action) => {
      const newState = { ...state };

      const color = action.payload.drawingColor;

      if (action.payload.drawingColor) {
        newState.drawingColor = action.payload.drawingColor;
      }

      if (action.payload.drawingWidth) {
        newState.drawingWidth = action.payload.drawingWidth;
      }

      if (color) {
        updateRecentDrawingColors(newState, color);
      }

      return newState;
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
    )
    .addMatcher(
      isAnyOf(drawingLineChangeProperties, drawingPointChangeProperties),
      (state, { payload }) => {
        const color = payload.properties.color;

        return color ? updateRecentDrawingColors(state, color) : state;
      },
    );
});

function updateRecentDrawingColors(state: MainState, drawingColor: string) {
  state.drawingRecentColors = state.drawingRecentColors.filter(
    (color) => color !== drawingColor,
  );

  state.drawingRecentColors.unshift(drawingColor);

  state.drawingRecentColors.splice(12, Infinity);
}

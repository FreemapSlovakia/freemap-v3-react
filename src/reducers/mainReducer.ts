import { createReducer, isAnyOf } from '@reduxjs/toolkit';
import {
  authWithFacebook,
  authWithGarmin,
  authWithGoogle,
  authWithOsm,
  authLogout,
  authSetUser,
} from 'fm3/actions/authActions';
import {
  drawingLineAddPoint,
  drawingLineChangeProperties,
  drawingLineContinue,
  drawingLineJoinFinish,
  drawingLineSetLines,
  drawingLineStopDrawing,
} from 'fm3/actions/drawingLineActions';
import {
  drawingPointAdd,
  drawingPointChangeProperties,
} from 'fm3/actions/drawingPointActions';
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
  removeAdsOnLogin,
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
} from 'fm3/actions/mainActions';
import { DocumentKey } from 'fm3/documents';
import { LatLon } from 'fm3/types/common';
import { produce } from 'immer';

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
  removeAdsOnLogin: boolean;
  documentKey: DocumentKey | null;
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
  removeAdsOnLogin: false,
  documentKey: null,
  hiddenInfoBars: {},
  drawingColor: '#ff00ff',
  drawingWidth: 4,
  drawingRecentColors: [],
};

export const mainReducer = createReducer(mainInitialState, (builder) => {
  builder
    .addCase(setTool, (state, action) => {
      return window.fmEmbedded
        ? state
        : {
            ...state,
            tool: action.payload,
            selection:
              action.payload === state.tool || action.payload === null
                ? state.selection
                : null,
          };
    })
    .addCase(drawingLineStopDrawing, (state) => {
      return {
        ...state,
        tool: null,
      };
    })
    .addCase(clearMapFeatures, (state) => {
      return {
        ...state,
        selection: null,
      };
    })
    .addCase(authSetUser, (state, action) => {
      const p = action.payload;

      return {
        ...state,
        homeLocation: !p
          ? state.homeLocation
          : p.lat && p.lon
            ? { lat: p.lat, lon: p.lon }
            : null,
      };
    })
    .addCase(authLogout, (state) => ({ ...state, homeLocation: null }))
    .addCase(setActiveModal, (state, action) => ({
      ...state,
      activeModal: action.payload,
      removeAdsOnLogin: action.payload ? state.removeAdsOnLogin : false,
    }))
    .addCase(authSetUser, (state, action) => ({
      ...state,
      homeLocation:
        action.payload?.lat != null && action.payload?.lon != null
          ? { lat: action.payload?.lat, lon: action.payload?.lon }
          : state.homeLocation,
    }))
    .addCase(startProgress, (state, action) => ({
      ...state,
      progress: [...state.progress, action.payload],
    }))
    .addCase(stopProgress, (state, action) => ({
      ...state,
      progress: state.progress.filter((pid) => pid !== action.payload),
    }))
    .addCase(setLocation, (state, action) => ({
      ...state,
      location: {
        lat: action.payload.lat,
        lon: action.payload.lon,
        accuracy: action.payload.accuracy,
      },
    }))
    .addCase(toggleLocate, (state, action) => ({
      ...state,
      locate: action.payload ?? !state.locate,
      location: null,
    }))
    .addCase(setSelectingHomeLocation, (state, action) => ({
      ...state,
      selectingHomeLocation:
        action.payload === true ? state.homeLocation : action.payload,
    }))
    .addCase(saveHomeLocation, (state) => ({
      ...state,
      selectingHomeLocation: false,
      homeLocation: state.selectingHomeLocation || null,
    }))
    .addCase(documentShow, (state) => ({
      ...state,
      activeModal: 'tips',
    }))
    .addCase(enableUpdatingUrl, (state) => ({
      ...state,
      urlUpdatingEnabled: true,
    }))
    .addCase(setErrorTicketId, (state, action) => ({
      ...state,
      errorTicketId: action.payload,
    }))
    .addCase(setEmbedFeatures, (state, action) => ({
      ...state,
      embedFeatures: action.payload,
    }))
    .addCase(drawingLineContinue, (state, action) => ({
      ...state,
      selection: { type: 'draw-line-poly', id: action.payload.lineIndex },
    }))
    .addCase(selectFeature, (state, action) =>
      window.fmEmbedded
        ? state
        : {
            ...state,
            selection: action.payload,
            tool:
              state.tool === 'objects' ||
              state.tool === 'changesets' ||
              state.tool === 'track-viewer' ||
              (action.payload === null && state.tool !== 'route-planner')
                ? /* && state.tool !== 'track-viewer' */
                  state.tool
                : null,
          },
    )
    .addCase(convertToDrawing, (state) => ({
      ...state,
      tool: null,
    }))
    .addCase(drawingLineJoinFinish, (state, { payload }) => ({
      ...state,
      selection: payload.selection,
    }))
    .addCase(drawingLineAddPoint, (state, { payload }) => ({
      ...state,

      selection: {
        type: 'draw-line-poly',
        id: payload.id,
      },
    }))
    .addCase(drawingPointAdd, (state, { payload }) => ({
      ...state,

      selection: {
        type: 'draw-points',
        id: payload.id,
      },
    }))
    .addCase(applyCookieConsent, (state) => ({
      ...state,
      cookieConsentResult: state.analyticCookiesAllowed,
    }))
    .addCase(setAnalyticCookiesAllowed, (state, action) => ({
      ...state,
      analyticCookiesAllowed: action.payload,
    }))
    .addCase(removeAdsOnLogin, (state) => ({
      ...state,
      removeAdsOnLogin: true,
    }))
    .addCase(drawingLineSetLines, (state) => ({
      ...state,
      selection:
        state.selection?.type === 'line-point'
          ? { type: 'draw-line-poly', id: state.selection.lineIndex }
          : null,
    }))
    .addCase(documentShow, (state, action) => {
      return {
        ...state,
        documentKey: action.payload === null ? null : action.payload,
        activeModal: action.payload === null ? state.activeModal : null,
      };
    })
    .addCase(hideInfoBar, (state, action) => {
      return {
        ...state,
        hiddenInfoBars: {
          ...state.hiddenInfoBars,
          [action.payload.key]: action.payload.ts,
        },
      };
    })
    .addCase(applySettings, (state, action) => {
      const newState = { ...state };

      if (action.payload.drawingColor) {
        newState.drawingColor = action.payload.drawingColor;
      }

      if (action.payload.drawingWidth) {
        newState.drawingWidth = action.payload.drawingWidth;
      }

      return newState;
    })

    .addCase(applySettings, (state, { payload }) => {
      const color = payload.drawingColor;

      return color ? updateRecentDrawingColors(state, color) : state;
    })
    .addMatcher(isAnyOf(drawingLineSetLines, deleteFeature), (state) => ({
      ...state,
      selection:
        state.selection?.type === 'line-point'
          ? { type: 'draw-line-poly', id: state.selection.lineIndex }
          : null,
    }))
    .addMatcher(
      isAnyOf(authWithFacebook, authWithGoogle, authWithOsm, authWithGarmin),
      (state) => ({
        ...state,
        // activeModal: state.activeModal === 'login' ? null : state.activeModal,
        activeModal: null,
      }),
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
  return produce(state, (draft) => {
    draft.drawingRecentColors = draft.drawingRecentColors.filter(
      (color) => color !== drawingColor,
    );

    draft.drawingRecentColors.unshift(drawingColor);

    draft.drawingRecentColors.splice(12, Infinity);
  });
}

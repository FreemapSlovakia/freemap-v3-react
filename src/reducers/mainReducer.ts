import { RootAction } from 'fm3/actions';
import {
  authLoginWithFacebook,
  authLoginWithGoogle,
  authLoginWithOsm,
  authLogout,
  authSetUser,
} from 'fm3/actions/authActions';
import {
  drawingLineContinue,
  drawingLineSetLines,
  drawingLineStopDrawing,
} from 'fm3/actions/drawingLineActions';
import {
  applyCookieConsent,
  clearMap,
  convertToDrawing,
  deleteFeature,
  documentShow,
  enableUpdatingUrl,
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
import { createReducer } from 'typesafe-actions';

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
};

export const mainReducer = createReducer<MainState, RootAction>(
  mainInitialState,
)
  .handleAction(setTool, (state, action) => {
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
  .handleAction(drawingLineStopDrawing, (state) => {
    return {
      ...state,
      tool: null,
    };
  })
  .handleAction(clearMap, (state) => {
    return {
      ...state,
      selection: null,
    };
  })
  .handleAction(authSetUser, (state, action) => {
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
  .handleAction(authLogout, (state) => ({ ...state, homeLocation: null }))
  .handleAction(setActiveModal, (state, action) => ({
    ...state,
    activeModal: action.payload,
    removeAdsOnLogin: action.payload ? state.removeAdsOnLogin : false,
  }))
  .handleAction(authSetUser, (state, action) => ({
    ...state,
    homeLocation:
      action.payload?.lat != null && action.payload?.lon != null
        ? { lat: action.payload?.lat, lon: action.payload?.lon }
        : state.homeLocation,
  }))
  .handleAction(startProgress, (state, action) => ({
    ...state,
    progress: [...state.progress, action.payload],
  }))
  .handleAction(stopProgress, (state, action) => ({
    ...state,
    progress: state.progress.filter((pid) => pid !== action.payload),
  }))
  .handleAction(setLocation, (state, action) => ({
    ...state,
    location: {
      lat: action.payload.lat,
      lon: action.payload.lon,
      accuracy: action.payload.accuracy,
    },
  }))
  .handleAction(toggleLocate, (state) => ({
    ...state,
    locate: !state.locate,
    location: null,
  }))
  .handleAction(setSelectingHomeLocation, (state, action) => ({
    ...state,
    selectingHomeLocation:
      action.payload === true ? state.homeLocation : action.payload,
  }))
  .handleAction(saveHomeLocation, (state) => ({
    ...state,
    selectingHomeLocation: false,
    homeLocation: state.selectingHomeLocation || null,
  }))
  .handleAction(documentShow, (state) => ({
    ...state,
    activeModal: 'tips',
  }))
  .handleAction(enableUpdatingUrl, (state) => ({
    ...state,
    urlUpdatingEnabled: true,
  }))
  .handleAction(setErrorTicketId, (state, action) => ({
    ...state,
    errorTicketId: action.payload,
  }))
  .handleAction(setEmbedFeatures, (state, action) => ({
    ...state,
    embedFeatures: action.payload,
  }))
  .handleAction(drawingLineContinue, (state, action) => ({
    ...state,
    selection: { type: 'draw-line-poly', id: action.payload.lineIndex },
  }))
  .handleAction(selectFeature, (state, action) =>
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
  .handleAction(convertToDrawing, (state) => ({
    ...state,
    tool: null,
  }))
  .handleAction(applyCookieConsent, (state) => ({
    ...state,
    cookieConsentResult: state.analyticCookiesAllowed,
  }))
  .handleAction(setAnalyticCookiesAllowed, (state, action) => ({
    ...state,
    analyticCookiesAllowed: action.payload,
  }))
  .handleAction(removeAdsOnLogin, (state) => ({
    ...state,
    removeAdsOnLogin: true,
  }))
  .handleAction([drawingLineSetLines, deleteFeature], (state) => ({
    ...state,
    selection:
      state.selection?.type === 'line-point'
        ? { type: 'draw-line-poly', id: state.selection.lineIndex }
        : null,
  }))
  .handleAction(
    [authLoginWithFacebook, authLoginWithGoogle, authLoginWithOsm],
    (state) => ({
      ...state,
      activeModal: null,
    }),
  )
  .handleAction(documentShow, (state, action) => {
    return {
      ...state,
      documentKey: action.payload === null ? null : action.payload,
      activeModal: action.payload === null ? state.activeModal : null,
    };
  });

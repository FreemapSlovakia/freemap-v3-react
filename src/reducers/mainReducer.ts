import { RootAction } from 'fm3/actions';
import { authLogout, authSetUser } from 'fm3/actions/authActions';
import { drawingLineSetLines } from 'fm3/actions/drawingLineActions';
import {
  clearMap,
  convertToDrawing,
  deleteFeature,
  enableUpdatingUrl,
  selectFeature,
  Selection,
  setActiveModal,
  setAppState,
  setEmbedFeatures,
  setErrorTicketId,
  setExpertMode,
  setHomeLocation,
  setLocation,
  setSelectingHomeLocation,
  setTool,
  startProgress,
  stopProgress,
  toggleLocate,
  Tool,
} from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';
import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';

const embed = window.self !== window.top;

interface Location extends LatLon {
  accuracy: number;
}

export interface MainState {
  tool: Tool | null;
  activeModal: string | null;
  homeLocation: LatLon | null;
  progress: Array<string | number>;
  location: Location | null;
  expertMode: boolean;
  locate: boolean;
  selectingHomeLocation: boolean;
  urlUpdatingEnabled: boolean;
  errorTicketId: string | undefined;
  eleSmoothingFactor: number;
  embedFeatures: string[];
  selection: Selection | null;
}

const initialState: MainState = {
  tool: null,
  activeModal: null,
  homeLocation: null,
  progress: [],
  location: null,
  expertMode: false,
  locate: false,
  selectingHomeLocation: false,
  urlUpdatingEnabled: false,
  errorTicketId: undefined,
  eleSmoothingFactor: 5,
  embedFeatures: [],
  selection: null,
};

export const mainReducer = createReducer<MainState, RootAction>(initialState)
  .handleAction(setTool, (state, action) => {
    return embed
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
  .handleAction(clearMap, (state) => {
    return {
      ...state,
      selection: null,
    };
  })
  .handleAction(setAppState, (state, action) => {
    return { ...state, ...action.payload.main };
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
      expertMode:
        p?.settings?.expertMode !== undefined
          ? p.settings.expertMode
          : state.expertMode,
      eleSmoothingFactor:
        p?.settings?.trackViewerEleSmoothingFactor !== undefined
          ? p.settings.trackViewerEleSmoothingFactor
          : state.eleSmoothingFactor,
    };
  })
  .handleAction(authLogout, (state) => ({ ...state, homeLocation: null }))
  .handleAction(setActiveModal, (state, action) => ({
    ...state,
    activeModal: action.payload,
  }))
  .handleAction(setHomeLocation, (state, action) => ({
    ...state,
    homeLocation: action.payload ? { ...action.payload } : null,
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
  .handleAction(setExpertMode, (state, action) => ({
    ...state,
    expertMode: action.payload,
  }))
  .handleAction(setSelectingHomeLocation, (state, action) => ({
    ...state,
    selectingHomeLocation: action.payload,
  }))
  .handleAction(tipsShow, (state) => ({
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
  .handleAction(trackViewerSetEleSmoothingFactor, (state, action) => ({
    ...state,
    eleSmoothingFactor: action.payload,
  }))
  .handleAction(setEmbedFeatures, (state, action) => ({
    ...state,
    embedFeatures: action.payload,
  }))
  .handleAction(selectFeature, (state, action) =>
    embed
      ? state
      : {
          ...state,
          selection: action.payload,
          tool:
            action.payload === null &&
            state.tool !==
              'route-planner' /* && state.tool !== 'track-viewer' */
              ? state.tool
              : null,
        },
  )
  .handleAction(convertToDrawing, (state) => ({
    ...state,
    tool: null,
  }))
  .handleAction([drawingLineSetLines, deleteFeature], (state) => ({
    ...state,
    selection: null,
  }));

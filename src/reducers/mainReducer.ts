import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  setAppState,
  setActiveModal,
  setHomeLocation,
  startProgress,
  stopProgress,
  setLocation,
  setExpertMode,
  setSelectingHomeLocation,
  enableUpdatingUrl,
  setErrorTicketId,
  setEmbedFeatures,
  toggleLocate,
  selectFeature,
  deleteFeature,
  Selection,
  clearMap,
} from 'fm3/actions/mainActions';
import { authSetUser, authLogout } from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';
import { distanceMeasurementSetPoints } from 'fm3/actions/distanceMeasurementActions';

interface Location extends LatLon {
  accuracy: number;
}

export interface MainState {
  activeModal: string | null;
  homeLocation: LatLon | null;
  progress: Array<string | number>;
  location: Location | null;
  expertMode: boolean;
  locate: boolean;
  selectingHomeLocation: boolean;
  urlUpdatingEnabled: boolean;
  errorTicketId: string | null;
  eleSmoothingFactor: number;
  embedFeatures: string[];
  selection: Selection | null;
}

const initialState: MainState = {
  activeModal: null,
  homeLocation: null,
  progress: [],
  location: null,
  expertMode: false,
  locate: false,
  selectingHomeLocation: false,
  urlUpdatingEnabled: false,
  errorTicketId: null,
  eleSmoothingFactor: 5,
  embedFeatures: [],
  selection: null,
};

export const mainReducer = createReducer<MainState, RootAction>(initialState)
  .handleAction(clearMap, state => {
    return {
      ...state,
      selection: state.selection ? { type: state.selection.type } : null,
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
  .handleAction(authLogout, state => ({ ...state, homeLocation: null }))
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
    progress: state.progress.filter(pid => pid !== action.payload),
  }))
  .handleAction(setLocation, (state, action) => ({
    ...state,
    location: {
      lat: action.payload.lat,
      lon: action.payload.lon,
      accuracy: action.payload.accuracy,
    },
  }))
  .handleAction(toggleLocate, state => ({
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
  .handleAction(tipsShow, state => ({
    ...state,
    activeModal: 'tips',
  }))
  .handleAction(enableUpdatingUrl, state => ({
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
  .handleAction(selectFeature, (state, action) => ({
    ...state,
    selection: action.payload,
  }))
  .handleAction([distanceMeasurementSetPoints, deleteFeature], state => ({
    ...state,
    selection: state.selection ? { type: state.selection.type } : null,
  }));

import { LatLon } from 'fm3/types/common';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  mainLoadState,
  setActiveModal,
  setTool,
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
} from 'fm3/actions/mainActions';
import { authSetUser, authLogout } from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { trackViewerSetEleSmoothingFactor } from 'fm3/actions/trackViewerActions';

export interface IMainState {
  activeModal: string | null;
  tool: string | null;
  homeLocation: LatLon | null;
  progress: Array<string | number>;
  location: LatLon | null;
  expertMode: boolean;
  locate: boolean;
  selectingHomeLocation: boolean;
  urlUpdatingEnabled: boolean;
  errorTicketId: string | null;
  eleSmoothingFactor: number;
  embedFeatures: string[];
}

const initialState: IMainState = {
  activeModal: null,
  tool: null,
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
};

export default createReducer<IMainState, RootAction>(initialState)
  .handleAction(mainLoadState, (state, action) => {
    const s = { ...state };
    const { homeLocation, expertMode } = action.payload;
    if (
      homeLocation &&
      typeof homeLocation.lat === 'number' &&
      typeof homeLocation.lon === 'number'
    ) {
      s.homeLocation = {
        lat: homeLocation.lat as number,
        lon: homeLocation.lon as number,
      };
    }
    s.expertMode = !!expertMode;
    return s;
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
        p && p.settings && p.settings.expertMode !== undefined
          ? p.settings.expertMode
          : state.expertMode,
      eleSmoothingFactor:
        p &&
        p.settings &&
        p.settings.trackViewerEleSmoothingFactor !== undefined
          ? p.settings.trackViewerEleSmoothingFactor
          : state.eleSmoothingFactor,
    };
  })
  .handleAction(authLogout, state => ({ ...state, homeLocation: null }))
  .handleAction(setActiveModal, (state, action) => ({
    ...state,
    activeModal: action.payload,
  }))
  .handleAction(setTool, (state, action) => ({
    ...state,
    tool: action.payload,
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
  }));

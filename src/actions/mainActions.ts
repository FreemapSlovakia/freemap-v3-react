import { createStandardAction, createAction } from 'typesafe-actions';
import { LatLon } from 'fm3/types/common';

export const setActiveModal = createStandardAction('SET_ACTIVE_MODAL')<
  string | null
>();

export const setTool = createStandardAction('SET_TOOL')<string | null>();

export const setHomeLocation = createStandardAction('SET_HOME_LOCATION')<{
  lat: number;
  lon: number;
}>();

export const startProgress = createStandardAction('START_PROGRESS')<
  string | number
>();

export const stopProgress = createStandardAction('STOP_PROGRESS')<
  string | number
>();

export const setLocation = createStandardAction('SET_LOCATION')<{
  lat: number;
  lon: number;
  accuracy: number;
}>();

export interface IPdfExportOptions {
  contours: boolean;
  shadedRelief: boolean;
  hikingTrails: boolean;
  bicycleTrails: boolean;
  skiTrails: boolean;
  scale: number;
  area: 'visible' | 'infopoints';
}

export const setExpertMode = createStandardAction('SET_EXPERT_MODE')<boolean>();

export const mainLoadState = createStandardAction('MAIN_LOAD_STATE')<any>();

export const exportGpx = createStandardAction('EXPORT_GPX')<any>();

export const exportPdf = createStandardAction('EXPORT_PDF')<
  IPdfExportOptions
>();

export const clearMap = createAction('CLEAR_MAP');

export const toggleLocate = createAction('LOCATE');

export const setSelectingHomeLocation = createStandardAction(
  'SET_SELECTING_HOME_LOCATION',
)<boolean>();

export const enableUpdatingUrl = createAction('ENABLE_UPDATING_URL');

export const reloadApp = createAction('RELOAD_APP');

export const saveSettings = createStandardAction('SAVE_SETTINGS')<{
  tileFormat: 'png' | 'jpeg';
  homeLocation: LatLon | null;
  overlayOpacity: { [type: string]: number };
  overlayPaneOpacity: number;
  expertMode: boolean;
  trackViewerEleSmoothingFactor: number;
  user: { name: string | null; email: string | null } | null;
  preventTips: boolean;
}>();

export const setErrorTicketId = createStandardAction('SET_ERROR_TICKET_ID')<
  string
>();

export const setEmbedFeatures = createStandardAction('SET_EMBED_FEATURES')<
  any
>();

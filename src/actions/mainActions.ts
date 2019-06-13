import { createStandardAction, createAction } from 'typesafe-actions';

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

export const setExpertMode = createStandardAction('SET_EXPERT_MODE')<boolean>();

export const mainLoadState = createStandardAction('MAIN_LOAD_STATE')<any>();

export const exportGpx = createStandardAction('EXPORT_GPX')<any>();

export const exportPdf = createStandardAction('EXPORT_PDF')<any>();

export const clearMap = createAction('CLEAR_MAP');

export const toggleLocate = createAction('LOCATE');

export const setSelectingHomeLocation = createStandardAction(
  'SET_SELECTING_HOME_LOCATION',
)<any>();

export const enableUpdatingUrl = createAction('ENABLE_UPDATING_URL');

export const saveSettings = createStandardAction('SAVE_SETTINGS')<{
  tileFormat: any;
  homeLocation: any;
  overlayOpacity: number;
  overlayPaneOpacity: number;
  expertMode: boolean;
  trackViewerEleSmoothingFactor: number;
  user: any;
  preventTips: boolean;
}>();

export const setErrorTicketId = createStandardAction('SET_ERROR_TICKET_ID')<
  string
>();

export const setEmbedFeatures = createStandardAction('SET_EMBED_FEATURES')<
  any
>();

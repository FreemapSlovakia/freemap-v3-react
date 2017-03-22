import { createActions } from 'redux-actions';

const { setActivePopup, closePopup, setTool, setHomeLocation, startProgress, stopProgress } = createActions(
  'SET_ACTIVE_POPUP',
  'SET_TOOL',
  'SET_HOME_LOCATION',
  'START_PROGRESS',
  'CLOSE_POPUP',
  'STOP_PROGRESS'
);

export { setActivePopup, closePopup, setTool, setHomeLocation, startProgress, stopProgress };

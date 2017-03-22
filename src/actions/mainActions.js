import { createActions } from 'redux-actions';

const { setActivePopup, closePopup, setTool, setHomeLocation, startProgress, stopProgress } = createActions(
  {
    SET_ACTIVE_POPUP: activePopup => activePopup,
    SET_TOOL: tool => tool,
    SET_HOME_LOCATION: homeLocation => homeLocation
  },
  'START_PROGRESS',
  'CLOSE_POPUP',
  'STOP_PROGRESS'
);

export { setActivePopup, closePopup, setTool, setHomeLocation, startProgress, stopProgress };

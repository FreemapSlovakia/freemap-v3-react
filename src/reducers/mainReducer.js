import { handleActions } from 'redux-actions';

export default handleActions({
  SET_ACTIVE_POPUP: (state, { payload }) => ({ ...state, activePopup: payload }),
  CLOSE_POPUP: state => ({ ...state, activePopup: null }),
  MAP_RESET: state => ({ ...state, tool: null }),
  SET_TOOL: (state, { payload }) => ({ ...state, tool: payload }),
  SET_HOME_LOCATION: (state, { payload }) => ({ ...state, homeLocation: payload }),
  START_PROGRESS: state => ({ ...state, progress: true }),
  STOP_PROGRESS: state => ({ ...state, progress: false })
}, {
  activePopup: null,
  tool: null,
  homeLocation: { lat: null, lon: null },
  progress: false
});

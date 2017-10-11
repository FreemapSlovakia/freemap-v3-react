import { createLogic } from 'redux-logic';
import { infoPointSet } from 'fm3/actions/infoPointActions';

export const infoPointLogic = createLogic({
  type: 'SET_TOOL',
  process({ getState }, dispatch, done) {
    const state = getState();
    const { tool } = state.main;
    const { lat } = state.infoPoint;
    const userOpenedToolButThereIsNoInfoPointYet = tool === 'info-point' && lat === null;
    if (userOpenedToolButThereIsNoInfoPointYet) {
      const mapCenterLat = state.map.lat;
      const mapCenterLon = state.map.lon;
      dispatch(infoPointSet(mapCenterLat, mapCenterLon, null));
    }
    done();
  },
});

export default infoPointLogic;

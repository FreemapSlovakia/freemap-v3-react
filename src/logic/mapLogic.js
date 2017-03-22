import { createLogic } from 'redux-logic';
import { setTool } from 'fm3/actions/mainActions';

export default createLogic({
  type: 'MAP_REFOCUS',
  process({ getState }, dispatch) {
    const { main: { tool }, map: { zoom } } = getState();

    if (zoom < 12 && tool === 'objects') {
      dispatch(setTool(null));
    }
  }
});
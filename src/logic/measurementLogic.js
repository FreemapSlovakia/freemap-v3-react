import { createLogic } from 'redux-logic';
import { distance } from 'fm3/geoutils';

export default createLogic({
  type: 'ADD_MEASUREMENT_POINT',
  transform({ getState, action }, next) {
    const { tool } = getState().main;
    const { points } = getState().measurement;
    let position = points.length;
    if (tool === 'measure-area' && points.length > 2) {
      const newPoint = action.payload.point;
      const distances = points.map(p => {
        return distance(p.lat, p.lon, newPoint.lat, newPoint.lon);
      });
      distances.push(distances[0]); // take into account adding between first and last point
      let minDistance = Infinity;
      for (let i = 1; i < distances.length; i++) {
        const d = distances[i-1] + distances[i];
        if (d < minDistance) {
          minDistance = d;
          position = i;
        }
      }
    }
    next({ ...action, payload: { ...action.payload, position } });
  },
});
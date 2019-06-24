export const loggerMiddleware = ({ getState }) => next => action => {
  console.debug('Action', action); // TODO make switchable
  next(action);
  console.debug('State', getState()); // TODO make switchable
};

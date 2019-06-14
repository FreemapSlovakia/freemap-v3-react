export default process.env.NODE_ENV === 'production'
  ? null
  : ({ getState }) => next => action => {
      console.debug('Action', action);
      next(action);
      console.debug('State', getState());
    };

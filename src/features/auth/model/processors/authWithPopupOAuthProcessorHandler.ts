import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { startPopupOAuth } from '../../startPopupOAuth.js';
import { authWithPopupOAuth } from '../actions.js';

const handle: ProcessorHandler<typeof authWithPopupOAuth> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider, connect } = action.payload;

  await startPopupOAuth(provider, connect, getState, dispatch);
};

export default handle;

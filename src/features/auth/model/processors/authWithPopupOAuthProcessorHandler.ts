import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { startPopupOAuth } from '../../startPopupOAuth.js';
import { authWithPopupOAuth } from '../actions.js';

const handle: ProcessorHandler<typeof authWithPopupOAuth> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider, connect, successAction } = action.payload;

  await startPopupOAuth(provider, connect, getState, dispatch, successAction);
};

export default handle;

import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { startPopupOAuth } from '../../startPopupOAuth.js';
import type { authWithPopupOAuth } from '../actions.js';

const handle: ProcessorHandler<typeof authWithPopupOAuth> = async ({
  action,
  dispatch,
  getState,
}) => {
  const { provider, connect, successAction, scope } = action.payload;

  await startPopupOAuth(
    provider,
    connect,
    getState,
    dispatch,
    successAction,
    scope,
  );
};

export default handle;

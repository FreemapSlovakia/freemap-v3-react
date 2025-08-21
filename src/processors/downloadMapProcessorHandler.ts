import { toastsAdd } from 'actions/toastsActions.js';
import { httpRequest } from 'httpRequest.js';
import { downloadMap, setActiveModal } from '../actions/mainActions.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';

const handle: ProcessorHandler<typeof downloadMap> = async ({
  dispatch,
  getState,
  action,
}) => {
  const sp = new URLSearchParams();
  sp.append('map', action.payload.map);
  sp.append('format', action.payload.format);
  sp.append('scale', String(action.payload.scale ?? 1));

  window._paq.push([
    'trackEvent',
    'DownloadMap',
    'downloadMapStart',
    JSON.stringify(sp.toString()),
  ]);

  await httpRequest({
    getState,
    method: 'POST',
    url: '/downloadMap',
    expectedStatus: 204,
    data: action.payload,
  });

  dispatch(setActiveModal(null));

  dispatch(
    toastsAdd({
      style: 'success',
      messageKey: 'general.success', // TODO add specific message key for success
    }),
  );
};

export default handle;

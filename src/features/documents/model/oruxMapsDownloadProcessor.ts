import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { saveBlob } from '@shared/saveBlob.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { oruxMapsDownload } from './actions.js';

const PATH = '/oruxmaps/onlinemapsources.xml';

export const oruxMapsDownloadProcessor: Processor<typeof oruxMapsDownload> = {
  actionCreator: oruxMapsDownload,
  errorKey: 'general.operationError',
  async handle({ getState }) {
    if (!getState().auth.user) {
      trackMatomo(['trackEvent', 'OruxMaps', 'download']);

      window.location.href = `${process.env['API_URL']}${PATH}`;

      return;
    }

    trackMatomo(['trackEvent', 'OruxMaps', 'download', 'token']);

    // logged in, the file carries the user's app token
    const res = await httpRequest({
      getState,
      url: PATH,
      expectedStatus: 200,
    });

    await saveBlob(await res.blob(), 'onlinemapsources.xml', {
      'application/xml': ['.xml'],
    });
  },
};

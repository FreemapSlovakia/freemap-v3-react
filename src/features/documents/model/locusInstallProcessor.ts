import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import z from 'zod';
import { locusInstall } from './actions.js';

const InstallSchema = z.object({ url: z.string() });

export const locusInstallProcessor: Processor<typeof locusInstall> = {
  actionCreator: locusInstall,
  errorKey: 'general.operationError',
  async handle({ getState }) {
    if (!getState().auth.user) {
      trackMatomo(['trackEvent', 'Locus', 'install']);

      window.location.href = `locus-actions://${`${process.env['API_URL']}/locus/install`.replace('://', '/')}`;

      return;
    }

    trackMatomo(['trackEvent', 'Locus', 'install', 'token']);

    // the token is minted only once Locus fetches this link
    const res = await httpRequest({
      getState,
      method: 'POST',
      url: '/locus/installs',
      expectedStatus: 200,
    });

    window.location.href = InstallSchema.parse(await res.json()).url;
  },
};

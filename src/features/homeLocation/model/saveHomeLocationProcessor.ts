import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { httpRequest } from '../../../app/httpRequest.js';
import { saveHomeLocation } from './actions.js';

export const saveHomeLocationProcessor: Processor<typeof saveHomeLocation> = {
  actionCreator: saveHomeLocation,
  errorKey: 'settings.savingError',
  statePredicate: (state) => !!state.auth.user,
  async handle({ getState }) {
    const { homeLocation } = getState().homeLocation;

    await httpRequest({
      getState,
      method: 'PATCH',
      url: '/auth/settings',
      expectedStatus: 204,
      data: {
        lat: homeLocation?.lat,
        lon: homeLocation?.lon,
      },
    });
  },
};

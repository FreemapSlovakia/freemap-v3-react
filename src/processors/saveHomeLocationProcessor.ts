import { saveHomeLocation } from '../actions/mainActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const saveHomeLocationProcessor: Processor<typeof saveHomeLocation> = {
  actionCreator: saveHomeLocation,
  errorKey: 'settings.savingError',
  statePredicate: (state) => !!state.auth.user,
  async handle({ getState }) {
    const { homeLocation } = getState().main;

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

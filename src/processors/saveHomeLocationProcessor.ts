import { saveHomeLocation } from 'fm3/actions/mainActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

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

import { authSetUser } from 'fm3/actions/authActions';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';
import { httpRequest } from 'fm3/httpRequest';
import { getEffectiveChosenLanguage } from 'fm3/langUtils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const l10nSetLanguageProcessor: Processor = {
  actionCreator: [l10nSetChosenLanguage, authSetUser],
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { chosenLanguage } = getState().l10n;

    const language = getEffectiveChosenLanguage(chosenLanguage);

    window.translations = (
      await import(`fm3/translations/${language}.tsx`)
    ).default;

    dispatch(l10nSetLanguage(language));

    document.documentElement.lang = language;

    if (
      isActionOf(l10nSetChosenLanguage, action) &&
      getState().auth.user &&
      !action.payload.noSave
    ) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        data: {
          language: chosenLanguage,
        },
      });
    }
  },
};

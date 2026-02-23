import { authSetUser } from '../features/auth/model/actions.js';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from '../actions/l10nActions.js';
import { httpRequest } from '../httpRequest.js';
import { getEffectiveChosenLanguage } from '../langUtils.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const l10nSetLanguageProcessor: Processor = {
  actionCreator: [l10nSetChosenLanguage, authSetUser],
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { chosenLanguage } = getState().l10n;

    const language = getEffectiveChosenLanguage(chosenLanguage);

    window.translations = (
      await import(
        /* webpackExclude: /\.template\./ */
        /* webpackChunkName: "translation-[request]" */
        `../translations/${language}.tsx`
      )
    ).default;

    dispatch(l10nSetLanguage(language));

    document.documentElement.lang = language;

    if (
      l10nSetChosenLanguage.match(action) &&
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

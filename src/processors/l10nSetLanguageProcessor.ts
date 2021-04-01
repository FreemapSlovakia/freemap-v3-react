import { authSetUser } from 'fm3/actions/authActions';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { Messages } from 'fm3/translations/messagesInterface';
import { isActionOf } from 'typesafe-actions';

export const l10nSetLanguageProcessor: Processor = {
  actionCreator: [l10nSetChosenLanguage, authSetUser],
  handle: async ({ dispatch, getState, action }) => {
    const { chosenLanguage } = getState().l10n;

    const isSetUser = isActionOf(authSetUser, action);

    const language =
      chosenLanguage ||
      [...(navigator.languages || []), navigator.language]
        .map((lang) => simplify(lang))
        .find((lang) => lang && ['en', 'sk', 'cs', 'hu'].includes(lang)) ||
      'en';

    const [translations] = await Promise.all([
      import(
        /* webpackChunkName: "translations-[request]" */ `fm3/translations/${language}.tsx`
      ) as Promise<{ default: Messages }>,

      !isSetUser && getState().auth.user
        ? httpRequest({
            getState,
            method: 'PATCH',
            url: '/auth/settings',
            expectedStatus: 204,
            data: {
              language: chosenLanguage,
            },
          })
        : null,
    ]);

    window.translations = translations.default;

    dispatch(l10nSetLanguage(language));
  },
};

function simplify(lang: string | null | undefined) {
  return lang?.replace(/-.*/, '');
}

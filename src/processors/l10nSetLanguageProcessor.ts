import { authSetUser } from 'fm3/actions/authActions';
import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { isActionOf } from 'typesafe-actions';

export const l10nSetLanguageProcessor: Processor = {
  actionCreator: [l10nSetChosenLanguage, authSetUser],
  handle: async ({ dispatch, getState, action }) => {
    const { chosenLanguage } = getState().l10n;

    const language = getEffectiveChosenLanguage(chosenLanguage);

    window.translations = (
      await import(
        /* webpackChunkName: "translations-[request]" */ `fm3/translations/${language}.tsx`
      )
    ).default;

    dispatch(l10nSetLanguage(language));

    if (!isActionOf(authSetUser, action) && getState().auth.user) {
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

// TOD move to some util
export function getEffectiveChosenLanguage(
  chosenLanguage: string | null,
): string {
  return (
    chosenLanguage ||
    [...(navigator.languages || []), navigator.language]
      .map((lang) => simplify(lang))
      .find((lang) => lang && ['en', 'sk', 'cs', 'hu'].includes(lang)) ||
    'en'
  );
}

function simplify(lang: string | null | undefined) {
  return lang?.replace(/-.*/, '');
}

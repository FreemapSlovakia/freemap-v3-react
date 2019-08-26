import {
  l10nSetChosenLanguage,
  l10nSetLanguage,
} from 'fm3/actions/l10nActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';

export const l10nSetLanguageProcessor: IProcessor = {
  actionCreator: l10nSetChosenLanguage,
  handle: async ({ dispatch, getState }) => {
    const { chosenLanguage } = getState().l10n;
    const language =
      chosenLanguage ||
      (navigator.languages &&
        navigator.languages
          .map(lang => simplify(lang))
          .find(lang => lang && ['en', 'sk', 'cs'].includes(lang))) ||
      simplify(navigator.language) ||
      'en';

    const translations = await import(
      /* webpackChunkName: "translations-[request]" */ `fm3/translations/${language}.tsx`
    );

    window['translations'] = translations.default;
    dispatch(l10nSetLanguage(language));
  },
};

function simplify(lang: string | null | undefined) {
  return lang && lang.replace(/-.*/, '');
}

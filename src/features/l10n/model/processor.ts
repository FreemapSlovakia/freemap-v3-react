import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { getEffectiveChosenLanguage } from '@shared/langUtils.js';
import { setMessages } from '../messagesStore.js';
import { l10nSetChosenLanguage, l10nSetLanguage } from './actions.js';

export const l10nSetLanguageProcessor: Processor = {
  actionCreator: [l10nSetChosenLanguage, authSetUser],
  errorKey: 'settings.savingError',
  handle: async ({ dispatch, getState, action }) => {
    const { chosenLanguage } = getState().l10n;

    if (l10nSetChosenLanguage.match(action)) {
      window._paq.push([
        'trackEvent',
        'Language',
        'set',
        chosenLanguage ?? 'auto',
      ]);
    }

    const language = getEffectiveChosenLanguage(chosenLanguage);

    setMessages(
      (
        await import(
          /* webpackChunkName: "translation-[request]" */
          `@/translations/${language}.messages.tsx`
        )
      ).default,
    );

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

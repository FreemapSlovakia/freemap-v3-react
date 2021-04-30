import { authInit, authSetUser } from 'fm3/actions/authActions';
import { getTip, tipsShow } from 'fm3/actions/tipsActions';
import { httpRequest } from 'fm3/authAxios';
import { history } from 'fm3/historyHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { TipKey } from 'fm3/tips';
import { User } from 'fm3/types/common';
import { assertType, is } from 'typescript-is';
import { getEffectiveChosenLanguage } from './l10nSetLanguageProcessor';

export const authInitProcessor: Processor = {
  actionCreator: authInit,
  errorKey: 'logIn.verifyError',
  async handle({ getState, dispatch }) {
    const { user } = getState().auth;

    if (user) {
      const res = await httpRequest({
        getState,
        url: '/auth/validate',
        method: 'POST',
        expectedStatus: [200, 401],
        cancelActions: [],
      });

      dispatch(
        authSetUser(res.status === 200 ? assertType<User>(res.data) : null),
      );
    }

    // show tips only if not embedded and there are no other query parameters except 'map' or 'layers'
    if (
      !window.fmEmbedded &&
      history.location.search
        .substring(1)
        .split('&')
        .every((x: string) => /^(map|layers)=|^$/.test(x))
    ) {
      const lang = getEffectiveChosenLanguage(getState().l10n.chosenLanguage);

      if (!getState().tips.preventTips && ['sk', 'cs'].includes(lang)) {
        const tip = getState().tips.lastTip;

        setTimeout(() => {
          dispatch(
            tipsShow(tip && is<TipKey>(tip) ? getTip(tip, 'next') : 'freemap'),
          );
        });
      }
    }
  },
};

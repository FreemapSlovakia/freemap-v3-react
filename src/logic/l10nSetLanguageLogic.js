import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { l10nSetLanguage } from 'fm3/actions/l10nActions';

export default createLogic({
  type: at.L10N_SET_CHOSEN_LANGUAGE,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { chosenLanguage } = getState().l10n;
    const language = chosenLanguage
      || navigator.languages && navigator.languages.map(lang => simplify(lang)).find(lang => ['en', 'sk', 'cs'].includes(lang))
      || simplify(navigator.language)
      || 'en';

    Promise.all([
      import(/* webpackChunkName: "translations" */`fm3/translations/${language}.js`),
      !global.hasNoNativeIntl ? null
        : language === 'sk' ? import(/* webpackChunkName: "locale-data-sk" */'intl/locale-data/jsonp/sk.js')
          : language === 'cs' ? import(/* webpackChunkName: "locale-data-cs" */'intl/locale-data/jsonp/cs.js')
            : import(/* webpackChunkName: "locale-data-en" */'intl/locale-data/jsonp/en.js'),
    ]).then(([translations]) => {
      global.translations = translations.default;
      dispatch(l10nSetLanguage(language));
      dispatch(stopProgress(pid));
      done();
    }).catch((err) => {
      dispatch(err);
      done();
    });
  },
});

function simplify(lang) {
  return lang && lang.replace(/-.*/, '');
}

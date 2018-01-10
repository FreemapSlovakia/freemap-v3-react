import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { l10nSetTranslations } from 'fm3/actions/l10nActions';

export default createLogic({
  type: at.L10N_SET_LANGUAGE,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    const { chosenLanguage } = getState().l10n;
    const language = chosenLanguage || navigator.languages.map(lang => lang.split('-')[0]).find(lang => ['en', 'sk', 'cs'].includes(lang)) || 'en';

    // TODO handle error
    Promise.all([
      import(`fm3/translations/${language}.js`),
      global.hasNoNativeIntl && import(`intl/locale-data/jsonp/${language}.js`),
    ]).then(([translations]) => {
      dispatch(l10nSetTranslations(language, translations.default));
      dispatch(stopProgress(pid));
      done();
    });
  },
});

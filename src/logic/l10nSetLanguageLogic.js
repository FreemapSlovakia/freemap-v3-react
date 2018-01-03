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
    const language = chosenLanguage || navigator.languages.map(lang => lang.split('-')[0]).find(lang => ['en', 'sk'].includes(lang)) || 'en';

    // TODO handle error
    import(`fm3/translations/${language}.json`).then((translations) => {
      dispatch(l10nSetTranslations(language, translations));
      dispatch(stopProgress(pid));
      done();
    });
  },
});

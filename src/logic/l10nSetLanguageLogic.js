import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { l10nSetTranslations } from 'fm3/actions/l10nActions';

export default createLogic({
  type: at.L10N_SET_LANGUAGE,
  process({ getState }, dispatch, done) {
    const pid = Math.random();
    dispatch(startProgress(pid));

    // TODO handle error
    import(`fm3/translations/${getState().l10n.language}.json`).then((translations) => {
      dispatch(l10nSetTranslations(translations));
      dispatch(stopProgress(pid));
      done();
    });
  },
});

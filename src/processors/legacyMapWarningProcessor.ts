import { enableUpdatingUrl } from '../actions/mainActions.js';
import {
  mapRefocus,
  mapSuppressLegacyMapWarning,
} from '../actions/mapActions.js';
import {
  ToastAction,
  toastsAdd,
  toastsRemove,
} from '../actions/toastsActions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

export const legacyMapWarningProcessor: Processor = {
  stateChangePredicate: (state) =>
    ['T', 'C', 'K'].some((type) => state.map.layers.includes(type)),
  actionCreator: enableUpdatingUrl,
  predicatesOperation: 'OR',
  async handle({ getState, dispatch }) {
    const {
      layers,
      legacyMapWarningSuppressions,
      tempLegacyMapWarningSuppressions,
    } = getState().map;

    if (
      ['T', 'C', 'K'].some((type) => layers.includes(type)) &&
      !legacyMapWarningSuppressions.includes(mapType) &&
      !tempLegacyMapWarningSuppressions.includes(mapType)
    ) {
      const actions: ToastAction[] = [
        {
          nameKey: 'general.yes',
          action: mapRefocus({ mapType: 'X' }),
        },
        {
          nameKey: 'general.no',
          action: mapSuppressLegacyMapWarning({ forever: false }),
        },
      ];

      if (!window.fmEmbedded) {
        actions.push({
          nameKey: 'general.preventShowingAgain',
          action: mapSuppressLegacyMapWarning({ forever: true }),
        });
      }

      dispatch(
        toastsAdd({
          id: 'maps.legacyWarning',
          messageKey: 'maps.legacyMapWarning',
          style: 'warning',
          actions,
        }),
      );
    } else {
      const toast = getState().toasts.toasts.find(
        (toast) => toast.id === 'maps.legacyWarning',
      );

      if (toast) {
        dispatch(toastsRemove(toast.id));
      }
    }
  },
};

import { enableUpdatingUrl } from 'fm3/actions/mainActions';
import {
  mapRefocus,
  mapSuppressLegacyMapWarning,
} from 'fm3/actions/mapActions';
import {
  ToastAction,
  toastsAdd,
  toastsRemove,
} from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const legacyMapWarningProcessor: Processor = {
  stateChangePredicate: (state) => state.map.mapType,
  actionCreator: enableUpdatingUrl,
  predicatesOperation: 'OR',
  async handle({ getState, dispatch }) {
    const {
      mapType,
      legacyMapWarningSuppressions,
      tempLegacyMapWarningSuppressions,
    } = getState().map;

    if (
      (mapType === 'T' || mapType === 'C' || mapType === 'K') &&
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

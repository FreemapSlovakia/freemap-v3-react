import { is } from 'typia';
import { enableUpdatingUrl } from '../actions/mainActions.js';
import {
  mapReplaceLayer,
  mapSuppressLegacyMapWarning,
} from '../actions/mapActions.js';
import {
  ToastAction,
  toastsAdd,
  toastsRemove,
} from '../actions/toastsActions.js';
import { HasLegacy, integratedLayerDefs } from '../mapDefinitions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

const TOAST_PREFIX = 'maps.legacyWarning.';

export const legacyMapWarningProcessor: Processor = {
  stateChangePredicate: (state) =>
    integratedLayerDefs
      .filter(
        (def) =>
          state.map.layers.includes(def.type) &&
          is<HasLegacy>(def) &&
          def.superseededBy,
      )
      .map((def) => def.type)
      .join(','),
  actionCreator: enableUpdatingUrl,
  predicatesOperation: 'OR',
  async handle({ getState, dispatch }) {
    const {
      layers,
      legacyMapWarningSuppressions,
      tempLegacyMapWarningSuppressions,
    } = getState().map;

    const justWarned = new Set(
      getState()
        .toasts.toasts.filter((toast) => toast.id.startsWith(TOAST_PREFIX))
        .map((toast) => toast.id.slice(TOAST_PREFIX.length)),
    );

    for (const def of integratedLayerDefs) {
      if (
        !layers.includes(def.type) ||
        !is<HasLegacy>(def) ||
        !def.superseededBy ||
        legacyMapWarningSuppressions.includes(def.type) ||
        tempLegacyMapWarningSuppressions.includes(def.type)
      ) {
        continue;
      }

      if (justWarned.delete(def.type)) {
        continue;
      }

      const actions: ToastAction[] = [
        {
          nameKey: 'general.yes',
          action: mapReplaceLayer({
            from: def.type,
            to: def.superseededBy!,
          }),
        },
        {
          nameKey: 'general.no',
          action: mapSuppressLegacyMapWarning({
            type: def.type,
            forever: false,
          }),
        },
      ];

      if (!window.fmEmbedded) {
        actions.push({
          nameKey: 'general.preventShowingAgain',
          action: mapSuppressLegacyMapWarning({
            type: def.type,
            forever: true,
          }),
        });
      }

      dispatch(
        toastsAdd({
          id: TOAST_PREFIX + def.type,
          messageKey: 'maps.legacyMapWarning',
          messageParams: {
            from: def.type,
            to: def.superseededBy!,
          },
          style: 'warning',
          actions,
        }),
      );
    }

    for (const layer of justWarned) {
      dispatch(toastsRemove(TOAST_PREFIX + layer));
    }
  },
};

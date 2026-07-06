import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  mapRefocus,
  mapReplaceLayer,
  mapSuppressLegacyMapWarning,
} from '@features/map/model/actions.js';
import {
  type ToastAction,
  toastsAdd,
  toastsRemove,
} from '@features/toasts/model/actions.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';
import { init } from '@/app/store/actions.js';

const TOAST_PREFIX = 'myMaps.legacyWarning.';

export const legacyMapWarningProcessor: Processor = {
  stateChangePredicate: (state) =>
    integratedLayerDefs
      .filter((def) => state.map.layers.includes(def.type) && def.superseededBy)
      .map((def) => def.type)
      .join(','),
  actionCreator: [mapRefocus, init],
  predicatesOperation: 'OR',
  async handle({ getState, dispatch }) {
    const {
      layers,
      legacyMapWarningSuppressions,
      tempLegacyMapWarningSuppressions,
    } = getState().map;

    const justWarned = new Set(
      Object.values(getState().toasts.toasts)
        .filter((toast) => toast.id.startsWith(TOAST_PREFIX))
        .map((toast) => toast.id.slice(TOAST_PREFIX.length)),
    );

    for (const def of integratedLayerDefs) {
      if (
        !layers.includes(def.type) ||
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
          messageKey: 'mapLayers.legacyMapWarning',
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

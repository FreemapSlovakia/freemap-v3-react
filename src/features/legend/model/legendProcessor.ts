import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { EXTERNAL_LEGENDS, getActiveLegendLayers } from '../legendLayers.js';

export const legendProcessor: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    if (action.payload?.type !== 'legend') {
      return action;
    }

    const { layers, customLayers } = getState().map;

    const legendLayers = getActiveLegendLayers(layers, customLayers);

    // A lone external legend opens directly; beside others the modal links it.
    const url =
      legendLayers.length === 1 ? EXTERNAL_LEGENDS[legendLayers[0]] : undefined;

    // Blocked without a user gesture (a `#show=legend` link), so the modal's
    // own link stands in.
    if (url && window.open(url)) {
      return null;
    }

    return action;
  },
};

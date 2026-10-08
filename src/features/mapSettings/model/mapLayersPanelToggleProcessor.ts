import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  panelStatePersists,
  toggleMapLayersPanel,
} from '../mapLayersPanelStore.js';
import { mapLayersPanelToggle } from './actions.js';

// The panel's state lives outside the store, so a key reaches it through here.
export const mapLayersPanelToggleProcessor: Processor<
  typeof mapLayersPanelToggle
> = {
  actionCreator: mapLayersPanelToggle,
  handle: ({ getState }) => {
    const state = getState();

    // Where the embedder hides the map switcher, its panel goes too.
    if (window.fmEmbedded && state.main.embedFeatures.includes('noMapSwitch')) {
      return;
    }

    toggleMapLayersPanel(panelStatePersists(state));
  },
};

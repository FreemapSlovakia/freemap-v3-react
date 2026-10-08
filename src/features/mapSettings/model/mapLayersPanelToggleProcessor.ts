import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toggleMapLayersPanel } from '../mapLayersPanelStore.js';
import { mapLayersPanelToggle } from './actions.js';

// The panel's state lives outside the store, so a key reaches it through here.
export const mapLayersPanelToggleProcessor: Processor<
  typeof mapLayersPanelToggle
> = {
  actionCreator: mapLayersPanelToggle,
  handle: ({ getState }) => {
    const { main, cookieConsent } = getState();

    // Where the embedder hides the map switcher, its panel goes too.
    if (window.fmEmbedded && main.embedFeatures.includes('noMapSwitch')) {
      return;
    }

    toggleMapLayersPanel(cookieConsent.cookieConsentResult !== null);
  },
};

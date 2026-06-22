import { clearMapFeatures } from '@app/store/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadTrackViewerMessages } from '../translations/loadTrackViewerMessages.js';
import { trackViewerSetData } from './actions.js';

/**
 * Toast showing the loaded track's stats (distance, elevation min/max, ascent,
 * descent…). Shared by the "more info" button and the elevation prompt's `info`
 * consumer so both render the same panel once elevation is settled.
 */
export const trackInfoToast = toastsAdd({
  id: 'trackViewer.trackInfo',
  messageKey: 'info',
  messageLoader: loadTrackViewerMessages,
  cancelType: [clearMapFeatures.type, trackViewerSetData.type],
  style: 'info',
});

import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const en: MapSettingsMessages = {
  overlayOpacity: 'Opacity',
  showInMenu: 'Show in menu',
  showInToolbar: 'Show in toolbar',
  keyboardShortcut: 'Keyboard shortcut',
  saveSuccess: 'Settings have been saved.',
  customMapSaved: 'Custom map has been saved.',
  combination: 'Map combination',
  combinationSaved: 'Map combination has been saved.',
  combinationHint:
    'With a base map it acts as a base map and stays active until another one is picked; without one it is an overlay, ticked over any base map. Its opacities apply while it is active.',
  updateFromCurrentMap: 'Update from current map',
  baseMap: 'Base map',
  noBaseMap: 'None — the map works as an overlay',
  overlays: 'Overlays',
  addOverlay: 'Add overlay…',
  noOverlays: 'No overlays.',
  combinationTooSmall:
    'A combination needs at least two layers, or a single parametric shading layer.',
  shading: 'Shading',
  shadingHint:
    'To change the shading, adjust it live in its panel on the map, then use Update from current map in the list.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Error saving settings', err),
};

export default en;

import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const en: MapSettingsMessages = {
  install: 'Install — offer this map in the map menus',
  uninstall:
    'Uninstall — the map is offered nowhere, though a link still shows it',
  installedMaps: 'Installed maps',
  noInstalledMaps: 'No maps are installed. Search the library to add some.',
  searchLibrary: ({ count }) => `Search ${count} maps`,
  moreResults: ({ count }) => `${count} more — refine the search`,
  preview: 'Preview on the map',
  installMap: 'Install',
  keepOnMap: 'Keep on map',
  backToLibrary: 'Back to library',
  overlayOpacity: 'Opacity',
  showInMenu: 'Show in menu',
  showInToolbar: 'Show in toolbar',
  keyboardShortcut: 'Keyboard shortcut',
  saveSuccess: 'Settings have been saved.',
  customMapSaved: 'Custom map has been saved.',
  combination: 'Map combination',
  combinationSaved: 'Map combination has been saved.',
  updateFromCurrentMap: 'Update from current map',
  baseMap: 'Base map',
  baseMaps: 'Base maps',
  shadingMapHint:
    'The shading parameters are set and saved in the panel that appears once this map is activated.',
  overlays: 'Overlays',
  addOverlay: 'Add overlay…',
  noOverlays: 'No overlays.',
  combinationTooSmall: 'At least two layers are required.',
  savingError: ({ err }) =>
    addError(getMessages()!, 'Error saving settings', err),
};

export default en;

import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const en: MapSettingsMessages = {
  install: 'Install — offer this map in the map menus',
  noInstalledMaps: 'No maps are installed. Add some from Available maps.',
  searchLibrary: ({ count }) => `Search ${count} maps`,
  catalogCredit: 'The library’s map list draws on the',
  filters: {
    filterYourMaps: 'Filter installed maps',
    kind: 'Kind',
    builtIn: 'Built-in',
    fromLibrary: 'From the library',
    custom: 'Custom',
    offline: 'Offline',
    combinations: 'Combinations',
    shownIn: 'Shown',
    toolbar: 'In toolbar',
    menu: 'In menu',
    shortcut: 'With shortcut',
    hidden: 'Hidden',
    technology: 'Technology',
    dataLayers: 'Data layers',
    category: 'Category',
    photo: 'Orthophotos',
    historicphoto: 'Historic imagery',
    historicmap: 'Historic maps',
    map: 'Maps',
    elevation: 'Elevation',
    other: 'Other',
    coversView: 'Covers this view',
  },
  preview: 'Preview on the map',
  installMap: 'Install',
  uninstallMap: 'Uninstall',
  modifyCustomMapTitle: (name) => (
    <>
      Modify custom map <i>{name}</i>
    </>
  ),
  modifyCombinationTitle: (name) => (
    <>
      Modify map combination <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Put every map’s toolbar, menu, opacity and shortcut settings back to their defaults? Installed maps stay installed.',
  downloadOffline: 'Download for offline use',
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

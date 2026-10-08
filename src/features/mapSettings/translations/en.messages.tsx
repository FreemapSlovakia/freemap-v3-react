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
    presets: 'Presets',
    shownIn: 'Shown',
    toolbar: 'In toolbar',
    menu: 'In menu',
    shortcut: 'With shortcut',
    hidden: 'Hidden',
    technology: 'Technology',
    dataLayers: 'Data layers',
    category: 'Category',
    country: 'Country',
    anyCountry: 'All countries',
    includeMultiCountry: 'Include multi-country maps',
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
  suggestMap: (
    <>
      Do you know about a map we don't have? Please contact us at{' '}
      <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>.
    </>
  ),
  modifyCustomMapTitle: (name) => (
    <>
      Modify custom map <i>{name}</i>
    </>
  ),
  modifyPresetTitle: (name) => (
    <>
      Modify map preset <i>{name}</i>
    </>
  ),
  resetConfirm:
    'Put every map’s toolbar, menu and shortcut settings and its setup (opacity, layers, shading…) back to their defaults? Installed maps stay installed.',
  downloadOffline: 'Download for offline use',
  keepOnMap: 'Keep on map',
  backToLibrary: 'Back to library',
  overlayOpacity: 'Opacity',
  showInMenu: 'Show in menu',
  showInToolbar: 'Show in toolbar',
  keyboardShortcut: 'Keyboard shortcut',
  saveSuccess: 'Settings have been saved.',
  customMapSaved: 'Custom map has been saved.',
  preset: 'Map preset',
  presetSaved: 'Map preset has been saved.',
  newPreset: 'New map preset',
  saveAsPreset: 'Save as preset',
  saveLayersAsPreset: 'Save layers as preset',
  saveLayersAsPresetHint:
    'A new preset of copies of the maps on the map, presets taken apart.',
  leftOutOfPreset: (layers) =>
    `A preset holds only maps, so it won't include: ${layers}.`,
  deleteAlsoNamed: (names) => `The maps built on it go too: ${names}.`,
  duplicatePreset: 'Duplicate',
  saveAsMap: 'Save as map',
  namedMapHint:
    'Its shading, WMS layers or colour are set in the Map layers panel, and a change shows wherever the map is used.',
  newNamedMap: 'New named map',
  unappliedShading:
    'Shading changes not applied yet: click the map’s name, then Apply.',
  openPreset: 'Show on map',
  addMap: 'Add map',
  presetEmpty: 'No layers.',
  searchResults: 'Search results',
  filterItems: 'Filter',
  openTool: 'Open tool',
  nothingInView: 'Nothing found in this part of the map.',
  presetHint:
    'Its layers are edited on the map: open the preset in the Map layers panel. Every change is kept at once.',
  baseMaps: 'Base maps',
  overlays: 'Overlays',
  wmsLayers: {
    search: 'Search layers',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
  },
  savingError: ({ err }) =>
    addError(getMessages()!, 'Error saving settings', err),
};

export default en;

import type { JSX } from 'react';

export type MapSettingsMessages = {
  install: string;
  noInstalledMaps: string;
  searchLibrary: (props: { count: number }) => string;
  /** Followed by the name of the catalog source. */
  catalogCredit: string;
  /** The map library's tabs and filter chips. */
  filters: {
    filterYourMaps: string;
    kind: string;
    builtIn: string;
    fromLibrary: string;
    custom: string;
    offline: string;
    presets: string;
    shownIn: string;
    toolbar: string;
    menu: string;
    shortcut: string;
    hidden: string;
    technology: string;
    dataLayers: string;
    category: string;
    country: string;
    anyCountry: string;
    includeMultiCountry: string;
    photo: string;
    historicphoto: string;
    historicmap: string;
    map: string;
    elevation: string;
    other: string;
    coversView: string;
  };
  preview: string;
  installMap: string;
  uninstallMap: string;
  suggestMap: JSX.Element;
  modifyCustomMapTitle: (name: string) => JSX.Element;
  modifyPresetTitle: (name: string) => JSX.Element;
  resetConfirm: string;
  downloadOffline: string;
  keepOnMap: string;
  backToLibrary: string;
  overlayOpacity: string;
  showInMenu: string;
  showInToolbar: string;
  keyboardShortcut: string;
  saveSuccess: string;
  customMapSaved: string;
  /** A named composite of layers with their setups. */
  preset: string;
  presetSaved: string;
  newPreset: string;
  /** A link's preset, as one of the account's own. */
  saveAsPreset: string;
  /** In the Map layers panel: what is on the map, as a new preset. */
  saveLayersAsPreset: string;
  saveLayersAsPresetHint: string;
  /** Why it is disabled: data layers on, which a preset can't hold. */
  leftOutOfPreset: (layers: string) => string;
  /** Deleting a custom map: the named maps built on it, deleted with it. */
  deleteAlsoNamed: (names: string) => string;
  /** A copy of a preset, in its place on the map. */
  duplicatePreset: string;
  /** On a map's page in the Map layers panel: the map as set up, under a name. */
  saveAsMap: string;
  /** Says where a named map's shading or layers are set, and that they are shared. */
  namedMapHint: string;
  newNamedMap: string;
  /** Beside a map in the Map layers panel whose shading edits wait for Apply. */
  unappliedShading: string;
  /** Turns a preset on, from Installed maps. */
  openPreset: string;
  /** Adds a map to a preset, in the Map layers panel. */
  addMap: string;
  presetEmpty: string;
  /** The pinned search results, as a row in the Map layers panel. */
  searchResults: string;
  /** Placeholder narrowing a feature's items in the Map layers panel. */
  filterItems: string;
  /** On a feature's items page in the Map layers panel: opens its tool. */
  openTool: string;
  /** A feature's item list with nothing in it, as the objects in view can be. */
  nothingInView: string;
  /** Says where a preset's layers are edited. */
  presetHint: string;
  baseMaps: string;
  overlays: string;
  /** A WMS map's layers, in the Map layers panel. */
  wmsLayers: {
    search: string;
    selectAll: string;
    deselectAll: string;
  };
  savingError: (props: { err: unknown }) => string;
};

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
    includeWorldwide: string;
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
  /** A copy of a preset, in its place on the map. */
  duplicatePreset: string;
  /** Turns a preset on, from Installed maps. */
  openPreset: string;
  /** Adds a map to a preset, in the Map layers panel. */
  addMap: string;
  presetEmpty: string;
  /** Says where a preset's layers are edited. */
  presetHint: string;
  baseMaps: string;
  overlays: string;
  useAsBaseMap: string;
  useAsOverlay: string;
  /** A WMS map's layers, in the Map layers panel. */
  wmsLayers: {
    search: string;
    selectAll: string;
    deselectAll: string;
  };
  savingError: (props: { err: unknown }) => string;
};

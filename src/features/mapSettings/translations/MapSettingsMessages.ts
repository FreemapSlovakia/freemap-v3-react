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
    combinations: string;
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
  modifyCombinationTitle: (name: string) => JSX.Element;
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
  combination: string;
  combinationSaved: string;
  updateFromCurrentMap: string;
  baseMap: string;
  baseMaps: string;
  shadingMapHint: string;
  overlays: string;
  addOverlay: string;
  noOverlays: string;
  combinationTooSmall: string;
  useAsBaseMap: string;
  useAsOverlay: string;
  /** Labels the library map a linked WMS map takes all but its layers from. */
  basedOn: string;
  /** Takes an overlay off the map, in the Map layers panel. */
  turnOff: string;
  /** A WMS map's layers, in the Map layers panel. */
  wmsLayers: {
    reset: string;
    saveAsCustomMap: string;
    search: string;
    selectAll: string;
    deselectAll: string;
  };
  savingError: (props: { err: unknown }) => string;
};

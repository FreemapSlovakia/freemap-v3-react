export type MapSettingsMessages = {
  installed: string;
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
  shadingMapHint: string;
  overlays: string;
  addOverlay: string;
  noOverlays: string;
  combinationTooSmall: string;
  savingError: (props: { err: unknown }) => string;
};

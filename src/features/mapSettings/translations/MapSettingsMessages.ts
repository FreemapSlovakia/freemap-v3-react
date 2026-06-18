export type MapSettingsMessages = {
  overlayOpacity: string;
  showInMenu: string;
  showInToolbar: string;
  saveSuccess: string;
  customMapSaved: string;
  savingError: (props: { err: unknown }) => string;
};

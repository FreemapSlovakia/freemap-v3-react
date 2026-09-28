export type ShadingMessages = {
  add: string;
  apply: string;
  inBrowser: string;
  onServer: string;
  revert: string;
  background: string;
  contour: string;
  fogInversion: string;
  elevation: string;
  elevationBandWidth: string;
  color: string;
  belowColor: string;
  aboveColor: string;
  exaggeration: string;
  exaggerationHint: string;
  azimuth: string;
  lightElevation: string;
  types: {
    'hillshade-igor': string;
    'hillshade-classic': string;
    'slope-igor': string;
    'slope-classic': string;
    'color-relief': string;
    aspect: string;
  };
};

export type ShadingMessages = {
  add: string;
  background: string;
  contour: string;
  fogInversion: string;
  elevation: string;
  elevationBandWidth: string;
  color: string;
  belowColor: string;
  aboveColor: string;
  exaggeration: string;
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

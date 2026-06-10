export type ObjectsMessages = {
  type: string;
  lowZoomAlert: {
    message: (props: { minZoom: number }) => string;
    zoom: string;
  };
  tooManyPoints: (props: { limit: number }) => string;
  fetchingError: (props: { err: unknown }) => string;
  icon: {
    pin: string;
    ring: string;
    square: string;
  };
  convertAsPoint: string;
  convertWithGeometry: string;
  showAsLookup: string;
  convertAll: string;
};

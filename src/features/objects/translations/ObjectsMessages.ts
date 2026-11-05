export type ObjectsMessages = {
  source: string;
  elevation: string;
  terrain: {
    prominence: string;
    /** The lowest point on the way to higher ground. */
    keyCol: string;
    isolation: string;
    showRoute: string;
    hideRoute: string;
    /** Of a saddle, below the lower of the two areas it joins. */
    depth: string;
    /** The peak whose key col this saddle is. */
    keyColOf: string;
    showOnMap: string;
    /** Names the route once it is copied off the map. */
    route: string;
    /** At the highest ground near a peak node, rather than at the node. */
    summitElevation: string;
    saddleElevation: string;
    /** How far the summit or saddle point lies from the node's marker. */
    fromMarker: (props: { distance: string }) => string;
  };
  routeFetchError: (props: { err: unknown }) => string;
  moreGeneralTypes: string;
  openInOsm: string;
  osmHistory: string;
  history: string;
  lowZoomAlert: {
    message: (props: { minZoom: number }) => string;
    zoom: string;
  };
  tooManyPoints: (props: { limit: number }) => string;
  fetchingError: (props: { err: unknown }) => string;
  markerShape: string;
  icon: {
    pin: string;
    ring: string;
    square: string;
  };
  showAsLookup: string;
  showAllAsLookup: string;
  tooManyForLookup: (props: { count: number; limit: number }) => string;
  style: {
    button: string;
    title: string;
  };
};

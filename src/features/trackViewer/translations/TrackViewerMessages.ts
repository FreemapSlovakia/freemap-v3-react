export type TrackViewerMessages = {
  upload: string;
  moreInfo: string;
  share: string;
  colorizingMode: {
    none: string;
    elevation: string;
    steepness: string;
    speed: string;
    heartRate: string;
    cadence: string;
    power: string;
    temperature: string;
    time: string;
    heading: string;
  };
  details: {
    startTime: string;
    finishTime: string;
    duration: string;
    distance: string;
    avgSpeed: string;
    minEle: string;
    maxEle: string;
    uphill: string;
    downhill: string;
    durationValue: (props: { h: number; m: number }) => string;
  };
  uploadModal: {
    title: string;
    drop: string;
  };
  strava: {
    title: string;
    intro: string;
    empty: string;
    loadError: string;
    importError: string;
    notConnected: string;
    connect: string;
  };
  shareToast: string;
  fetchingError: (props: { err: unknown }) => string;
  savingError: (props: { err: unknown }) => string;
  loadingError: string;
  onlyOne: string;
  invalidFormat: string;
  tooBigError: string;
};

export type MapFeaturesExportMessages = {
  download: string;
  format: string;
  target: string;
  elevation: {
    label: string;
    none: string;
    missing: string;
    all: string;
  };
  exportError: (props: { err: unknown }) => string;
  what: {
    plannedRoute: string;
    plannedRouteWithStops: string;
    objects: string;
    pictures: string;
    drawingLines: string;
    drawingAreas: string;
    drawingPoints: string;
    tracking: string;
    import: string;
    search: string;
  };
  onlySelected: string;
  disabledAlert: string;
  licenseAlert: string;
  exportedToDropbox: string;
  exportedToGdrive: string;
  garmin: {
    courseName: string;
    description: string;
    activityType: string;
    at: {
      running: string;
      hiking: string;
      other: string;
      mountain_biking: string;
      trailRunning: string;
      roadCycling: string;
      gravelCycling: string;
    };
    revoked: string;
    exportError: string;
    multipleLineStrings: string;
    noLineString: string;
    multipleTracks: string;
    multipleLines: string;
    connectPrompt: string;
    authPrompt: string;
  };
};

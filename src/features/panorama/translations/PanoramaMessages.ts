export type PanoramaMessages = {
  /** Shown in the empty panel, before anywhere has been picked. */
  pickHint: string;
  rendering: string;
  /** Said while a wait runs longer than the tier usually takes. */
  slow: string;
  /** Said when the last render had to queue behind others. */
  busy: string;
  cancel: string;
  /** Renders what the moved viewpoint and changed settings now ask for. */
  update: string;
  /** Says the picture no longer answers for what the controls say. */
  outdated: string;
  /** Marks the fast pass while the detailed one is still rendering. */
  preview: string;
  /** Where the eye stands, metres above sea level. */
  eyeElevation: string;
  quality: {
    label: string;
    /** Coarsest to finest; everything past the first is premium's. */
    superfast: string;
    fast: string;
    standard: string;
    detailed: string;
    finest: string;
    /** Why the finer tiers are premium's. */
    premiumHint: string;
  };
  tilt: {
    label: string;
    standard: string;
    wide: string;
    flat: string;
  };
  labels: {
    /** Names the menu the two sliders share. */
    title: string;
    /** How many names fit — a count, beside the dominance threshold. */
    density: string;
    /** The choice that turns them off altogether. */
    none: string;
    few: string;
    normal: string;
    many: string;
  };
  dominance: {
    /** Names the control: how much a summit must stand out to be named. */
    label: string;
    /** The step that filters nothing. */
    all: string;
  };
  autoPan: string;
  fullscreen: string;
  peak: {
    elevation: string;
    distance: string;
    azimuth: string;
    /** Puts the map on the summit. */
    showOnMap: string;
  };
  errors: {
    offline: string;
    /** The request never reached the server, and the browser is not offline. */
    unreachable: string;
    busy: string;
    tooMany: string;
    noData: string;
    failed: string;
  };
  caveats: {
    title: string;
    /** The big one: the terrain model has no trees or buildings on it. */
    bareEarth: string;
    coverage: string;
    viewpoint: string;
  };
  /** Credits the terrain models the picture was rendered from. */
  terrainSource: string;
};

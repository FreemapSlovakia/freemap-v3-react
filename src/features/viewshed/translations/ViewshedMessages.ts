export type ViewshedMessages = {
  /** The split button that asks where one stands. */
  pickViewpoint: string;
  /** Its menu item, which takes the GPS instead. */
  locate: string;
  /** Shown over the map while it waits for the click. */
  pickViewpointPrompt: string;
  /** How fine the raster is; worded as the panorama's tier control. */
  detail: string;
  details: {
    superfast: string;
    fast: string;
    standard: string;
    detailed: string;
    finest: string;
  };
  settings: string;
  /** Height of the thing looked at. */
  targetHeight: string;
  targetHeightHint: string;
  color: string;
  /** The opacity curve; premium's tiers are named by `details`. */
  strength: string;
  /** Where that slider stands at 1 — the service's own measurement. */
  strengthMeasured: string;
  strengthHint: string;
  /** Least opacity visible ground may take. */
  minOpacity: string;
  minOpacityHint: string;
  update: string;
  /** Why the Update button is there: the overlay is of other settings. */
  outdated: string;
  /** `ahead` renders must finish first; `0` means this one is next. */
  queued: (props: { ahead: number }) => string;
  errors: {
    offline: string;
    unreachable: string;
    busy: string;
    tooMany: string;
    noData: string;
    failed: string;
  };
};

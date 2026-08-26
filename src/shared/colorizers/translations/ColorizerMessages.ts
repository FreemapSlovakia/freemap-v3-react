export type ColorizerMessages = {
  colorizeBy: string;
  legend: string;
  /** Label of the slider setting where the steepness palette ends. */
  steepnessScale: string;
  mode: {
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
    battery: string;
    gsmSignal: string;
    surface: string;
    smoothness: string;
    roadType: string;
    trackType: string;
    hikeRating: string;
    mtbRating: string;
  };
  /**
   * What a categorical mode's colors stand for. The router's own values are
   * grouped into these, so a legend names a handful of things rather than every
   * value OSM knows. The MTB scale labels itself (S0…S6) and is not here.
   */
  categories: {
    /** Every mode's last category: unmapped, or a value the router can't name. */
    unknown: string;
    surface: {
      paved: string;
      cobbles: string;
      compacted: string;
      gravel: string;
      ground: string;
    };
    /** OSM's nine-step `smoothness` grouped into five. */
    smoothness: {
      good: string;
      intermediate: string;
      bad: string;
      veryBad: string;
      impassable: string;
    };
    roadType: {
      major: string;
      minor: string;
      track: string;
      path: string;
      footway: string;
      cycleway: string;
      steps: string;
    };
    /** OSM's `tracktype`, grade1 solid to grade5 soft. */
    trackType: {
      grade1: string;
      grade2: string;
      grade3: string;
      grade4: string;
      grade5: string;
    };
    /** The SAC scale, T1 to T6. */
    hikeRating: {
      t1: string;
      t2: string;
      t3: string;
      t4: string;
      t5: string;
      t6: string;
    };
  };
};

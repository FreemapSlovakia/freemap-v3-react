export type ToposcopeMessages = {
  /** Shown in the panel while the dial has no centre yet. */
  pickCenterHint: string;
  /** Hands the map over to a click that places the centre. */
  addCenter: string;
  /** The same button once there is a centre to put somewhere else. */
  moveCenter: string;
  /** Its other way round: put the centre where the user is standing. */
  centerAtMyPosition: string;
  /** Title of the toolbar that owns the map while that click is awaited. */
  pickCenterPrompt: string;
  /** Shown once there is a centre but nothing else drawn to point at. */
  addPointsHint: string;
  downloadAsSvg: string;
  /** The map data credit that `{attribution}` expands to. */
  osmAttribution: string;
  /** This portal's own, that `{credit}` expands to; `site` is its name. */
  credit: (props: { site: string }) => string;
  settings: {
    title: string;
    /** Heading over the four texts curved along the outer circle. */
    inscriptions: string;
    innerCircleRadius: string;
    /** The ring the rays stop at, inside the inscriptions. */
    outerCircleRadius: string;
    /** How large the writing on the dial is drawn, as a percentage. */
    scale: string;
    scaleHint: string;
    preventUpturnedText: string;
    /** The two templates written along each ray. */
    line1: string;
    line2: string;
    /** Lists what a ray template can name. */
    lineHint: string;
    /** Lists what can be written into a label or an inscription. */
    placeholders: string;
  };
};

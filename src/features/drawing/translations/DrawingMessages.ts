import type { LabelVisibility } from '@shared/labelVisibility.js';

export type DrawingMessages = {
  modify: string;
  edit: {
    title: string;
    color: string;
    fillColor: string;
    label: string;
    width: string;
    hint: string;
    /**
     * What a `{key}` in the label can name beyond the feature's own properties.
     * Listed per geometry, since only a polygon has an area and only a point
     * has one position.
     */
    pointKeys: string;
    lineKeys: string;
    polygonKeys: string;
    /** How `[…]` marks a part of the label to leave out when a value is missing. */
    optionalKeys: string;
    shape: string;
    text: string;
    /** Between the icon and the text, which a marker shows one of. */
    or: string;
    textHint: string;
    type: string;
    /** Whether a line is drawn, a recorded track or a planned route. */
    kind: string;
    kindLine: string;
    kindTrack: string;
    kindRoute: string;
    kindHint: string;
    /** The fieldset of how the feature is drawn. */
    style: string;
    /** A track's or a route's own GPX fields. */
    trackDetails: string;
    routeDetails: string;
    /** A waypoint's own GPX fields. */
    pointDetails: string;
    pointType: string;
    time: string;
    elevation: string;
    eleInvalid: string;
    desc: string;
    cmt: string;
    activityType: string;
    source: string;
    sourceHint: string;
    number: string;
    numberInvalid: string;
    links: string;
    linkText: string;
    addLink: string;
    removeLink: string;
    /** How many of the details have a value, beside the collapsed panel's title. */
    detailsFilled: (props: { n: number }) => string;
    /** The line's per-point channels: heart rate, time, … */
    channels: string;
    addChannel: string;
    removeChannel: string;
    channelsHint: string;
    dashArray: string;
    lineCap: string;
    lineCapRound: string;
    lineCapButt: string;
    lineCapSquare: string;
    lineJoin: string;
    lineJoinRound: string;
    lineJoinMiter: string;
    lineJoinBevel: string;
    /** Heading over the feature's own data table. */
    properties: string;
    /** Column placeholders for one row of it. */
    propertyKey: string;
    propertyValue: string;
    addProperty: string;
    removeProperty: string;
    /** Writes `{key}` into the label being edited. */
    insertIntoLabel: string;
    showLabel: string;
    labelVisibility: Record<LabelVisibility, string>;
    /** Marks a field whose value differs between features edited together. */
    different: string;
    /** Brings up such a field's control, to set it on all of them. */
    change: string;
    /** Takes it back, leaving each feature its own value. */
    keep: string;
  };
  /** Opens the properties of every feature of a kind at once. */
  batch: {
    title: string;
    /** The dialog's title: `kind` is one of the labels below. */
    dialogTitle: (props: { kind: string; count: number }) => string;
    all: string;
    points: string;
    lines: string;
    polygons: string;
  };
  split: string;
  join: string;
  continue: string;
  stopDrawing: string;
  selectPointToJoin: string;
  defProps: {
    menuItem: string;
    title: string;
    applyToAll: string;
  };
  projection: {
    projectPoint: string;
    distance: string;
    azimuth: string;
    /** Confirms the dialog: places the point the two numbers describe. */
    add: string;
  };
  reverse: string;
  simplify: string;
  cutHole: string;
  cutHoleHint: string;
  makeHole: string;
  detachHole: string;
};

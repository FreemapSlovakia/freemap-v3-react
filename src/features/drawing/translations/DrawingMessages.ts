export type DrawingMessages = {
  modify: string;
  edit: {
    title: string;
    color: string;
    fillColor: string;
    label: string;
    width: string;
    hint: string;
    shape: string;
    text: string;
    textHint: string;
    type: string;
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
  };
  reverse: string;
  simplify: string;
  cutHole: string;
  cutHoleHint: string;
  makeHole: string;
  detachHole: string;
};

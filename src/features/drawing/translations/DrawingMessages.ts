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
    icon: string;
    iconChoose: string;
    iconNone: string;
    iconSearch: string;
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
};

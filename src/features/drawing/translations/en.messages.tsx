import type { DrawingMessages } from './DrawingMessages.js';

const en: DrawingMessages = {
  modify: 'Properties',
  edit: {
    title: 'Properties',
    color: 'Color',
    fillColor: 'Fill color',
    label: 'Label',
    width: 'Width',
    hint: 'To remove label leave this field empty.',
    shape: 'Shape',
    text: 'Text',
    textHint: 'Icon or up to 2 characters shown inside the marker.',
    type: 'Geometry type',
    dashArray: 'Dash style',
    lineCap: 'Line cap',
    lineCapRound: 'Round',
    lineCapButt: 'Butt',
    lineCapSquare: 'Square',
    lineJoin: 'Line join',
    lineJoinRound: 'Round',
    lineJoinMiter: 'Miter',
    lineJoinBevel: 'Bevel',
  },
  continue: 'Continue',
  join: 'Join',
  split: 'Split',
  stopDrawing: 'Stop drawing',
  selectPointToJoin: 'Select point to join lines',
  defProps: {
    menuItem: 'Style settings',
    title: 'Default drawing style settings',
    applyToAll: 'Save and apply to all',
  },
  projection: {
    projectPoint: 'Project point',
    azimuth: 'Azimuth',
    distance: 'Distance',
  },
  reverse: 'Reverse direction',
  simplify: 'Simplify',
  cutHole: 'Cut out a hole',
  cutHoleHint: 'Draw the hole inside this polygon.',
  makeHole: 'Make a hole of the enclosing polygon',
  detachHole: 'Detach hole',
};

export default en;

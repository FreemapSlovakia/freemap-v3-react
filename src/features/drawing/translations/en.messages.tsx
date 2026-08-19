import type { DrawingMessages } from './DrawingMessages.js';

const en: DrawingMessages = {
  modify: 'Properties',
  edit: {
    title: 'Properties',
    color: 'Color',
    fillColor: 'Fill color',
    label: 'Label',
    width: 'Width',
    hint: 'Enter starts a new line. To remove the label, leave this field empty.',
    pointKeys:
      'Write {key} to draw a property, and {location} for the position.',
    lineKeys:
      'Write {key} to draw a property, {length} for the length ({length_m}, {length_km}, {length_mi}), and {azimuth} for a straight two-point line.',
    polygonKeys:
      'Write {key} to draw a property, {area} for the area ({area_m2}, {area_a}, {area_ha}, {area_km2}) and {perimeter} for the way round it ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
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
    properties: 'Properties',
    propertyKey: 'Name',
    propertyValue: 'Value',
    addProperty: 'Add property',
    removeProperty: 'Remove property',
    insertIntoLabel: 'Write into the label',
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

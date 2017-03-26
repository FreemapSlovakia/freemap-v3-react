import React from 'react';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

export const tileFormat = React.PropTypes.oneOf(['jpeg', 'png']);
export const mapType = React.PropTypes.oneOf(baseLayers.map(({ type }) => type));
export const overlays = React.PropTypes.arrayOf(
  React.PropTypes.oneOf(overlayLayers.map(({ type }) => type)),
);

export const object = React.PropTypes.shape({
  id: React.PropTypes.string.isRequired,
  lat: React.PropTypes.number.isRequired,
  lon: React.PropTypes.number.isRequired,
  tags: React.PropTypes.object.isRequired,
  typeId: React.PropTypes.string.isRequired,
});

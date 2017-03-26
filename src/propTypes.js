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

export const searchResult = React.PropTypes.shape({
  id: React.PropTypes.number.isRequired,
  label: React.PropTypes.string.isRequired,
  geojson: React.PropTypes.object.isRequired,
  lat: React.PropTypes.number.isRequired,
  lon: React.PropTypes.number.isRequired,
  tags: React.PropTypes.object.isRequired,
});

export const overlayOpacity = React.PropTypes.shape({
  N: React.PropTypes.number.isRequired,
});

export const point = React.PropTypes.shape({
  lat: React.PropTypes.number.isRequired,
  lon: React.PropTypes.number.isRequired,
});

export const points = React.PropTypes.arrayOf(point);

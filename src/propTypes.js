import React from 'react';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

module.exports = {
  tileFormat: React.PropTypes.oneOf([ 'jpeg', 'png' ]),
  mapType: React.PropTypes.oneOf(baseLayers.map(({ type }) => type)),
  overlays: React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(({ type }) => type)))
};

import React from 'react';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

export const tileFormat = React.PropTypes.oneOf([ 'jpeg', 'png' ]);
export const mapType = React.PropTypes.oneOf(baseLayers.map(({ type }) => type));
export const overlays = React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(({ type }) => type)));

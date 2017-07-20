import PropTypes from 'prop-types';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

export const tileFormat = PropTypes.oneOf(['jpeg', 'png']);
export const mapType = PropTypes.oneOf(baseLayers.map(({ type }) => type));
export const overlays = PropTypes.arrayOf(
  PropTypes.oneOf(overlayLayers.map(({ type }) => type)),
);

export const object = PropTypes.shape({
  id: PropTypes.number.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  tags: PropTypes.object.isRequired,
  typeId: PropTypes.number.isRequired,
});

export const searchResult = PropTypes.shape({
  id: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  geojson: PropTypes.object.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  tags: PropTypes.object.isRequired,
});

export const overlayOpacity = PropTypes.shape({
  N: PropTypes.number.isRequired,
});

export const point = PropTypes.shape({
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
});

export const elevationChartProfilePoint = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  ele: PropTypes.number,
  distanceFromStartInMeters: PropTypes.number,
});

export const points = PropTypes.arrayOf(point);

export const tool = PropTypes.oneOf(['search', 'objects', 'route-planner',
  'measure-dist', 'measure-ele', 'measure-area', 'select-home-location',
  'route-planner', 'location', 'track-viewer', 'info-point', 'changesets',
  'gallery', 'map-details']);

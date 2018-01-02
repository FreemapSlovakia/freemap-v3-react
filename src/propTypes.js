import PropTypes from 'prop-types';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

export const tileFormat = PropTypes.oneOf(['jpeg', 'png']);
export const mapType = PropTypes.oneOf(baseLayers.map(({ type }) => type));
export const overlays = PropTypes.arrayOf(PropTypes.oneOf(['I', ...overlayLayers.map(({ type }) => type)]));

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
  // N: PropTypes.number.isRequired,
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

export const tool = PropTypes.oneOf(['objects', 'route-planner',
  'measure-dist', 'measure-ele', 'measure-area',
  'route-planner', 'track-viewer', 'info-point', 'changesets',
  'gallery', 'map-details']);

export const galleryFilter = PropTypes.shape({
  tag: PropTypes.string,
  userId: PropTypes.number,
  takenAtFrom: PropTypes.instanceOf(Date),
  takenAtTo: PropTypes.instanceOf(Date),
  createdAtFrom: PropTypes.instanceOf(Date),
  createdAtTo: PropTypes.instanceOf(Date),
  ratingFrom: PropTypes.number,
  ratingTo: PropTypes.number,
});

export const galleryPictureModel = PropTypes.shape({
  position: point,
  title: PropTypes.string,
  description: PropTypes.string,
  takenAt: PropTypes.instanceOf(Date),
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
});

export const allTags = PropTypes.arrayOf(PropTypes.shape({
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
}).isRequired);

export const routeAlternative = PropTypes.shape({
  duration: PropTypes.number,
  distance: PropTypes.number,
  itinerary: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    desc: PropTypes.string.isRequired,
    km: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    shapePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
  }).isRequired).isRequired,
});

export const toastDef = {
  id: PropTypes.number.isRequired,
  message: PropTypes.node,
  messageKey: PropTypes.string,
  style: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    nameKey: PropTypes.string,
    action: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
    style: PropTypes.string,
  }).isRequired).isRequired,
};

export const toast = PropTypes.shape(toastDef);

export const startPoint = PropTypes.shape({
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  startTime: PropTypes.string,
});

export const finishPoint = PropTypes.shape({
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  lengthInKm: PropTypes.number.isRequired,
  finishTime: PropTypes.string,
});

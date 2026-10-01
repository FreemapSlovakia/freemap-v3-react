import { type MapBody, VIEWSHED_ATTRIBUTION } from '@shared/mapDefinitions.js';

const def: MapBody<'viewshed'> = {
  zIndex: 3,
  // No `defaultOpacity`: the image's own alpha is already faint over most of
  // a wide view, so there is nothing left to give away.
  attribution: VIEWSHED_ATTRIBUTION,
};

export default def;

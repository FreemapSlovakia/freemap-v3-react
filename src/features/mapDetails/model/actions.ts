import { createAction } from '@reduxjs/toolkit';

/**
 * The provider names are historical — this reads OSM data from freemap-osm-api
 * and geocodes against Photon. Treat the ids as opaque: they are part of the
 * saved-map format, and an id an older client doesn't know is dropped from the
 * document it reads (`mapDocumentSchema.ts`), so renaming them loses search
 * results from maps saved by a newer one.
 */
export type MapDetailsSource =
  | 'nominatim-reverse'
  | 'overpass-nearby'
  | 'overpass-surrounding'
  | `wms:${string}`;

export const mapDetailsExcludeSources = createAction<MapDetailsSource[]>(
  'mapDetails/excludeSources',
);

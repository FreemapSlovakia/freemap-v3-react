import { createAction } from '@reduxjs/toolkit';
import type { MapBody } from '@shared/mapDefinitions.js';
import type { CatalogMap } from '@shared/mapLibrary/catalogMap.js';

export const mapLibraryBodiesLoaded = createAction<Record<string, MapBody>>(
  'MAP_LIBRARY_BODIES_LOADED',
);

/** Catalog maps that became wanted; the ones already known are left alone. */
export const mapLibraryCatalogMapsLoaded = createAction<CatalogMap[]>(
  'MAP_LIBRARY_CATALOG_MAPS_LOADED',
);

/**
 * Steps the library aside to show a map. `restore`, what ending it puts back,
 * is filled in by its processor.
 */
export const mapLibraryPreviewStart = createAction<{
  type: string;
  restore?: string[];
}>('MAP_LIBRARY_PREVIEW_START');

/** Not the data layer `i`, which is on unless listed. */
export const canPreview = (type: string) => type !== 'i';

/** Ends a preview, keeping the map on or putting the earlier layers back. */
export const mapLibraryPreviewEnd = createAction<{ keep: boolean }>(
  'MAP_LIBRARY_PREVIEW_END',
);

/** Asks for the bodies that failed to load to be tried again. */
export const mapLibraryLoadRetry = createAction('MAP_LIBRARY_LOAD_RETRY');

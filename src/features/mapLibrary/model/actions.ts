import { createAction } from '@reduxjs/toolkit';
import type { MapBody } from '@shared/mapDefinitions.js';

export const mapLibraryBodiesLoaded = createAction<Record<string, MapBody>>(
  'MAP_LIBRARY_BODIES_LOADED',
);

/** Asks for the bodies that failed to load to be tried again. */
export const mapLibraryLoadRetry = createAction('MAP_LIBRARY_LOAD_RETRY');

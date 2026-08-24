import { createAction } from '@reduxjs/toolkit';
import type {
  TerrainErrorCode,
  TerrainProgress,
} from '@shared/terrainService.js';
import type { LatLon } from '@shared/types/common.js';
import type { ViewshedRenderInfo } from './reducer.js';
import type { ViewshedSettingsState } from './settingsReducer.js';

/**
 * Where to stand, and the ask for the overlay in one go — naming a place at all
 * is the explicit action a render this long needs.
 */
export const viewshedPick = createAction<LatLon>('VIEWSHED_PICK');

/**
 * Hands the map over to a click that says where to stand. A mode rather than a
 * map-click tool: the layer has no tool slot to own.
 */
export const viewshedSetPickingViewpoint = createAction<boolean>(
  'VIEWSHED_SET_PICKING_VIEWPOINT',
);

/**
 * Moves the viewpoint without rendering, so dragging its marker stages a new
 * place rather than queueing a render per pixel. {@link viewshedRender} commits.
 */
export const viewshedMoveViewpoint = createAction<LatLon>(
  'VIEWSHED_MOVE_VIEWPOINT',
);

/** Renders what the viewpoint and settings currently ask for. */
export const viewshedRender = createAction('VIEWSHED_RENDER');

/** Drops the render in flight. */
export const viewshedCancel = createAction('VIEWSHED_CANCEL');

/** Takes the viewpoint and its overlay away, leaving the layer on. */
export const viewshedClear = createAction('VIEWSHED_CLEAR');

export const viewshedSetRendering = createAction<boolean>(
  'VIEWSHED_SET_RENDERING',
);

/**
 * A finished render. The image isn't here — an object URL has to be revoked
 * when it is replaced; see `renderHolder`.
 */
export const viewshedSetRender = createAction<ViewshedRenderInfo>(
  'VIEWSHED_SET_RENDER',
);

export const viewshedSetError =
  createAction<TerrainErrorCode>('VIEWSHED_SET_ERROR');

/**
 * How far the render in flight has got, as the service reports it. Only ever
 * dispatched with something to say; what makes it stale — the render ending, an
 * error, the layer going — clears it in the reducer.
 */
export const viewshedSetProgress = createAction<TerrainProgress>(
  'VIEWSHED_SET_PROGRESS',
);

export const viewshedSetSettings = createAction<Partial<ViewshedSettingsState>>(
  'VIEWSHED_SET_SETTINGS',
);

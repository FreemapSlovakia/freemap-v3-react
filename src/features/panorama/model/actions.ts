import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaErrorCode } from '../api.js';
import type { PanoramaRenderInfo } from './reducer.js';
import type { PanoramaSettingsState } from './settingsReducer.js';

/**
 * A click on the map says where to stand, and asks for the panorama in one
 * gesture — the click is the explicit action a render this long needs.
 */
export const panoramaPick = createAction<LatLon>('PANORAMA_PICK');

/**
 * Moves the viewpoint without rendering, so dragging its marker stages a new
 * place rather than queueing a render per pixel. {@link panoramaRender} commits.
 */
export const panoramaMoveViewpoint = createAction<LatLon>(
  'PANORAMA_MOVE_VIEWPOINT',
);

/** Renders what the viewpoint and settings currently ask for. */
export const panoramaRender = createAction('PANORAMA_RENDER');

/** Drops the render in flight. */
export const panoramaCancel = createAction('PANORAMA_CANCEL');

/**
 * Bearing the middle of the viewer looks at. Dispatched once the turning
 * settles rather than per frame: every action writes the persisted state to
 * localStorage, which is not something to do sixty times a second.
 */
export const panoramaSetAzimuth = createAction<number>('PANORAMA_SET_AZIMUTH');

/** Takes the viewpoint and its picture away, leaving the tool open. */
export const panoramaClear = createAction('PANORAMA_CLEAR');

export const panoramaSetRendering = createAction<boolean>(
  'PANORAMA_SET_RENDERING',
);

/**
 * A finished render. The image and the distance buffer aren't here — they are
 * neither serializable nor small; see `renderHolder`.
 */
export const panoramaSetRender = createAction<PanoramaRenderInfo>(
  'PANORAMA_SET_RENDER',
);

export const panoramaSetError =
  createAction<PanoramaErrorCode>('PANORAMA_SET_ERROR');

export const panoramaToggleFullscreen = createAction<boolean | undefined>(
  'PANORAMA_TOGGLE_FULLSCREEN',
);

/**
 * Where a press in the picture landed on the map, read off the distance
 * buffer, or `null` to take the mark away.
 */
export const panoramaSetProbe = createAction<
  (LatLon & { distance: number }) | null
>('PANORAMA_SET_PROBE');

export const panoramaSetSettings = createAction<Partial<PanoramaSettingsState>>(
  'PANORAMA_SET_SETTINGS',
);

import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaErrorCode } from '../api.js';
import type { PanoramaRenderInfo } from './reducer.js';
import type { PanoramaSettingsState } from './settingsReducer.js';

/**
 * A place read out of the picture: where it is, how far off, and — where it was
 * picked by name rather than off the bare terrain — which summit it is. The
 * summit is what the label draws itself selected by, and what the marker and
 * the panel's footer have to say about it.
 */
export type PanoramaProbe = LatLon & {
  distance: number;
  /** Degrees clockwise from north, as read off the picture. */
  azimuth: number;
  peak?: {
    /** The label's own id, so the picture can mark which name is picked. */
    id: string;
    name: string;
    /** Metres above sea level, where the terrain model answered one. */
    ele: number | null;
  };
};

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

/**
 * Stand where the user is. A fix already in hand is used at once; otherwise
 * this turns locating on and the first fix to arrive picks the viewpoint —
 * which is why it is an action of its own rather than a `panoramaPick` the
 * button works out for itself.
 */
export const panoramaLocate = createAction('PANORAMA_LOCATE');

/**
 * Whether the panel is waiting for a fix to stand on. Dispatched by
 * `panoramaLocateProcessor` **after** it turns locating on, never by the button:
 * any `toggleLocate` clears the wait, so setting it first would clear it again
 * on the way in.
 */
export const panoramaSetAwaitingFix = createAction<boolean>(
  'PANORAMA_SET_AWAITING_FIX',
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
export const panoramaSetProbe = createAction<PanoramaProbe | null>(
  'PANORAMA_SET_PROBE',
);

export const panoramaSetSettings = createAction<Partial<PanoramaSettingsState>>(
  'PANORAMA_SET_SETTINGS',
);

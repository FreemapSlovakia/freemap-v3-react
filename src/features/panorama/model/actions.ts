import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';
import type { PanoramaErrorCode, PanoramaProgress } from '../api.js';
import type { PanoramaRenderInfo } from './reducer.js';
import type { PanoramaSettingsState } from './settingsReducer.js';

/**
 * A place read out of the picture: where it is, how far off, and — where it was
 * picked by name rather than off the bare terrain — which summit it is. The
 * summit is what the label draws itself selected by, and what the marker and
 * the readout over the picture have to say about it.
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
 * Where to stand, and the ask for the panorama in one go — naming a place at
 * all is the explicit action a render this long needs.
 */
export const panoramaPick = createAction<LatLon>('PANORAMA_PICK');

/**
 * Hands the map over to a click that says where to stand. A mode rather than a
 * map-click tool, so the panel can stay open beside the route planner.
 */
export const panoramaSetPickingViewpoint = createAction<boolean>(
  'PANORAMA_SET_PICKING_VIEWPOINT',
);

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

/**
 * How far the render in flight has got, as the service reports it. Only ever
 * dispatched with something to say; what makes it stale — a pass ending, an
 * error, the panel closing — clears it in the reducer.
 */
export const panoramaSetProgress = createAction<PanoramaProgress>(
  'PANORAMA_SET_PROGRESS',
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

/**
 * Turns the picture into a toposcope: the viewpoint becomes the dial's centre
 * and every named summit a drawn point, which is what the dial draws its rays
 * to. `replace` takes the drawn points already on the map away first, which is
 * asked for rather than decided here — see `PanoramaControls`.
 */
export const panoramaToToposcope = createAction<{ replace: boolean }>(
  'PANORAMA_TO_TOPOSCOPE',
);

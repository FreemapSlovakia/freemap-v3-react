import { createAction } from '@reduxjs/toolkit';

/** Opens the Map layers panel, or closes it, as its toolbar button does. */
export const mapLayersPanelToggle = createAction('MAP_LAYERS_PANEL_TOGGLE');

import { splitColorAlpha } from '@shared/colorAlpha.js';
import type { PathOptions } from 'leaflet';
import type { DrawingStyle } from './model/reducers/drawingSettingsReducer.js';

/**
 * Maps a `DrawingStyle` to Leaflet `PathOptions`: the RGBA `color`/`fillColor`
 * are split into solid color + `opacity`/`fillOpacity`, and the dash array is
 * serialized to the SVG `dashArray` string.
 */
export function drawingStyleToPathOptions(style: DrawingStyle): PathOptions {
  const stroke = splitColorAlpha(style.color);

  const fill = splitColorAlpha(style.fillColor);

  return {
    color: stroke.color,
    opacity: stroke.opacity,
    weight: style.width,
    fillColor: fill.color,
    fillOpacity: fill.opacity,
    dashArray: style.dashArray.length ? style.dashArray.join(' ') : undefined,
    lineCap: style.lineCap,
    lineJoin: style.lineJoin,
  };
}

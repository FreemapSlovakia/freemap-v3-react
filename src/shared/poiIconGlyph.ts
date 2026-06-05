import type { PoiIconBBox } from '@osm/poiIconBBoxes.js';

// The marker artwork is authored in a viewBox 310 units wide, and on screen the
// marker is shown at MARKER_REF_WIDTH px (the Leaflet iconSize width / the
// default export marker width). So 310 viewBox units map to MARKER_REF_WIDTH px.
export const MARKER_VIEWBOX_WIDTH = 310;

export const MARKER_REF_WIDTH = 24;

// Drawing a poi icon at this many viewBox units per icon unit makes it render at
// its *natural* pixel size — identical to the same icon on a map tile — when the
// marker is displayed at MARKER_REF_WIDTH (`310 viewBox units → 24 px` cancels
// the scale, leaving 1 icon unit = 1 px). The map renderer draws poi icons at
// their `ink_extents()` unscaled, so this is true natural-size parity; markers
// shown larger (document export) scale icon and shape together, keeping the
// proportions. This replaces the old hand-tuned POI_REF_UNIT constant.
const NATURAL_SCALE = MARKER_VIEWBOX_WIDTH / MARKER_REF_WIDTH;

// Given an icon's precomputed drawing bbox, returns the rect at which to draw
// the *whole* SVG canvas so the drawing renders at its natural size and its bbox
// center lands on (cx, cy). The canvas padding is transparent, so the whole
// image is drawn (no cropping viewport — that would clip edge-touching icons and
// jitter sub-pixel as the marker pans). The longer drawing side is clamped to
// glyphSize so oversized icons (area/line patterns, big-viewBox icons) still fit
// the badge.
export function poiIconGlyphRect(
  bbox: PoiIconBBox,
  cx: number,
  cy: number,
  glyphSize: number,
): { x: number; y: number; width: number; height: number } {
  const [lx, ly, bw, bh, vbW, vbH] = bbox;

  const scale = Math.min(NATURAL_SCALE, glyphSize / Math.max(bw, bh));

  return {
    x: cx - (lx + bw / 2) * scale,
    y: cy - (ly + bh / 2) * scale,
    width: vbW * scale,
    height: vbH * scale,
  };
}

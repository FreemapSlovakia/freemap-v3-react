import type { PoiIconBBox } from '@osm/poiIconBBoxes.js';

// poiIcons are hand-drawn at intrinsic sizes that encode their intended
// relative scale (the map renderer draws them at that size, unscaled). So
// rather than normalizing each to fill the glyph box, scale them all by one
// common factor (glyphSize / POI_REF_UNIT): POI_REF_UNIT is the drawing extent,
// in icon units, that maps to a full glyphSize. Smaller icons (peak, saddle)
// render proportionally smaller, matching the map; larger ones are clamped.
export const POI_REF_UNIT = 14;

// Given an icon's precomputed drawing bbox, returns the rect at which to draw
// the *whole* SVG canvas so the drawing is scaled by the common factor and its
// bbox center lands on (cx, cy). The canvas padding is transparent, so the
// whole image is drawn (no cropping viewport — that would clip edge-touching
// icons and jitter sub-pixel as the marker pans). The longer drawing side is
// clamped to glyphSize so oversized icons (area/line patterns) still fit.
export function poiIconGlyphRect(
  bbox: PoiIconBBox,
  cx: number,
  cy: number,
  glyphSize: number,
): { x: number; y: number; width: number; height: number } {
  const [lx, ly, bw, bh, vbW, vbH] = bbox;

  const scale = Math.min(
    glyphSize / POI_REF_UNIT,
    glyphSize / Math.max(bw, bh),
  );

  return {
    x: cx - (lx + bw / 2) * scale,
    y: cy - (ly + bh / 2) * scale,
    width: vbW * scale,
    height: vbH * scale,
  };
}

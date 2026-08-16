import Color from 'color';

export const COLORS = {
  normal: '#d00000',
  selected: '#f07b5d',
};

// A marker's glyph sits on an inset inside the colored shape. White normally;
// a glyph too pale to read on white gets a dark inset instead, so a light
// marker color stays legible without altering the color the user picked.
export const GLYPH_INSET_LIGHT = '#fff';
export const GLYPH_INSET_DARK = '#333';

// Ink for the poi icons that carry colors of their own (springs, water, trees):
// they are drawn for a light map tile, so their uncolored parts stay black on
// the white inset rather than following the marker color.
export const POI_ARTWORK_INK = '#000';

// WCAG asks 3:1 for graphical objects; 2:1 is deliberately laxer so only
// genuinely washed-out colors flip. Every color in the app's own marker
// palettes clears it on white (the palest, #409a40, sits at 3.55), while a
// pale yellow (1.51) or a near-white (1.00) drops below and takes the dark
// inset, where it lands at 8:1 or better.
const MIN_GLYPH_CONTRAST = 2;

/** Inset background that the given glyph color stays readable on. */
export function glyphInsetColor(glyphColor: string): string {
  try {
    return Color(glyphColor).contrast(Color(GLYPH_INSET_LIGHT)) <
      MIN_GLYPH_CONTRAST
      ? GLYPH_INSET_DARK
      : GLYPH_INSET_LIGHT;
  } catch {
    return GLYPH_INSET_LIGHT;
  }
}

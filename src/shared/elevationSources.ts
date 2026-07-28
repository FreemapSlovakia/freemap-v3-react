/**
 * Countries the elevation API answers from a national high-resolution terrain
 * model; everywhere else it falls back to the global 30 m GEDTM30. This is what
 * the premium offer advertises, so it must track the models the API actually
 * holds.
 *
 * Deliberately separate from the outdoor renderer's shading sources
 * (`OUTDOOR_NATIONAL_DTM_ATTRIBUTION` in `mapDefinitions.tsx`): the two sets
 * overlap but are not the same — the renderer also shades Norway, which the
 * elevation API has no model for.
 */
export const ELEVATION_API_DTM_COUNTRIES = [
  'at',
  'ch',
  'cz',
  'es',
  'fi',
  'fr',
  'it',
  'pl',
  'se',
  'si',
  'sk',
];

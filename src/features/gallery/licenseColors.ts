import type { GalleryLicense } from './licenseDefs.js';

/**
 * Categorical marble colors for the "colorize by license" mode, ordered
 * permissive (green) → restrictive (red). Kept in a React-free module (a
 * type-only {@link GalleryLicense} import, erased at build time) so the gallery
 * tile-render worker can import it without pulling in the icon set or zod.
 */
export const LICENSE_COLORS: Record<GalleryLicense, string> = {
  'CC0-1.0': '#4caf50',
  'CC-BY-4.0': '#8bc34a',
  'CC-BY-SA-4.0': '#ffeb3b',
  'CC-BY-NC-4.0': '#ff9800',
  'CC-BY-NC-SA-4.0': '#f44336',
};

/**
 * Color for an unrecognized/missing id — the default license's color, matching
 * the "unknown → default" rule in `getPhotoLicense()` and the `PictureSchema`
 * `.catch(DEFAULT_PHOTO_LICENSE)` decode. The literal key mirrors
 * `DEFAULT_PHOTO_LICENSE` (kept literal to keep this module zod-free).
 */
export const FALLBACK_LICENSE_COLOR = LICENSE_COLORS['CC-BY-SA-4.0'];

/**
 * Extra license families only Wikimedia photos carry (own photos are CC-only,
 * so these aren't in {@link GalleryLicense}). The server maps a photo's raw
 * Wikidata license to one of these or a CC id (see the api repo's
 * `wikimediaLicense.ts`).
 */
export const EXTRA_LICENSE_COLORS: Record<string, string> = {
  PD: '#26a69a', // public domain — most permissive
  GFDL: '#7e57c2', // copyleft, distinct from the CC ramp
};

/** Colorize color for a license id — an own {@link GalleryLicense} or a
 *  Wikimedia family (incl. GFDL/PD); unknown/missing → the fallback color. */
export function licenseColor(license: string | null | undefined): string {
  return (
    (license &&
      (LICENSE_COLORS[license as GalleryLicense] ??
        EXTRA_LICENSE_COLORS[license])) ||
    FALLBACK_LICENSE_COLOR
  );
}

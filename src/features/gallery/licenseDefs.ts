import { z } from 'zod';

/**
 * The single source of truth for the photo-license ids, kept React-free so the
 * gallery tile-render worker (via `licenseColors.ts`) can import it without
 * pulling in the icon set. Everything else — the CC badges/urls
 * (`licenses.tsx`), the marble colors (`licenseColors.ts`), and the localized
 * names/descriptions (`translations/*`) — is keyed off this list.
 *
 * When adding a license, update, in order:
 *   1. this list;
 *   2. `LICENSE_COLORS` in `licenseColors.ts` (compile-enforced by the type);
 *   3. `LICENSE_URLS` / `LICENSE_ICONS` in `licenses.tsx` (compile-enforced);
 *   4. `license.names` / `license.descriptions` in `translations/en.messages`
 *      (compile-enforced) and each `<lang>.template` (NOT enforced — a missing
 *      locale entry silently renders the raw id);
 *   5. the server allowlist in the freemap-v3-api repo (separate, unchecked).
 */
export const PHOTO_LICENSE_IDS = [
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-NC-4.0',
  'CC-BY-NC-SA-4.0',
] as const;

export type GalleryLicense = (typeof PHOTO_LICENSE_IDS)[number];

export const DEFAULT_PHOTO_LICENSE: GalleryLicense = 'CC-BY-SA-4.0';

export const LICENSE_URLS: Record<GalleryLicense, string> = {
  'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC-BY-NC-4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'CC-BY-NC-SA-4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
};

export const GalleryLicenseSchema = z.enum(PHOTO_LICENSE_IDS);

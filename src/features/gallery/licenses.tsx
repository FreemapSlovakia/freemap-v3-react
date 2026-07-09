import type { ReactElement } from 'react';
import type { IconType } from 'react-icons';
import {
  FaCreativeCommons,
  FaCreativeCommonsBy,
  FaCreativeCommonsNc,
  FaCreativeCommonsSa,
  FaCreativeCommonsZero,
} from 'react-icons/fa';
import {
  DEFAULT_PHOTO_LICENSE,
  type GalleryLicense,
  LICENSE_URLS,
  PHOTO_LICENSE_IDS,
} from './licenseDefs.js';

// Re-exported so consumers can import the license core from one place.
export {
  DEFAULT_PHOTO_LICENSE,
  type GalleryLicense,
  GalleryLicenseSchema,
} from './licenseDefs.js';

/**
 * The CC building-block icons composing each license badge shown in the viewer,
 * legend, and edit form. Deliberately excludes No-Derivatives (the app makes
 * thumbnails/derivatives) and all-rights-reserved (photos are published for
 * reuse). Keyed by id so adding a license is a compile error until filled in.
 */
const LICENSE_ICONS: Record<GalleryLicense, IconType[]> = {
  'CC0-1.0': [FaCreativeCommons, FaCreativeCommonsZero],
  'CC-BY-4.0': [FaCreativeCommons, FaCreativeCommonsBy],
  'CC-BY-SA-4.0': [FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsSa],
  'CC-BY-NC-4.0': [FaCreativeCommons, FaCreativeCommonsBy, FaCreativeCommonsNc],
  'CC-BY-NC-SA-4.0': [
    FaCreativeCommons,
    FaCreativeCommonsBy,
    FaCreativeCommonsNc,
    FaCreativeCommonsSa,
  ],
};

export type PhotoLicense = {
  id: GalleryLicense;
  url: string;
  icons: IconType[];
};

/** The pickable licenses, most permissive first (order of {@link PHOTO_LICENSE_IDS}). */
export const PHOTO_LICENSES: readonly PhotoLicense[] = PHOTO_LICENSE_IDS.map(
  (id) => ({ id, url: LICENSE_URLS[id], icons: LICENSE_ICONS[id] }),
);

const byId = new Map(PHOTO_LICENSES.map((l) => [l.id, l]));

/**
 * Returns the license definition for an id. An unrecognized or missing id is
 * treated as {@link DEFAULT_PHOTO_LICENSE} — the same "unknown → default" rule
 * enforced at the `PictureSchema` decode boundary (`.catch`).
 */
export function getPhotoLicense(id: string | null | undefined): PhotoLicense {
  return (
    byId.get((id ?? '') as GalleryLicense) ?? byId.get(DEFAULT_PHOTO_LICENSE)!
  );
}

type LicenseBadgeProps = {
  licenseId: string | null | undefined;
  className?: string;
};

/** The composed row of Creative Commons icons for a license. */
export function LicenseBadge({
  licenseId,
  className,
}: LicenseBadgeProps): ReactElement {
  const { icons } = getPhotoLicense(licenseId);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        gap: '0.15em',
        verticalAlign: 'text-bottom',
      }}
    >
      {icons.map((Icon, i) => (
        <Icon key={i} />
      ))}
    </span>
  );
}

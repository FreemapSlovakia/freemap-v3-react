import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { type ReactElement, type ReactNode, useMemo } from 'react';
import {
  type GalleryLicense,
  LicenseBadge,
  PHOTO_LICENSES,
} from '../licenses.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

type Props = {
  /** The selected license, or `undefined` when there is no common value. */
  value: GalleryLicense | undefined;
  onChange: (license: GalleryLicense) => void;
  /** Shown on the toggle when `value` is `undefined` (mixed selection). */
  placeholder?: ReactNode;
  id?: string;
  className?: string;
};

/**
 * License picker rendered as a `<select>`-styled dropdown so each option can
 * carry its Creative Commons badge (native `<option>` can't hold SVGs).
 */
export function GalleryLicenseSelect({
  value,
  onChange,
  placeholder,
  id,
  className,
}: Props): ReactElement {
  const gm = useGalleryMessages();

  const options = useMemo(
    () =>
      PHOTO_LICENSES.map(({ id }) => ({
        value: id,
        label: gm?.license.names[id] ?? id,
        icon: <LicenseBadge licenseId={id} />,
        title: gm?.license.descriptions[id],
      })),
    [gm],
  );

  return (
    <SelectDropdown
      asSelect
      id={id}
      className={className}
      value={value}
      toggleLabel={value === undefined ? placeholder : undefined}
      onSelect={(v) => {
        if (v) {
          onChange(v as GalleryLicense);
        }
      }}
      options={options}
    />
  );
}

import type { LatLon } from '@shared/types/common.js';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { usePlaceName } from '../hooks/usePlaceName.js';

type Props = {
  position: LatLon | null | undefined;
  className?: string;
};

/**
 * What lies at a picked position, beside coordinates nobody can picture. Shows
 * nothing until the geocoder answers, and nothing at all offline.
 */
export function PlaceName({ position, className }: Props): ReactElement | null {
  const name = usePlaceName(position);

  return name ? (
    <small className={clsx('d-block text-muted', className)}>{name}</small>
  ) : null;
}

import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { mapPickSetPosition } from '../model/actions.js';
import { useClearMapPickOnLeave } from '../useClearMapPickOnLeave.js';

/** {@link PickMarker} over the shared `mapPick` slice. */
export function MapPickMarker({
  faIcon,
}: {
  faIcon: ReactElement;
}): ReactElement | null {
  const position = useAppSelector((state) => state.mapPick.position);

  useClearMapPickOnLeave();

  return (
    <PickMarker
      position={position}
      pickAction={mapPickSetPosition}
      faIcon={faIcon}
    />
  );
}

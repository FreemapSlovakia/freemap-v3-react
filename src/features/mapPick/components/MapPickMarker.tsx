import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { LatLon } from '@shared/types/common.js';
import { type ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { mapPickSetPosition } from '../model/actions.js';
import { useClearMapPickOnLeave } from '../useClearMapPickOnLeave.js';

/** {@link PickMarker} over the shared `mapPick` slice. */
export function MapPickMarker({
  faIcon,
}: {
  faIcon: ReactElement;
}): ReactElement | null {
  const dispatch = useDispatch();

  const position = useAppSelector((state) => state.mapPick.position);

  const handlePick = useCallback(
    (at: LatLon) => dispatch(mapPickSetPosition(at)),
    [dispatch],
  );

  useClearMapPickOnLeave();

  return <PickMarker position={position} onPick={handlePick} faIcon={faIcon} />;
}

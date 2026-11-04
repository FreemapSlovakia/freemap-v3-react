import { setSelectingHomeLocation } from '@features/homeLocation/model/actions.js';
import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaHome } from 'react-icons/fa';

export function HomeLocationPickingResult(): ReactElement {
  const position = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation || null,
  );

  return (
    <PickMarker
      position={position}
      pickAction={setSelectingHomeLocation}
      faIcon={<FaHome />}
    />
  );
}

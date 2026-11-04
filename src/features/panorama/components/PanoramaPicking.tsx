import { MapPickMarker } from '@features/mapPick/components/MapPickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCrosshairs, FaStreetView } from 'react-icons/fa';

/**
 * Stages where to stand or what to look at; `PanoramaPickingMenu` confirms it.
 */
export default function PanoramaPicking(): ReactElement {
  const picking = useAppSelector((state) => state.panorama.picking);

  return (
    <MapPickMarker
      // Remounting on a switch between viewpoint and target drops the pick.
      key={picking}
      faIcon={picking === 'target' ? <FaCrosshairs /> : <FaStreetView />}
    />
  );
}

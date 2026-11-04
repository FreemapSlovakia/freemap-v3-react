import { MapPickMarker } from '@features/mapPick/components/MapPickMarker.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

/** Stages where the dial stands; `ToposcopeCenterPickingMenu` confirms it. */
export default function ToposcopeCenterPicking(): ReactElement {
  return <MapPickMarker faIcon={<FaMapMarkerAlt />} />;
}

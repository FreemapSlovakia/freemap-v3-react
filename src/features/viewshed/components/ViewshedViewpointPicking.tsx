import { MapPickMarker } from '@features/mapPick/components/MapPickMarker.js';
import type { ReactElement } from 'react';
import { FaEye } from 'react-icons/fa';

/** Stages where to stand; `ViewshedViewpointPickingMenu` confirms it. */
export default function ViewshedViewpointPicking(): ReactElement {
  return <MapPickMarker faIcon={<FaEye />} />;
}

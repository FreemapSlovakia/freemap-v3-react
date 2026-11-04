import { PickMarker } from '@shared/components/PickMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCamera } from 'react-icons/fa';
import { gallerySetPickingPosition } from '../model/actions.js';

export function GalleryPositionPicking(): ReactElement {
  const position = useAppSelector((state) => state.gallery.pickingPosition);

  return (
    <PickMarker
      position={position}
      pickAction={gallerySetPickingPosition}
      faIcon={<FaCamera />}
    />
  );
}

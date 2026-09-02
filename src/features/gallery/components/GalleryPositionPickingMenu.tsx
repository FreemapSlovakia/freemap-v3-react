import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from '../model/actions.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

export default function GalleryPositionPickingMenu(): ReactElement {
  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  return (
    <PickingMenu
      prompt={gm?.locationPicking.title}
      onConfirm={() => dispatch(galleryConfirmPickedPosition())}
      onCancel={() => dispatch(gallerySetItemForPositionPicking(null))}
      cancelKbd="Esc"
    />
  );
}

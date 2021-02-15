import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from 'fm3/actions/galleryActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function GalleryPositionPickingMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const pickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId !== null,
  );

  return !pickingPosition ? null : (
    <Card className="fm-toolbar mx-2 mt-2">
      <div className="m-2">{m?.gallery.locationPicking.title}</div>
      <Button
        className="mr-1"
        onClick={() => {
          dispatch(galleryConfirmPickedPosition());
        }}
      >
        <FaCheck />
        <span className="d-none d-sm-inline"> {m?.general.ok}</span>
      </Button>
      <Button
        onClick={() => {
          dispatch(gallerySetItemForPositionPicking(null));
        }}
      >
        <FaTimes />
        <span className="d-none d-sm-inline"> {m?.general.cancel}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Card>
  );
}

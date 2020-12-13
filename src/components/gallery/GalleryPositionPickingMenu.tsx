import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from 'fm3/actions/galleryActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useDispatch, useSelector } from 'react-redux';

export function GalleryPositionPickingMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const pickingPosition = useSelector(
    (state: RootState) => state.gallery.pickingPositionForId !== null,
  );

  return !pickingPosition ? null : (
    <Card className="fm-toolbar">
      {m?.gallery.locationPicking.title}{' '}
      <Button
        onClick={() => {
          dispatch(galleryConfirmPickedPosition());
        }}
      >
        <FontAwesomeIcon icon="check" />
        <span className="d-none d-sm-inline"> {m?.general.ok}</span>
      </Button>{' '}
      <Button
        onClick={() => {
          dispatch(gallerySetItemForPositionPicking(null));
        }}
      >
        <FontAwesomeIcon icon="times" />
        <span className="d-none d-sm-inline"> {m?.general.cancel}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Card>
  );
}

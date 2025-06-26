import type { ReactElement } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from '../../actions/galleryActions.js';
import { useMessages } from '../../l10nInjector.js';

export default GalleryPositionPickingMenu;

export function GalleryPositionPickingMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <div>
      <Card className="fm-toolbar mt-2">
        <div className="m-2">{m?.gallery.locationPicking.title}</div>

        <Button
          className="me-1"
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
    </div>
  );
}

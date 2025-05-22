import { type ReactElement, useCallback } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { galleryCancelShowOnTheMap } from '../../actions/galleryActions.js';
import { useMessages } from '../../l10nInjector.js';

export default GalleryShowPositionMenu;

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  return (
    <Card className="fm-toolbar mx-2 mt-2">
      <Button onClick={close}>
        <FaChevronLeft />
        <span className="d-none d-sm-inline"> {m?.general.back}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Card>
  );
}

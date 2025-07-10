import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { galleryCancelShowOnTheMap } from '../../actions/galleryActions.js';
import { useMessages } from '../../l10nInjector.js';
import { Toolbar } from '../Toolbar.js';

export default GalleryShowPositionMenu;

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  return (
    <Toolbar className="mt-2">
      <Button onClick={close}>
        <FaChevronLeft />
        <span className="d-none d-sm-inline"> {m?.general.back}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Toolbar>
  );
}

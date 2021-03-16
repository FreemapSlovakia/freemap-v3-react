import { galleryCancelShowOnTheMap } from 'fm3/actions/galleryActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useCallback, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const showPosition = useSelector(
    (state: RootState) => state.gallery.showPosition,
  );

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  useEffect(() => {
    if (showPosition) {
      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.code === 'Escape') {
          close();
        }
      };

      // can't use keydown because it would close the modal
      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [close, showPosition]);

  return !showPosition ? null : (
    <Card className="fm-toolbar mx-2 mt-2">
      <Button onClick={close}>
        <FaChevronLeft />
        <span className="d-none d-sm-inline"> {m?.general.back}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Card>
  );
}

import { useEffect, useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { galleryCancelShowOnTheMap } from 'fm3/actions/galleryActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { Button, Card } from 'react-bootstrap';

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const showPosition = useSelector(
    (state: RootState) => state.gallery.showPosition,
  );

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    // can't use keydown because it would close themodal
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp]);

  return !showPosition ? null : (
    <Card className="fm-toolbar">
      <Button onClick={close}>
        <FontAwesomeIcon icon="chevron-left" />
        <span className="d-none d-sm-inline"> {m?.general.back}</span>{' '}
        <kbd>Esc</kbd>
      </Button>
    </Card>
  );
}

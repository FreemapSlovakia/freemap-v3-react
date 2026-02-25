import { setActiveModal } from '@app/store/actions.js';
import { showGalleryViewerSelector } from '@app/store/selectors.js';
import { galleryClear } from '@features/gallery/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { MouseEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { isPremium } from '../premium.js';

export function useBecomePremium() {
  const dispatch = useDispatch();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const showGalleryViewer = useAppSelector(showGalleryViewerSelector);

  const becomePremium = useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault();

      e?.stopPropagation();

      // close gallery viewer if open; TODO ugly
      if (showGalleryViewer) {
        dispatch(galleryClear());
      }

      dispatch(setActiveModal('premium'));
    },
    [dispatch, showGalleryViewer],
  );

  return premium ? undefined : becomePremium;
}

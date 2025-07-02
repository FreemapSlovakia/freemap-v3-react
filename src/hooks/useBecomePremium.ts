import { MouseEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { galleryClear } from '../actions/galleryActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { isPremium } from '../premium.js';
import { showGalleryViewerSelector } from '../selectors/mainSelectors.js';
import { useAppSelector } from './reduxSelectHook.js';

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

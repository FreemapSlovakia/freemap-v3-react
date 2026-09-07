import { setActiveModal } from '@app/store/actions.js';
import { showGalleryViewerSelector } from '@app/store/selectors.js';
import { galleryClear } from '@features/gallery/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type MouseEvent, useCallback } from 'react';
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

      // Buying premium means signing in and paying, which does not belong in
      // an iframe on somebody else's page — third-party cookie rules and the
      // payment provider's own framing rules can both break it there, and the
      // account the purchase lands in is the portal's, not the host page's.
      // So the embed sends the whole flow to the portal in a tab of its own.
      if (window.fmEmbedded) {
        window.open('/#show=premium', '_blank', 'noopener');

        return;
      }

      // close gallery viewer if open; TODO ugly
      if (showGalleryViewer) {
        dispatch(galleryClear());
      }

      dispatch(setActiveModal({ type: 'premium' }));
    },
    [dispatch, showGalleryViewer],
  );

  return premium ? undefined : becomePremium;
}

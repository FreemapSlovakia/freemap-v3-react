import { MouseEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { galleryClear } from '../actions/galleryActions.js';
import { removeAdsOnLogin, setActiveModal } from '../actions/mainActions.js';
import { isPremium } from '../premium.js';
import { useAppSelector } from './reduxSelectHook.js';

export function useBecomePremium() {
  const dispatch = useDispatch();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const becomePremium = useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault();

      e?.stopPropagation();

      dispatch(galleryClear());

      if (premium == null) {
        dispatch(setActiveModal('login'));

        dispatch(removeAdsOnLogin());
      } else {
        dispatch(setActiveModal('remove-ads'));
      }
    },
    [dispatch, premium],
  );

  return premium ? undefined : becomePremium;
}

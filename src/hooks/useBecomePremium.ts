import { MouseEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { galleryClear } from '../actions/galleryActions.js';
import { removeAdsOnLogin, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from './reduxSelectHook.js';

export function useBecomePremium() {
  const dispatch = useDispatch();

  const isPremium = useAppSelector(
    (state) => !!state.auth.user?.premiumExpiration,
  );

  const becomePremium = useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault();

      e?.stopPropagation();

      dispatch(galleryClear());

      if (isPremium == null) {
        dispatch(setActiveModal('login'));

        dispatch(removeAdsOnLogin());
      } else {
        dispatch(setActiveModal('remove-ads'));
      }
    },
    [dispatch, isPremium],
  );

  return isPremium ? undefined : becomePremium;
}

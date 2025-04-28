import { MouseEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeAdsOnLogin, setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from './reduxSelectHook.js';

export function useBecomePremium() {
  const dispatch = useDispatch();

  const isPremium = useAppSelector((state) => state.auth.user?.isPremium);

  const becomePremium = useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault();

      e?.stopPropagation();

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

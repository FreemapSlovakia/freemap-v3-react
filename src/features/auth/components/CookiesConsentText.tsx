import type { ReactNode } from 'react';
import { AlertLink } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { askingCookieConsentSelector } from '@/app/store/selectors.js';
import { createCookieConsentToastAction } from '@/features/cookieConsent/model/toastAction.js';
import { useAppSelector } from '@/shared/hooks/useAppSelector.js';

type Props = {
  children: ReactNode;
};

export function CookiesConsentText({ children }: Props) {
  const dispatch = useDispatch();

  const askingCookieConsent = useAppSelector(askingCookieConsentSelector);

  return askingCookieConsent ? (
    children
  ) : (
    <AlertLink
      onClick={(e) => {
        e.preventDefault();

        dispatch(createCookieConsentToastAction());
      }}
    >
      {children}
    </AlertLink>
  );
}

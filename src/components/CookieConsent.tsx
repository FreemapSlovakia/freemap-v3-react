import { setAnalyticCookiesAllowed } from 'fm3/actions/mainActions';
import { ReactElement } from 'react';
import FormCheck from 'react-bootstrap/FormCheck';
import { useDispatch, useSelector } from 'react-redux';

type Props = { prompt: string; local: string; analytics: string };

export function CookieConsent({
  prompt,
  local,
  analytics,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const analyticCookiesAllowed = useSelector(
    (state) => state.main.analyticCookiesAllowed,
  );

  return (
    <>
      <p>{prompt}</p>
      <FormCheck
        id="chkCookieSocialLogin"
        type="checkbox"
        label={local}
        checked
        disabled
      />
      <FormCheck
        id="chkCookieAnalytics"
        type="checkbox"
        label={analytics}
        checked={analyticCookiesAllowed}
        onChange={(e) => {
          dispatch(setAnalyticCookiesAllowed(e.currentTarget.checked));
        }}
      />
    </>
  );
}

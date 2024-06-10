import { setAnalyticCookiesAllowed } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { ReactElement } from 'react';
import Form from 'react-bootstrap/Form';
import { useDispatch } from 'react-redux';

type Props = { prompt: string; local: string; analytics: string };

export function CookieConsent({
  prompt,
  local,
  analytics,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const analyticCookiesAllowed = useAppSelector(
    (state) => state.main.analyticCookiesAllowed,
  );

  return (
    <>
      <p>{prompt}</p>

      <Form.Check
        id="chkCookieSocialLogin"
        type="checkbox"
        label={local}
        checked
        disabled
      />

      <Form.Check
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

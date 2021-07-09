import { authChooseLoginMethod } from 'fm3/actions/authActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';

export function Ad(): ReactElement {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  const dispatch = useDispatch();

  function hideAd() {
    dispatch(authChooseLoginMethod('rm-ad'));
  }

  const m = useMessages();

  return (
    <div className="bg-light p-1 mt-2 mx-2 rounded d-flex f-gap-1">
      <ins
        className="adsbygoogle ad"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2465248996193624"
        data-ad-slot="3122534669"
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />

      <Button variant="warning" size="sm" onClick={hideAd}>
        <div
          style={{
            writingMode: 'vertical-lr',
            textOrientation: 'mixed',
            width: '1.25rem',
          }}
        >
          {m?.general.remove}
        </div>
      </Button>
    </div>
  );
}

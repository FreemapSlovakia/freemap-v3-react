import { authChooseLoginMethod } from 'fm3/actions/authActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';

export function Ad(): ReactElement {
  const adContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');

    script.src =
      'https://sk.search.etargetnet.com/generic/header_bidding.php?ref=59243';

    adContainer.current?.appendChild(script);
  }, []);

  const dispatch = useDispatch();

  const m = useMessages();

  return (
    <div className="bg-light p-1 mt-2 mx-2 rounded d-flex f-gap-1 etarget-hb-wrap">
      <div className="ad etarget-id-59243" ref={adContainer} />

      <Button
        variant="warning"
        size="sm"
        onClick={() => dispatch(authChooseLoginMethod('rm-ad'))}
      >
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

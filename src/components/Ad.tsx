import { type ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useMessages } from '../l10nInjector.js';

export default Ad;

export function Ad(): ReactElement | null {
  const [closed, setClosed] = useState(false);

  const m = useMessages();

  const becomePremium = useBecomePremium();

  const [closeTime, setCloseTime] = useState(0);

  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handle = () => setHeight(window.innerHeight);

    window.addEventListener('resize', handle);

    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    setCloseTime(10);

    const i = window.setInterval(() => setCloseTime((t) => t - 1), 1_000);

    return () => window.clearInterval(i);
  }, []);

  return (
    <div
      className={`mt-2 mx-2 d-flex flex-column ${
        closed ? 'invisible' : 'visible'
      }`}
    >
      <div className="border rounded-top rounded-start fm-rklm p-1">
        <div className="border px-3 py-2 rounded bg-body text-body">
          {m?.main.ad(
            <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>,
          )}
        </div>
      </div>

      <div className="align-self-end d-flex">
        {height < 600 && (
          <Button
            className="py-0 rounded-bottom me-1"
            style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
            variant="warning"
            size="sm"
            onClick={() => setClosed(true)}
            disabled={closeTime > 0}
          >
            {m?.general.close} {closeTime > 0 ? ` (${closeTime})` : null}
          </Button>
        )}

        <Button
          className="py-0 rounded-bottom"
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          variant="warning"
          size="sm"
          onClick={becomePremium}
        >
          {m?.general.remove}
        </Button>
      </div>
    </div>
  );
}

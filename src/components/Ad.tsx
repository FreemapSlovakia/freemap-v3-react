import { type ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useAd } from '../hooks/useAd.js';
import { useBecomePremium } from '../hooks/useBecomePremium.js';
import { useLeftMarginAdjuster } from '../hooks/useLeftMarginAdjuster.js';
import tShirt from '../images/fm-t-shirt.jpg';
import rovasAd from '../images/rovas_reklama.svg';
import { useMessages } from '../l10nInjector.js';

export default Ad;

const ads = {
  tShirt: 4, // freemap t-shirt
  rovas: 1, // rovas
  self: 8, // self promo
};

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

  const ad = useAd(ads);

  const ref = useLeftMarginAdjuster();

  return (
    <div
      className={`mt-2 d-flex flex-column ${closed ? 'invisible' : 'visible'}`}
    >
      <div className="border rounded-top rounded-start fm-toolbar" ref={ref}>
        {ad === 'self' ? (
          <div
            className="border px-3 py-2 rounded bg-body text-body"
            style={{ maxWidth: '420px' }}
          >
            {m?.main.ad(
              <a href="mailto:freemap@freemap.sk">freemap@freemap.sk</a>,
            )}
          </div>
        ) : ad === 'rovas' ? (
          <a href="https://rovas.app" target="_blank" rel="noreferrer">
            <img
              className="border rounded w-100"
              src={rovasAd}
              style={{ maxWidth: '360px' }}
            />
          </a>
        ) : ad === 'tShirt' ? (
          <a
            href="https://nabezky.sk/freemap_t-shirt"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="border rounded w-100"
              src={tShirt}
              style={{ maxWidth: '360px' }}
            />
          </a>
        ) : null}
      </div>

      <div className="align-self-end d-flex me-2">
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

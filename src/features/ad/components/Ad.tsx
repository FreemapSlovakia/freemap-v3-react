import { useMessages } from '@features/l10n/l10nInjector.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { useLeftMarginAdjuster } from '@shared/hooks/useLeftMarginAdjuster.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import clsx from 'clsx';
import { type ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import tShirt from '@/images/fm-t-shirt.jpg';
import { type AdItem, useAd } from '../hooks/useAd.js';
import { useAdMessages } from '../translations/useAdMessages.js';
import { SelfAd } from './SelfAd.js';

const ads: AdItem[] = [
  { id: 'tShirt', countries: ['SK'], chance: 3 }, // Freemap T-Shirt
  { id: 'rovas', chance: 1 }, // Rovas
  { id: 'self', chance: 8 }, // self promo
  { id: 'zdilaAuthorship', chance: 4 }, // zdila.sk — authorship banner
  { id: 'zdilaMapNative', chance: 4 }, // zdila.sk — map-native banner
];

/**
 * How many times each ad has been shown in this page load.
 *
 * The count drives two things: an `impression` event is reported only on an ad's
 * first appearance, and a `click` carries the count it had reached by then,
 * which tells whether the 30 s rotation earns clicks on first sight or only
 * after repeats. Reporting every appearance instead would emit an unbounded
 * event stream — and since a Matomo visit is kept alive by its events, it would
 * also stretch the reported visit duration.
 *
 * Module-level, not a ref: it has to survive the remounts caused by the
 * elevation chart and the consent toast.
 */
const adViews = new Map<AdItem['id'], number>();

export default function Ad(): ReactElement | null {
  const [closed, setClosed] = useState(false);

  const m = useMessages();

  const adm = useAdMessages();

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

  useEffect(() => {
    if (!ad) {
      return;
    }

    const views = (adViews.get(ad) ?? 0) + 1;

    adViews.set(ad, views);

    if (views === 1) {
      trackMatomo(['trackEvent', 'Ad', 'impression', ad]);
    }
  }, [ad]);

  const ref = useLeftMarginAdjuster();

  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  const [besideLogo, setBesideLogo] = useState(false);

  // Hanging over the map only beside the logo's toolbar: on a line of its own
  // it would cover what wraps below it (the Map layers panel).
  useEffect(() => {
    const row = root?.parentElement;

    if (!root || !row) {
      return;
    }

    const check = () => {
      const first = row.firstElementChild;

      setBesideLogo(
        first instanceof HTMLElement &&
          first !== root &&
          root.offsetTop < first.offsetTop + first.offsetHeight,
      );
    };

    check();

    const resizes = new ResizeObserver(check);

    resizes.observe(row);

    const mutations = new MutationObserver(check);

    mutations.observe(row, { childList: true });

    return () => {
      resizes.disconnect();

      mutations.disconnect();
    };
  }, [root]);

  if (closed) {
    return null;
  }

  return (
    <div
      ref={setRoot}
      className={clsx(
        'mt-2 d-flex flex-column',
        besideLogo && 'fm-ad-overhang',
      )}
    >
      <div
        className="border rounded-top rounded-start fm-toolbar"
        ref={ref}
        onClickCapture={(e) => {
          if (ad && (e.target as HTMLElement).closest('a')) {
            trackMatomo([
              'trackEvent',
              'Ad',
              'click',
              ad,
              adViews.get(ad) ?? 0,
            ]);
          }
        }}
      >
        {ad === 'self' ? (
          adm && <SelfAd {...adm.self} />
        ) : ad === 'rovas' ? (
          adm?.rovas()
        ) : ad === 'zdilaAuthorship' ? (
          adm?.zdilaAuthorship()
        ) : ad === 'zdilaMapNative' ? (
          adm?.zdilaMapNative()
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
              alt="Freemap T-Shirt"
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

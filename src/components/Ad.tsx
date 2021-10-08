import { removeAdsOnLogin, setActiveModal } from 'fm3/actions/mainActions';
import fallback from 'fm3/images/rovas_reklama.svg';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';

const dims: [number, number][] = [
  // [1024, 768],
  // [970, 250],
  // [768, 1024],
  // [728, 90],
  // [500, 133],
  // [480, 320],
  [468, 60],
  // [320, 480],
  [320, 50],
  // [300, 600],
  // [300, 300],
  // [300, 250],
  [300, 50],
  // [160, 600],
  // [120, 600],
];

export default Ad;

export function Ad(): ReactElement | null {
  const adContainer = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(!window.ResizeObserver);

  const [closed, setClosed] = useState(false);

  const [key, setKey] = useState(0);

  useEffect(() => {
    setClosed(false);

    const el = adContainer.current;

    if (!el) {
      return;
    }

    const script = document.createElement('script');

    let dim: [number, number] = [0, 0];

    for (dim of dims) {
      if (dim[0] < window.innerWidth - 16) {
        break;
      }
    }

    script.src = `https://sk.search.etargetnet.com/generic/uni.php?g=ref:59266,area:${dim[0]}x${dim[1]}`;

    script.onerror = () => {
      const a = document.createElement('a');
      a.href = 'https://rovas.app/node/35384';

      const img = document.createElement('img');

      img.src = fallback;

      a.appendChild(img);

      el.parentElement?.parentElement?.appendChild(a);
    };

    el.appendChild(script);

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        setVisible(el.clientWidth > 200);
      });

      ro.observe(el);

      return () => {
        ro.disconnect();
      };
    }
  }, [key]);

  useEffect(() => {
    const i = window.setInterval(() => {
      setVisible(!window.ResizeObserver);

      setKey((k) => k + 1);
    }, 90000);

    return () => {
      window.clearInterval(i);
    };
  }, [visible, closed]);

  const dispatch = useDispatch();

  const m = useMessages();

  const isLoggedIn = useSelector((state) => !!state.auth.user);

  const [closeTime, setCloseTime] = useState(0);

  useEffect(() => {
    setCloseTime(10);

    const i = window.setInterval(() => {
      setCloseTime((t) => t - 1);
    }, 1000);

    return () => {
      window.clearInterval(i);
    };
  }, [visible]);

  return (
    <div
      key={key}
      className={`mt-2 mx-2 d-flex flex-column ${
        !closed && visible ? 'visible' : 'invisible'
      }`}
    >
      <div className="fm-bg p-1 rounded-top rounded-left">
        <div className="etarget-hb-wrap">
          <div className="etarget-id-59266" ref={adContainer} />
        </div>
      </div>

      <div className="align-self-end d-flex">
        {window.innerHeight < 600 && (
          <Button
            className="py-0 rounded-bottom mr-1"
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
          onClick={() => {
            if (isLoggedIn) {
              dispatch(setActiveModal('remove-ads'));
            } else {
              dispatch(setActiveModal('login'));
              dispatch(removeAdsOnLogin());
            }
          }}
        >
          {m?.general.remove}
        </Button>
      </div>
    </div>
  );
}

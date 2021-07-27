import { removeAds, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';

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

export function Ad(): ReactElement | null {
  const adContainer = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(!window.ResizeObserver);

  useEffect(() => {
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
  }, []);

  const dispatch = useDispatch();

  const m = useMessages();

  return (
    <div
      className={`mt-2 mx-2 d-flex flex-column ${
        visible ? 'visible' : 'invisible'
      }`}
    >
      <div className="bg-light p-1 rounded-top rounded-left">
        <div className="etarget-hb-wrap">
          <div className="etarget-id-59266" ref={adContainer} />
        </div>
      </div>

      <Button
        className="align-self-end py-0 rounded-bottom"
        style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        variant="warning"
        size="sm"
        onClick={() => {
          dispatch(setActiveModal('login'));
          dispatch(removeAds());
        }}
      >
        {m?.general.remove}
      </Button>
    </div>
  );
}

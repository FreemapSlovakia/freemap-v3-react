import { hideInfoBar } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, useEffect, useState } from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
import { useDispatch } from 'react-redux';

export function InfoBar(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const [show, setShow] = useState(1);

  const hiddenInfoBars = useAppSelector((state) => state.main.hiddenInfoBars);

  useEffect(() => {
    const ref = window.setInterval(
      () => setShow((s) => s + 1),
      60 * 10_000, // refresh every hour
    );

    return () => window.clearInterval(ref);
  }, []);

  if (!m || !show) {
    return null;
  }

  const { infoBars } = m.main;

  const ts = Date.now();

  const key = Object.keys(infoBars).find(
    (key) => ts - (hiddenInfoBars[key] ?? 0) > 24 * 60 * 60_000, // expire in a day
  );

  if (!key) {
    return null;
  }

  const InfoBarContent = infoBars[key];

  return (
    <div className="info-bar">
      <CloseButton
        onClick={() => {
          setShow(0);

          dispatch(hideInfoBar({ key, ts }));
        }}
      />

      <InfoBarContent />
    </div>
  );
}

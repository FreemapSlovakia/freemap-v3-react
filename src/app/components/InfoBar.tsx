import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { CloseButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { hideInfoBar, infoBarShown } from '../store/actions.js';
import classes from './InfoBar.module.css';

export function InfoBar(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const [show, setShow] = useState(1);

  const hiddenInfoBars = useAppSelector((state) => state.main.hiddenInfoBars);

  const shownInfoBars = useAppSelector((state) => state.main.shownInfoBars);

  // Frozen at mount: recording the chosen bar as shown (below) must not rotate
  // it away mid-session.
  const rotation = useRef(shownInfoBars).current;

  useEffect(() => {
    const ref = window.setInterval(
      () => setShow((s) => s + 1),
      60 * 10_000, // refresh every hour
    );

    return () => window.clearInterval(ref);
  }, []);

  const ts = Date.now();

  const infoBars = m?.main.infoBars;

  // The least recently shown bar that isn't dismissed, so that none of them
  // starves while another one is up.
  const key = Object.keys(infoBars ?? {})
    .filter((key) => ts - (hiddenInfoBars[key] ?? 0) > 24 * 60 * 60_000) // dismissal expires in a day
    .sort((a, b) => (rotation[a] ?? 0) - (rotation[b] ?? 0))[0];

  useEffect(() => {
    if (key) {
      dispatch(infoBarShown({ key, ts: Date.now() }));
    }
  }, [key, dispatch]);

  if (!show || !key) {
    return null;
  }

  const InfoBarContent = infoBars?.[key];

  if (!InfoBarContent) {
    return null;
  }

  return (
    <div className={classes.infoBar}>
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

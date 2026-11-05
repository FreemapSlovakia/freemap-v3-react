import { MissingEmailBar } from '@features/auth/components/MissingEmailBar.js';
import { UnconfirmedEmailBar } from '@features/auth/components/UnconfirmedEmailBar.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { CloseButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { hideInfoBar, infoBarShown } from '../store/actions.js';
import classes from './InfoBar.module.css';

// About the user's address; the key records a dismissal.
const ACCOUNT_BARS = {
  confirm: { key: 'confirmEmail', Content: UnconfirmedEmailBar },
  missing: { key: 'addEmail', Content: MissingEmailBar },
};

export function InfoBar(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const [show, setShow] = useState(1);

  const hiddenInfoBars = useAppSelector((state) => state.main.hiddenInfoBars);

  const shownInfoBars = useAppSelector((state) => state.main.shownInfoBars);

  // Known, not assumed: a user persisted before the flags has neither yet.
  const accountBar = useAppSelector((state) => {
    const user = state.auth.user;

    return !user
      ? undefined
      : user.email
        ? user.emailVerified === false
          ? 'confirm'
          : undefined
        : user.emailReminderOff === false
          ? 'missing'
          : undefined;
  });

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

  const notDismissed = (key: string) =>
    ts - (hiddenInfoBars[key] ?? 0) > 24 * 60 * 60_000; // dismissal expires in a day

  // Ahead of the rotating bars, which it would otherwise wait behind.
  const account =
    accountBar && notDismissed(ACCOUNT_BARS[accountBar].key)
      ? ACCOUNT_BARS[accountBar]
      : undefined;

  // The least recently shown bar that isn't dismissed, so that none of them
  // starves while another one is up.
  const key = account
    ? undefined
    : Object.keys(infoBars ?? {})
        .filter(notDismissed)
        .sort((a, b) => (rotation[a] ?? 0) - (rotation[b] ?? 0))[0];

  useEffect(() => {
    if (key) {
      dispatch(infoBarShown({ key, ts: Date.now() }));
    }
  }, [key, dispatch]);

  if (!show) {
    return null;
  }

  const shownKey = account ? account.key : key;

  const InfoBarContent = key && infoBars?.[key];

  if (!shownKey || (!account && !InfoBarContent)) {
    return null;
  }

  const close = () => {
    setShow(0);

    dispatch(hideInfoBar({ key: shownKey, ts }));
  };

  return (
    <div className={classes.infoBar}>
      <CloseButton onClick={close} />

      {/* Rendered only when shown, so others don't load its translations. */}
      {account ? (
        <account.Content onClose={close} />
      ) : (
        InfoBarContent && <InfoBarContent />
      )}
    </div>
  );
}

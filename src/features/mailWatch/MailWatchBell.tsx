import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type MailTarget,
  mailWatchKey,
  mailWatchLoad,
  mailWatchToggle,
} from './model/actions.js';

/** The account setting that turns a target's kind of email off; as the API's. */
const FLAG = {
  event: 'sendEventEmails',
  picture: 'sendGalleryEmails',
  wikimedia: 'sendGalleryEmails',
} as const satisfies Record<MailTarget, string>;

/**
 * Follows or mutes the emails about one event or photo; for a logged-in user
 * only. Where the account turns that kind off, it leads to the settings.
 */
export function MailWatchBell({
  target,
  targetId,
}: {
  target: MailTarget;
  targetId: string | number;
}): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const online = useOnline();

  const userId = useAppSelector((state) => state.auth.user?.id);

  // From the account as it is now, so ticking the setting shows at once.
  const enabled = useAppSelector((state) => state.auth.user?.[FLAG[target]]);

  const mailable = useAppSelector(
    (state) =>
      Boolean(state.auth.user?.email) &&
      state.auth.user?.emailVerified !== false,
  );

  const key = mailWatchKey({ target, targetId });

  const stored = useAppSelector((state) => state.mailWatch.byKey[key]);

  // Another user's state stays unseen until this one's loads.
  const entry = stored?.userId === userId ? stored : undefined;

  // Fresh on each showing; a stored state shows meanwhile.
  useEffect(() => {
    if (userId !== undefined) {
      dispatch(mailWatchLoad({ target, targetId }));
    }
  }, [dispatch, target, targetId, userId]);

  if (userId === undefined || entry?.watching == null) {
    return null;
  }

  const { watching, busy } = entry;

  const toggle = () => {
    // TODO from the photo viewer this replaces the viewer, losing the photo.
    if (!mailable || !enabled) {
      dispatch(
        setActiveModal({
          type: 'account',
          section: mailable ? 'notifications' : 'personal',
        }),
      );

      return;
    }

    trackMatomo([
      'trackEvent',
      'Notifications',
      watching ? 'unwatch' : 'watch',
      target,
    ]);

    dispatch(mailWatchToggle({ target, targetId, watching: !watching }));
  };

  const on = watching && enabled && mailable;

  return (
    <LongPressTooltip
      label={
        !mailable
          ? m?.mailWatch.noEmail
          : !enabled
            ? m?.mailWatch.disabled
            : watching
              ? m?.mailWatch.unwatch
              : m?.mailWatch.watch
      }
    >
      {({ props }) => (
        <Button
          variant="link"
          size="sm"
          className={on ? 'p-0' : 'p-0 link-secondary'}
          disabled={!online || busy}
          onClick={toggle}
          {...props}
        >
          {on ? <FaBell /> : <FaBellSlash />}
        </Button>
      )}
    </LongPressTooltip>
  );
}

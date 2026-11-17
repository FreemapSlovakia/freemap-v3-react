import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import z from 'zod';

export const MailTargetSchema = z.enum(['event', 'picture', 'wikimedia']);

export type MailTarget = z.infer<typeof MailTargetSchema>;

/** The account setting that turns a target's kind of email off; as the API's. */
const FLAG = {
  event: 'sendEventEmails',
  picture: 'sendGalleryEmails',
  wikimedia: 'sendGalleryEmails',
} as const satisfies Record<MailTarget, string>;

const StateSchema = z.object({ watching: z.boolean() });

type State = z.infer<typeof StateSchema> & { key: string };

/**
 * Follows or mutes the emails about one event or photo; for a logged-in user
 * only. Where the account turns that kind off, it leads to the settings.
 */
export function MailWatchBell({
  target,
  targetId,
  involvement,
}: {
  target: MailTarget;
  targetId: string | number;
  /**
   * Changes when the user's own taking part does (a comment, Going): taking
   * part turns the emails on, so the state is fetched again.
   */
  involvement?: string;
}): ReactElement | null {
  const dispatch = useDispatch();

  const store = useStore<RootState>();

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

  const path = `${target}/${targetId}`;

  // The user too: another account's state must not show after a re-login.
  const key = `${userId}/${path}`;

  const [state, setState] = useState<State | null>(null);

  const [busy, setBusy] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: involvement refetches
  useEffect(() => {
    if (userId === undefined) {
      return;
    }

    let current = true;

    httpRequest({
      getState: store.getState,
      url: `/mail-watch/${path}`,
      expectedStatus: 200,
      cancelActions: [],
    })
      .then(async (res) => {
        const parsed = StateSchema.parse(await res.json());

        if (current) {
          setState({ ...parsed, key });
        }
      })
      .catch((err) => {
        console.warn('Mail watch state not loaded', err);
      });

    return () => {
      current = false;
    };
  }, [key, path, userId, store, involvement]);

  if (userId === undefined || state?.key !== key) {
    return null;
  }

  const { watching } = state;

  const toggle = async () => {
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

    setBusy(true);

    try {
      const res = await httpRequest({
        getState: store.getState,
        method: 'PUT',
        url: `/mail-watch/${path}`,
        data: { watching: !watching },
        expectedStatus: 200,
        cancelActions: [],
      });

      setState({ ...StateSchema.parse(await res.json()), key });
    } catch (err) {
      dispatch(
        toastsAdd({
          messageKey: 'general.operationError',
          messageParams: { err },
          style: 'danger',
        }),
      );
    } finally {
      setBusy(false);
    }
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

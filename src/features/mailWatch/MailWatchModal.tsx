import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { galleryRequestImage } from '@features/gallery/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { Modal } from '@shared/components/Modal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import {
  FaBell,
  FaBellSlash,
  FaCog,
  FaExternalLinkAlt,
  FaUndo,
} from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import z from 'zod';
import { MailTargetSchema } from './MailWatchBell.js';

type Props = { show: boolean };

const ResultSchema = z.object({
  target: MailTargetSchema,
  targetId: z.string(),
  title: z.string().nullable(),
  watching: z.boolean(),
});

type Result = z.infer<typeof ResultSchema>;

/** Left out, `watching` is only read. */
async function setByToken(
  getState: () => RootState,
  token: string,
  watching?: boolean,
): Promise<Result> {
  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/mail-watch/token',
    data: { token, watching },
    expectedStatus: 200,
    cancelActions: [],
  });

  return ResultSchema.parse(await res.json());
}

const HANDLED_KEY = 'fm.mailWatch.handled';

// Links already acted on here: a reload or Back only shows the state, so it
// can't mute again what Undo restored.
function handledTokens(): string[] {
  try {
    return z
      .array(z.string())
      .catch([])
      .parse(JSON.parse(localStorage.getItem(HANDLED_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

function markHandled(token: string) {
  try {
    localStorage.setItem(
      HANDLED_KEY,
      JSON.stringify([...handledTokens(), token].slice(-50)),
    );
  } catch {
    // Without storage a reload mutes again, as the email's link would.
  }
}

/**
 * Where an email's "stop emails about this" link lands: stops them at once,
 * with no login, and offers to undo it.
 */
export default function MailWatchModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const { getState } = useStore<RootState>();

  const m = useMessages();

  const token = useAppSelector((state) =>
    state.main.activeModal?.type === 'mail-watch'
      ? state.main.activeModal.token
      : null,
  );

  const [state, setState] = useState<
    { token: string } & (
      | { type: 'busy' }
      | { type: 'done'; result: Result }
      | { type: 'error' }
    )
  >();

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token === null) {
      return;
    }

    let current = true;

    setState({ token, type: 'busy' });

    const first = !handledTokens().includes(token);

    if (first) {
      trackMatomo(['trackEvent', 'Notifications', 'unsubscribeLink']);
    }

    setByToken(getState, token, first ? false : undefined).then(
      (result) => {
        markHandled(token);

        if (current) {
          setState({ token, type: 'done', result });
        }
      },
      () => current && setState({ token, type: 'error' }),
    );

    return () => {
      current = false;
    };
  }, [token, getState]);

  const close = () => dispatch(setActiveModal(null));

  const result =
    state?.token === token && state.type === 'done' ? state.result : undefined;

  const kind = result?.target === 'event' ? 'event' : 'picture';

  const open = () => {
    if (!result) {
      return;
    }

    close();

    if (result.target === 'event') {
      // The deep link turns the events layer on, as a shared link does.
      location.hash = `panel=event/${result.targetId}`;
    } else {
      const id = Number(result.targetId);

      dispatch(galleryRequestImage(result.target === 'wikimedia' ? -id : id));
    }
  };

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBell /> {m?.mailWatch.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {state?.token !== token || state.type === 'busy' ? (
          <Spinner size="sm" />
        ) : state.type === 'error' ? (
          <Alert variant="danger" className="mb-0">
            {m?.mailWatch.invalid}
          </Alert>
        ) : (
          <p className="mb-0">
            {(result?.watching ? m?.mailWatch.resumed : m?.mailWatch.stopped)?.(
              { kind, title: result?.title ?? null },
            )}
          </p>
        )}
      </Modal.Body>

      <FmModalFooter>
        {/* Undo, or stop again: a link used before only shows the state. */}
        {result && token && (
          <FmFooterButton
            variant="secondary"
            icon={result.watching ? <FaBellSlash /> : <FaUndo />}
            label={result.watching ? m?.mailWatch.stop : m?.mailWatch.undo}
            disabled={busy}
            onClick={() => {
              const watching = !result.watching;

              trackMatomo([
                'trackEvent',
                'Notifications',
                watching ? 'unsubscribeUndo' : 'unsubscribeAgain',
              ]);

              setBusy(true);

              setByToken(getState, token, watching)
                .then(
                  (next) => setState({ token, type: 'done', result: next }),
                  (err) =>
                    dispatch(
                      toastsAdd({
                        messageKey: 'general.operationError',
                        messageParams: { err },
                        style: 'danger',
                      }),
                    ),
                )
                .finally(() => setBusy(false));
            }}
          />
        )}

        {result && (
          <FmFooterButton
            variant="secondary"
            icon={<FaExternalLinkAlt />}
            label={
              kind === 'event' ? m?.mailWatch.openEvent : m?.mailWatch.openPhoto
            }
            onClick={open}
          />
        )}

        <FmFooterButton
          variant="secondary"
          icon={<FaCog />}
          label={m?.mailWatch.settings}
          onClick={() =>
            dispatch(
              setActiveModal({ type: 'account', section: 'notifications' }),
            )
          }
        />

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}

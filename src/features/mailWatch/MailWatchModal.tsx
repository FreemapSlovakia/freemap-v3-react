import { HttpError, httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { eventsSavedFiltersLoad } from '@features/events/model/savedFiltersSlice.js';
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
import type { Dispatch } from 'redux';
import z from 'zod';
import {
  type MailTarget,
  MailTargetSchema,
  mailWatchLoad,
} from './model/actions.js';

type Props = { show: boolean };

const ResultSchema = z.object({
  // `eventFilter`: a saved events filter's emails, by its own token.
  target: z.enum([...MailTargetSchema.options, 'eventFilter']),
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

// How the texts name each target: a Commons photo is a photo too.
const KIND = {
  event: 'event',
  picture: 'picture',
  wikimedia: 'picture',
} as const satisfies Record<MailTarget, 'event' | 'picture'>;

/** What a token is about, read from it (`<user>.<target>.<id>.<signature>`). */
function tokenKind(token: string | null) {
  const segment = token?.split('.')[1];

  if (segment === 'filter') {
    return 'filter';
  }

  const target = MailTargetSchema.safeParse(segment);

  return target.success ? KIND[target.data] : null;
}

/** What shows the state reloads it: a bell, or the saved filters. */
function refresh(dispatch: Dispatch, result: Result) {
  dispatch(
    result.target === 'eventFilter'
      ? eventsSavedFiltersLoad()
      : mailWatchLoad({ target: result.target, targetId: result.targetId }),
  );
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
      | { type: 'error'; gone: boolean }
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

        // For whoever is logged in here.
        refresh(dispatch, result);

        if (current) {
          setState({ token, type: 'done', result });
        }
      },
      (err) =>
        current &&
        setState({
          token,
          type: 'error',
          gone: err instanceof HttpError && err.status === 410,
        }),
    );

    return () => {
      current = false;
    };
  }, [token, getState, dispatch]);

  const close = () => dispatch(setActiveModal(null));

  const result =
    state?.token === token && state.type === 'done' ? state.result : undefined;

  const goneKind = tokenKind(token);

  const open = () => {
    if (!result || result.target === 'eventFilter') {
      return;
    }

    close();

    const id = result.targetId;

    ({
      // The deep link turns the events layer on, as a shared link does.
      event: () => {
        location.hash = `panel=event/${id}`;
      },
      picture: () => dispatch(galleryRequestImage(Number(id))),
      // Commons photos are negative ids in the viewer.
      wikimedia: () => dispatch(galleryRequestImage(-Number(id))),
    })[result.target]();
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
          state.gone && goneKind ? (
            <Alert variant="info" className="mb-0">
              {goneKind === 'filter'
                ? m?.mailWatch.filterGone
                : m?.mailWatch.gone(goneKind)}
            </Alert>
          ) : (
            <Alert variant="danger" className="mb-0">
              {m?.mailWatch.invalid}
            </Alert>
          )
        ) : (
          <p className="mb-0">
            {state.result.target === 'eventFilter'
              ? (state.result.watching
                  ? m?.mailWatch.filterResumed
                  : m?.mailWatch.filterStopped)?.({
                  title: state.result.title ?? '',
                })
              : (state.result.watching
                  ? m?.mailWatch.resumed
                  : m?.mailWatch.stopped)?.({
                  kind: KIND[state.result.target],
                  title: state.result.title,
                })}
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
                  (next) => {
                    refresh(dispatch, next);

                    setState({ token, type: 'done', result: next });
                  },
                  (err) =>
                    // Deleted while this was open.
                    err instanceof HttpError && err.status === 410
                      ? setState({ token, type: 'error', gone: true })
                      : dispatch(
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

        {result && result.target !== 'eventFilter' && (
          <FmFooterButton
            variant="secondary"
            icon={<FaExternalLinkAlt />}
            label={
              {
                event: m?.mailWatch.openEvent,
                picture: m?.mailWatch.openPhoto,
              }[KIND[result.target]]
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

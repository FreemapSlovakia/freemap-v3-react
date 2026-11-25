import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { HttpError } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import {
  AppTokenSchema,
  CreatedAppTokenSchema,
} from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { Modal } from '@shared/components/Modal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import {
  FaCalendarAlt,
  FaClipboard,
  FaGoogle,
  FaKey,
  FaLink,
  FaSignInAlt,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import {
  feedUrl,
  googleSubscribeUrl,
  webcalUrl,
} from '../model/calendarLinks.js';
import {
  eventsSavedFiltersLoad,
  selectSavedFilters,
} from '../model/savedFiltersSlice.js';
import { useEventsMessages } from '../translations/useEventsMessages.js';

const MY_EVENTS = 'mine';

type Created = { id: number; token: string };

// The API shows a token once; kept per user till reload, so reopening the
// dialog doesn't mint another.
const createdTokens = new Map<number, Created>();

type Props = { show: boolean };

/** A link subscribing a calendar app to one's events or a saved filter's. */
export default function EventsCalendarModal({ show }: Props): ReactElement {
  const m = useMessages();

  const em = useEventsMessages();

  useDocumentTitle(show ? em?.calendar.title : undefined);

  const dispatch = useDispatch();

  const online = useOnline();

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const savedFilters = useAppSelector(selectSavedFilters);

  // One serves every feed.
  const [created, setCreated] = useState<Created>();

  useEffect(() => {
    if (!show || userId === undefined || !authToken) {
      return;
    }

    // Opened by its link, the layer's toolbar may not have loaded them.
    dispatch(eventsSavedFiltersLoad());

    const cached = createdTokens.get(userId);

    setCreated(cached);

    if (!cached) {
      return;
    }

    // Revoked under App tokens since?
    const ac = new AbortController();

    fetch(`${process.env['API_URL']}/auth/app-tokens`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      signal: ac.signal,
    })
      .then(async (res) => {
        if (
          res.ok &&
          !z
            .array(AppTokenSchema)
            .parse(await res.json())
            .some((t) => t.id === cached.id)
        ) {
          createdTokens.delete(userId);

          setCreated(undefined);
        }
      })
      .catch(() => {});

    return () => ac.abort();
  }, [dispatch, show, userId, authToken]);

  const [feed, setFeed] = useState(MY_EVENTS);

  const token = authToken ? created?.token : undefined;

  const [busy, setBusy] = useState(false);

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const filterId = feed === MY_EVENTS ? null : Number(feed);

  const url =
    token && em ? feedUrl(token, filterId, em.calendar.myEventsName) : null;

  async function createToken() {
    setBusy(true);

    try {
      const res = await fetch(`${process.env['API_URL']}/auth/app-tokens`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          note: em?.calendar.tokenNote ?? null,
          scopes: ['events:calendar'],
          expiresAt: null,
        }),
      });

      if (!res.ok) {
        throw new HttpError(res.status, await res.text());
      }

      const { id, token } = CreatedAppTokenSchema.parse(await res.json());

      if (userId !== undefined) {
        createdTokens.set(userId, { id, token });
      }

      setCreated({ id, token });

      trackMatomo(['trackEvent', 'Events', 'calendarLink']);
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
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarAlt /> {em?.calendar.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{em?.calendar.intro}</p>

        <Form.Group className="mb-3" controlId="events-calendar-feed">
          <Form.Label>{em?.calendar.feed}</Form.Label>

          <Form.Select value={feed} onChange={(e) => setFeed(e.target.value)}>
            <option value={MY_EVENTS}>{em?.calendar.myEvents}</option>

            {savedFilters?.map((saved) => (
              <option key={saved.id} value={String(saved.id)}>
                {saved.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {url ? (
          <>
            <InputGroup className="mb-3">
              <Form.Control readOnly value={url} />

              <Button
                variant="secondary"
                onClick={() => {
                  trackMatomo([
                    'trackEvent',
                    'Events',
                    'calendarSubscribe',
                    'copy',
                  ]);

                  copyToClipboard(dispatch, url);
                }}
              >
                <FaClipboard /> {em?.calendar.copy}
              </Button>
            </InputGroup>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <Button
                variant="primary"
                href={googleSubscribeUrl(url)}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackMatomo([
                    'trackEvent',
                    'Events',
                    'calendarSubscribe',
                    'google',
                  ])
                }
              >
                <FaGoogle /> {em?.calendar.google}
              </Button>

              <Button
                variant="secondary"
                href={webcalUrl(url)}
                onClick={() =>
                  trackMatomo([
                    'trackEvent',
                    'Events',
                    'calendarSubscribe',
                    'app',
                  ])
                }
              >
                <FaLink /> {em?.calendar.app}
              </Button>
            </div>

            <Alert variant="warning" className="small mb-0">
              {em?.calendar.secret}
            </Alert>
          </>
        ) : authToken ? (
          <Button
            variant="primary"
            disabled={!online || busy}
            onClick={createToken}
          >
            <FaKey /> {em?.calendar.create}
          </Button>
        ) : (
          <>
            <p>{em?.calendar.loginRequired}</p>

            <Button
              variant="primary"
              onClick={() => dispatch(setActiveModal({ type: 'login' }))}
            >
              <FaSignInAlt /> {m?.mainMenu.logIn}
            </Button>
          </>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}

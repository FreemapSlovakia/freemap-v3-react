import { HttpError } from '@app/httpRequest.js';
import {
  type AppToken,
  AppTokenSchema,
  type AppTokenScope,
  AppTokenScopeSchema,
  CreatedAppTokenSchema,
} from '@features/auth/model/types.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { copyToClipboard } from '@shared/clipboardUtils.js';
import { DateTime } from '@shared/components/DateTime.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Form,
  ListGroup,
  Spinner,
} from 'react-bootstrap';
import {
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClipboard,
  FaInfoCircle,
  FaKey,
  FaPlus,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';

const EXPIRATION_DAYS = [30, 90, 365] as const;

export function AppTokensSection(): ReactElement | null {
  const m = useMessages();

  const am = useAuthMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const online = useOnline();

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const [list, setList] = useState<
    | { type: 'fetching' }
    | { type: 'error'; error: unknown }
    | { type: 'success'; tokens: AppToken[] }
  >({ type: 'fetching' });

  const [showForm, setShowForm] = useState(false);

  const [note, setNote] = useState('');

  const [scopes, setScopes] = useState<Set<AppTokenScope>>(new Set());

  const [expiration, setExpiration] = useState('never');

  const [expiresOn, setExpiresOn] = useState('');

  const [busy, setBusy] = useState(false);

  const [created, setCreated] = useState<string | null>(null);

  // Open by default only while there is no token yet.
  const [showHelp, setShowHelp] = useState<boolean>();

  const helpOpen =
    showHelp ?? (list.type === 'success' && list.tokens.length === 0);

  async function request(path: string, init: RequestInit = {}) {
    const res = await fetch(
      `${process.env['API_URL']}/auth/app-tokens${path}`,
      {
        ...init,
        headers: {
          accept: 'application/json',
          ...(init.body ? { 'content-type': 'application/json' } : {}),
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
      },
    );

    if (!res.ok) {
      throw new HttpError(res.status, await res.text());
    }

    return res;
  }

  const removeFromList = (id: number) => {
    setList((list) =>
      list.type === 'success'
        ? { type: 'success', tokens: list.tokens.filter((t) => t.id !== id) }
        : list,
    );
  };

  function reportError(err: unknown) {
    dispatch(
      toastsAdd({
        messageKey: 'general.operationError',
        messageParams: { err },
        style: 'danger',
      }),
    );
  }

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      const res = await fetch(`${process.env['API_URL']}/auth/app-tokens`, {
        signal: ac.signal,
        headers: {
          accept: 'application/json',
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setList({
        type: 'success',
        tokens: z.array(AppTokenSchema).parse(await res.json()),
      });
    })().catch((error) => {
      if (!ac.signal.aborted) {
        setList({ type: 'error', error });
      }
    });

    return () => {
      ac.abort();
    };
  }, [authToken]);

  const canCreate =
    online &&
    !busy &&
    scopes.size > 0 &&
    (expiration !== 'custom' || expiresOn !== '');

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!canCreate) {
      return;
    }

    const expiresAt =
      expiration === 'never'
        ? null
        : expiration === 'custom'
          ? new Date(expiresOn)
          : new Date(Date.now() + Number(expiration) * 86_400_000);

    if (expiresAt && expiresAt <= new Date()) {
      dispatch(
        toastsAdd({
          messageKey: 'appTokens.pastDate',
          messageLoader: loadAuthMessages,
          style: 'warning',
        }),
      );

      return;
    }

    setBusy(true);

    try {
      const res = await request('', {
        method: 'POST',
        body: JSON.stringify({
          note: note.trim() || null,
          scopes: [...scopes],
          expiresAt: expiresAt?.toISOString() ?? null,
        }),
      });

      const { token, ...appToken } = CreatedAppTokenSchema.parse(
        await res.json(),
      );

      trackMatomo(['trackEvent', 'Auth', 'createAppToken']);

      setList((list) =>
        list.type === 'success'
          ? { type: 'success', tokens: [appToken, ...list.tokens] }
          : list,
      );

      setCreated(token);

      setShowForm(false);

      setNote('');

      setScopes(new Set());

      setExpiration('never');

      setExpiresOn('');
    } catch (err) {
      reportError(err);
    }

    setBusy(false);
  };

  const handleRevoke = async (appToken: AppToken) => {
    if (
      !(await confirm({
        title: am?.appTokens.revoke,
        message: am?.appTokens.revokeConfirm({
          name: appToken.note ?? am.appTokens.noNote,
        }),
        confirmLabel: am?.appTokens.revoke,
        confirmStyle: 'danger',
      }))
    ) {
      return;
    }

    try {
      await request(`/${appToken.id}`, { method: 'DELETE' });
    } catch (err) {
      // Already gone: expired and cleaned up, or deleted elsewhere.
      if (!(err instanceof HttpError && err.status === 404)) {
        reportError(err);

        return;
      }
    }

    removeFromList(appToken.id);
  };

  const toggleScope = (scope: AppTokenScope) => {
    setScopes((scopes) => {
      const next = new Set(scopes);

      if (!next.delete(scope)) {
        next.add(scope);
      }

      return next;
    });
  };

  return (
    <>
      <Alert variant="info" className="py-2">
        <Button
          variant="link"
          className="p-0 w-100 d-flex align-items-center gap-2 text-reset text-decoration-none"
          onClick={() => setShowHelp(!helpOpen)}
        >
          <FaInfoCircle />

          <span className="flex-grow-1 text-start">
            <Text m={am} k="appTokens.about" />
          </span>

          {helpOpen ? <FaChevronUp /> : <FaChevronDown />}
        </Button>

        <Collapse in={helpOpen}>
          <div>
            <p className="mt-2">
              <Text m={am} k="appTokens.intro" />
            </p>

            <p className="mb-1">
              <Text m={am}>{(m) => m.appTokens.usage}</Text>
            </p>

            <pre className="small bg-body p-2 rounded">
              <code>
                {process.env['API_URL']}/…{'\n'}Authorization: Bearer fm_…
              </code>
            </pre>

            <p className="mb-1">
              <Text m={am}>{(m) => m.appTokens.tiles}</Text>
            </p>

            <pre className="small bg-body p-2 rounded">
              <code>
                {process.env['FM_MAPSERVER_URL']}/{'{z}/{x}/{y}'}?token=fm_…
              </code>
            </pre>

            <p className="mb-0">
              <Text m={am} k="appTokens.keepSecret" />
            </p>
          </div>
        </Collapse>
      </Alert>

      {created && (
        <Alert variant="success" onClose={() => setCreated(null)} dismissible>
          <p>
            <Text m={am} k="appTokens.created" />
          </p>

          <div className="d-flex align-items-center gap-2">
            <code className="text-break">{created}</code>

            <LongPressTooltip label={m?.general.copyCode}>
              {({ props }) => (
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-shrink-0"
                  onClick={() => copyToClipboard(dispatch, created)}
                  {...props}
                >
                  <FaClipboard />
                </Button>
              )}
            </LongPressTooltip>
          </div>
        </Alert>
      )}

      {(() => {
        switch (list.type) {
          case 'fetching':
            return (
              <div className="d-flex flex-column">
                <Spinner className="align-self-center" animation="border" />
              </div>
            );

          case 'error':
            return (
              <Alert variant="danger">
                <Text>{(m) => m.general.loadError({ err: list.error })}</Text>
              </Alert>
            );

          case 'success':
            return list.tokens.length === 0 ? (
              <p className="text-muted">
                <Text m={am} k="appTokens.none" />
              </p>
            ) : (
              <ListGroup className="mb-3">
                {list.tokens.map((appToken) => (
                  <ListGroup.Item
                    key={appToken.id}
                    className="d-flex align-items-center gap-2"
                  >
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex flex-wrap align-items-center gap-1 mb-1">
                        <FaKey />
                        <strong className="me-1">
                          {appToken.note ?? am?.appTokens.noNote}
                        </strong>
                        {appToken.scopes.map((scope) => {
                          const known = AppTokenScopeSchema.safeParse(scope);

                          return (
                            <LongPressTooltip
                              key={scope}
                              label={
                                known.success
                                  ? am?.appTokens.scopeNames[known.data]
                                  : scope
                              }
                              hideLabel
                              toggleOnClick
                            >
                              {({ props }) => (
                                <Badge bg="secondary" {...props}>
                                  {scope}
                                </Badge>
                              )}
                            </LongPressTooltip>
                          );
                        })}
                      </div>

                      <small className="text-muted">
                        {m?.general.createdAt}:{' '}
                        <strong>{dateFormat.format(appToken.createdAt)}</strong>
                        {' · '}
                        {am?.appTokens.expiration}:{' '}
                        <strong>
                          {appToken.expiresAt
                            ? dateFormat.format(appToken.expiresAt)
                            : am?.appTokens.never}
                        </strong>
                        {' · '}
                        {appToken.lastUsedAt ? (
                          <>
                            {am?.appTokens.lastUsed}:{' '}
                            <strong>
                              {dateFormat.format(appToken.lastUsedAt)}
                            </strong>
                            {appToken.lastUserAgent && (
                              <> ({appToken.lastUserAgent})</>
                            )}
                          </>
                        ) : (
                          am?.appTokens.neverUsed
                        )}
                      </small>
                    </div>

                    <LongPressTooltip
                      label={am?.appTokens.revoke}
                      disabled={!online}
                      wrapperClassName="d-inline-block flex-shrink-0"
                    >
                      {({ props }) => (
                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-shrink-0"
                          disabled={!online}
                          onClick={() => handleRevoke(appToken)}
                          {...props}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </LongPressTooltip>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            );
        }
      })()}

      {showForm ? (
        <Form onSubmit={handleSubmit}>
          <fieldset className="border rounded p-3">
            <legend>
              <Text m={am} k="appTokens.create" />
            </legend>

            <Form.Group controlId="appTokenNote" className="mb-3">
              <Form.Label>
                <Text m={am} k="appTokens.note" />
              </Form.Label>

              <Form.Control
                value={note}
                onChange={(e) => setNote(e.currentTarget.value)}
                maxLength={255}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <Text m={am} k="appTokens.scopes" />
              </Form.Label>

              {AppTokenScopeSchema.options.map((scope) => (
                <Form.Check
                  key={scope}
                  id={`appTokenScope-${scope}`}
                  type="checkbox"
                  label={
                    <>
                      <Badge bg="secondary">{scope}</Badge>{' '}
                      {am?.appTokens.scopeNames[scope]}
                    </>
                  }
                  checked={scopes.has(scope)}
                  onChange={() => toggleScope(scope)}
                />
              ))}
            </Form.Group>

            <Form.Group controlId="appTokenExpiration" className="mb-3">
              <Form.Label>
                <Text m={am} k="appTokens.expiration" />
              </Form.Label>

              <Form.Select
                value={expiration}
                onChange={(e) => setExpiration(e.currentTarget.value)}
              >
                <option value="never">{am?.appTokens.never}</option>

                {EXPIRATION_DAYS.map((count) => (
                  <option key={count} value={count}>
                    {am?.appTokens.days({ count })}
                  </option>
                ))}

                <option value="custom">{am?.appTokens.customDate}</option>
              </Form.Select>

              {expiration === 'custom' && (
                <div className="mt-2">
                  <DateTime value={expiresOn} onChange={setExpiresOn} />
                </div>
              )}
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={!canCreate}>
                <FaCheck /> {am?.appTokens.create}
              </Button>

              <Button variant="dark" onClick={() => setShowForm(false)}>
                <FaTimes /> {m?.general.cancel}
              </Button>
            </div>
          </fieldset>
        </Form>
      ) : (
        <Button
          variant="secondary"
          disabled={!online || list.type !== 'success'}
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> {am?.appTokens.create}
        </Button>
      )}
    </>
  );
}

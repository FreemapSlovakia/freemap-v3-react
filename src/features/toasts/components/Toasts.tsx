import type { RootAction } from '@app/store/rootAction.js';
import { getMessageByKey, useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Leaves } from '@shared/types/common.js';
import {
  type ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { Messages } from '@/translations/messagesInterface.js';
import {
  ToastAction,
  toastsRemove,
  toastsRestartTimeout,
  toastsStopTimeout,
} from '../model/actions.js';
import { Toast } from './Toast.js';
import classes from './Toasts.module.css';

function resolveMessage(
  m: unknown,
  messageKey: string,
  messageParams?: Record<string, unknown>,
): ReactNode {
  const v = getMessageByKey(m as Messages | undefined, messageKey);

  if (typeof v === 'string') {
    return v;
  }

  if (typeof v === 'function') {
    return v.call(undefined, messageParams);
  }

  return '…';
}

// Resolves a toast message from a lazily-loaded per-feature bundle, re-running
// when the language changes so the text follows language switches.
function LazyToastMessage<T extends Record<string, unknown>>({
  loader,
  messageKey,
  messageParams,
}: {
  loader: (language: string) => Promise<T>;
  messageKey: Leaves<T>;
  messageParams?: Record<string, unknown>;
}): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const [messages, setMessages] = useState<T>();

  useEffect(() => {
    let cancelled = false;

    loader(language).then((m) => {
      if (!cancelled) {
        setMessages(m);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loader, language]);

  return (
    <>
      {messages === undefined
        ? '…'
        : resolveMessage(messages, messageKey, messageParams)}
    </>
  );
}

function tx(m: Messages | undefined, toastAction: ToastAction) {
  if ('name' in toastAction) {
    return toastAction.name;
  }

  const v = getMessageByKey(m, toastAction.nameKey);

  if (typeof v === 'string') {
    return v;
  }

  if (v instanceof Function) {
    return v.call(undefined);
  }

  return '…';
}

export function Toasts(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const toasts = useAppSelector((state) => state.toasts.toasts);

  const items = useMemo(
    () =>
      Object.values(toasts)
        .map(
          ({ id, actions, style, noClose, timeout, timeoutSince, ...rest }) => {
            const msg = rest.messageLoader ? (
              <LazyToastMessage
                loader={rest.messageLoader}
                messageKey={rest.messageKey}
                messageParams={rest.messageParams}
              />
            ) : (
              resolveMessage(m, rest.messageKey, rest.messageParams)
            );

            return {
              id,
              actions,
              style,
              msg,
              noClose,
              timeout,
              timeoutSince,
            };
          },
        )
        .reverse(),
    [m, toasts],
  );

  const handleAction = useCallback(
    (id: string, action?: RootAction | RootAction[]) => {
      // TODO use some action flag to indicate that we want the action to close the toast
      dispatch(toastsRemove(id));

      if (action) {
        if (Array.isArray(action)) {
          for (const a of action) {
            dispatch(a);
          }
        } else {
          dispatch(action);
        }
      }
    },
    [dispatch],
  );

  return (
    <div className={classes.toasts}>
      {items.map(
        ({ id, actions, style, msg, noClose, timeout, timeoutSince }) => {
          return (
            <Toast
              key={id}
              id={id}
              message={msg}
              style={style}
              noClose={noClose}
              onAction={handleAction}
              actions={actions.map((action) => ({
                ...action,
                name: tx(m, action),
              }))}
              timeout={timeout}
              timeoutSince={timeoutSince}
              onTimeoutStop={() => dispatch(toastsStopTimeout(id))}
              onTimeoutRestart={() =>
                dispatch(toastsRestartTimeout({ id, timeoutSince: Date.now() }))
              }
            />
          );
        },
      )}
    </div>
  );
}

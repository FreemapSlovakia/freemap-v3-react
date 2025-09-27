import {
  type ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, Button, ButtonToolbar, CloseButton } from 'react-bootstrap';
import type { RootAction } from '../actions/index.js';
import { ResolvedToast, ToastAction } from '../actions/toastsActions.js';
import '../styles/toasts.scss';

interface Props extends Pick<ResolvedToast, 'id' | 'style' | 'noClose'> {
  actions: (Omit<ToastAction, 'nameKey'> & { name: string })[];
  onAction: (id: string, action?: RootAction | RootAction[]) => void;
  onTimeoutStop: (id: string) => void;
  onTimeoutRestart: (id: string) => void;
  message: ReactNode;
  timeout?: number;
  timeoutSince?: number;
}

export function Toast({
  message,
  actions,
  onAction,
  id,
  style,
  onTimeoutStop,
  onTimeoutRestart,
  noClose,
  timeout,
  timeoutSince,
}: Props): ReactElement {
  const [elapsed, setElapsed] = useState(0);

  const [stopped, setStopped] = useState(false);

  const handlePointerEnter = useCallback(() => {
    if (timeout === undefined) {
      return;
    }

    setStopped(true);
    setElapsed(0);
    onTimeoutStop(id);
  }, [onTimeoutStop, id, timeout]);

  const handlePointerLeave = useCallback(() => {
    if (timeout === undefined) {
      return;
    }

    setStopped(false);
    onTimeoutRestart(id);
  }, [onTimeoutRestart, id, timeout]);

  const handleAlertDismiss = useCallback(() => {
    onAction(id);
  }, [onAction, id]);

  const defaultAction = actions.find(({ name }) => !name);

  const clickHandler =
    defaultAction && (() => onAction(id, defaultAction.action));

  const buttonActions = actions.filter(({ name }) => name);

  useEffect(() => {
    if (timeout === undefined || timeoutSince === undefined || stopped) {
      return;
    }

    const ref = window.setInterval(() => {
      setElapsed(Date.now() - timeoutSince);
    }, 25);

    return () => window.clearInterval(ref);
  }, [timeoutSince, stopped, timeout]);

  return (
    <Alert
      className="fm-toast"
      variant={style ?? 'primary'}
      onClick={clickHandler}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {noClose ? undefined : (
        <CloseButton className="float-end" onClick={handleAlertDismiss} />
      )}

      {typeof message === 'string' && message.startsWith('!HTML!') ? (
        <span dangerouslySetInnerHTML={{ __html: message.substring(6) }} />
      ) : (
        <span>{message}</span>
      )}

      {buttonActions.length > 0 && (
        <ButtonToolbar className="mt-2">
          {buttonActions.map(({ name, action, style: buttonStyle }, i) => (
            <Button
              size="sm"
              className={i > 0 ? 'ms-2' : ''}
              key={i}
              variant={buttonStyle}
              onClick={() => onAction(id, action)}
            >
              {name}
            </Button>
          ))}
        </ButtonToolbar>
      )}

      {timeout !== undefined && (
        <div
          className="bg-body"
          style={{ position: 'relative', top: '0.5rem' }}
        >
          <div
            className="bg-primary"
            style={{
              width: ((timeout - elapsed) / timeout) * 100 + '%',
              height: '2px',
            }}
          />
        </div>
      )}
    </Alert>
  );
}

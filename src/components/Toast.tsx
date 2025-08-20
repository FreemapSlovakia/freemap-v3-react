import {
  type ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, Button, ButtonToolbar, CloseButton } from 'react-bootstrap';
import type { RootAction } from '../actions/index.js';
import { ResolvedToast } from '../actions/toastsActions.js';
import '../styles/toasts.scss';

interface Props
  extends Pick<ResolvedToast, 'id' | 'actions' | 'style' | 'noClose'> {
  onAction: (id: string, action?: RootAction | RootAction[]) => void;
  onTimeoutStop: (id: string) => void;
  onTimeoutRestart: (id: string) => void;
  message: ReactNode;
  timeout?: number;
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
}: Props): ReactElement {
  const [ts, setTs] = useState(Date.now());

  const [elapsed, setElapsed] = useState(0);

  const [stopped, setStopped] = useState(false);

  const handlePointerEnter = useCallback(() => {
    setStopped(true);
    setElapsed(0);
    setTs(Date.now());
    onTimeoutStop(id);
  }, [onTimeoutStop, id]);

  const handlePointerLeave = useCallback(() => {
    setStopped(false);
    onTimeoutRestart(id);
  }, [onTimeoutRestart, id]);

  const handleAlertDismiss = useCallback(() => {
    onAction(id);
  }, [onAction, id]);

  const defaultAction = actions.find(({ name }) => !name);

  const clickHandler =
    defaultAction && (() => onAction(id, defaultAction.action));

  const buttonActions = actions.filter(({ name }) => name);

  useEffect(() => {
    if (timeout === undefined || stopped) {
      return;
    }

    const ref = window.setInterval(() => {
      setElapsed(Date.now() - ts);
    }, 50);

    return () => window.clearInterval(ref);
  }, [ts, stopped, timeout]);

  return (
    <Alert
      className="fm-toast"
      variant={style ?? 'primary'}
      onClick={clickHandler}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClose={handleAlertDismiss}
      dismissible={!noClose}
    >
      {typeof message === 'string' && message.startsWith('!HTML!') ? (
        <span dangerouslySetInnerHTML={{ __html: message.substring(6) }} />
      ) : (
        <span>{message}</span>
      )}
      {buttonActions.length > 0 && (
        <>
          <br />

          <ButtonToolbar>
            {buttonActions.map(({ name, action, style: buttonStyle }, i) => (
              <Button
                className={i > 0 ? 'ms-2' : ''}
                key={i}
                variant={buttonStyle}
                onClick={() => onAction(id, action)}
              >
                {name}
              </Button>
            ))}
          </ButtonToolbar>
        </>
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

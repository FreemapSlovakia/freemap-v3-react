import { RootAction } from 'fm3/actions';
import { ResolvedToast } from 'fm3/actions/toastsActions';
import 'fm3/styles/toasts.scss';
import { ReactElement, ReactNode, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

interface Props
  extends Pick<ResolvedToast, 'id' | 'actions' | 'style' | 'noClose'> {
  onAction: (id: string, action?: RootAction | RootAction[]) => void;
  onTimeoutStop: (id: string) => void;
  onTimeoutRestart: (id: string) => void;
  message: ReactNode;
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
}: Props): ReactElement {
  const handleMouseEnter = useCallback(() => {
    onTimeoutStop(id);
  }, [onTimeoutStop, id]);

  const handleMouseLeave = useCallback(() => {
    onTimeoutRestart(id);
  }, [onTimeoutRestart, id]);

  const handleAlertDismiss = useCallback(() => {
    onAction(id);
  }, [onAction, id]);

  const defaultAction = actions.find(({ name }) => !name);

  const clickHandler =
    defaultAction && (() => onAction(id, defaultAction.action));

  const buttonActions = actions.filter(({ name }) => name);

  return (
    <Alert
      className="fm-toast"
      variant={style ?? 'primary'}
      onClick={clickHandler}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClose={handleAlertDismiss}
      dismissible={!noClose}
    >
      {typeof message === 'string' && message.startsWith('!HTML!') ? (
        <div dangerouslySetInnerHTML={{ __html: message.substring(6) }} />
      ) : (
        <div>{message}</div>
      )}
      {buttonActions.length > 0 && (
        <>
          <br />
          <ButtonToolbar>
            {buttonActions.map(({ name, action, style: buttonStyle }, i) => (
              <Button
                className={i > 0 ? 'ml-2' : ''}
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
    </Alert>
  );
}

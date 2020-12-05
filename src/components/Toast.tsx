import React, { ReactNode, useCallback } from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import 'fm3/styles/toasts.scss';
import { RootAction } from 'fm3/actions';
import { ResolvedToast } from 'fm3/actions/toastsActions';

interface Props extends Pick<ResolvedToast, 'id' | 'actions' | 'style'> {
  onAction: (id: string, action?: RootAction | RootAction[]) => void;
  onTimeoutStop: (id: string) => void;
  onTimeoutRestart: (id: string) => void;
  message: ReactNode;
}

export const Toast: React.FC<Props> = ({
  message,
  actions,
  onAction,
  id,
  style,
  onTimeoutStop,
  onTimeoutRestart,
}) => {
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

  const clickHandler = defaultAction
    ? () => onAction(id, defaultAction.action)
    : undefined;

  const buttonActions = actions.filter(({ name }) => name);

  return (
    <Alert
      className="toast"
      bsStyle={style}
      onClick={clickHandler}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDismiss={handleAlertDismiss}
    >
      {typeof message === 'string' && message.startsWith('!HTML!') ? (
        <div
          className="toast-message"
          dangerouslySetInnerHTML={{ __html: message.substring(6) }}
        />
      ) : (
        <div className="toast-message">{message}</div>
      )}
      {buttonActions.length > 0 && (
        <>
          <br />
          <ButtonToolbar>
            {buttonActions.map(({ name, action, style: buttonStyle }) => (
              <Button
                key={name}
                bsStyle={buttonStyle}
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
};

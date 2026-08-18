import type { RootAction } from '@app/store/rootAction.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Alert, Button, ButtonToolbar, CloseButton } from 'react-bootstrap';
import { LuAlarmClockOff } from 'react-icons/lu';
import type { ResolvedToast, ToastAction } from '../model/actions.js';
import classes from './Toast.module.css';

interface Props
  extends Pick<ResolvedToast, 'id' | 'style' | 'noClose' | 'pinned'> {
  actions: (Omit<ToastAction, 'nameKey'> & { name: string })[];
  onAction: (id: string, action?: RootAction | RootAction[]) => void;
  onClose: (id: string) => void;
  onTimeoutStop: (id: string) => void;
  onTimeoutRestart: (id: string) => void;
  onKeepOpen: (id: string) => void;
  message: ReactNode;
  timeout?: number;
  timeoutSince?: number;
}

export function Toast({
  message,
  actions,
  onAction,
  onClose,
  id,
  style,
  onTimeoutStop,
  onTimeoutRestart,
  onKeepOpen,
  noClose,
  pinned,
  timeout,
  timeoutSince,
}: Props): ReactElement {
  const m = useMessages();

  const [elapsed, setElapsed] = useState(0);

  const [stopped, setStopped] = useState(false);

  const handlePointerEnter = useCallback(() => {
    if (timeout === undefined || pinned) {
      return;
    }

    setStopped(true);
    setElapsed(0);
    onTimeoutStop(id);
  }, [onTimeoutStop, id, timeout, pinned]);

  const handlePointerLeave = useCallback(() => {
    if (timeout === undefined || pinned) {
      return;
    }

    setStopped(false);
    onTimeoutRestart(id);
  }, [onTimeoutRestart, id, timeout, pinned]);

  // A finger has no hover to pause the countdown with. This drops the countdown
  // for good — one way, so the button goes with the progress bar it sits on.
  const handleKeepOpen = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      onKeepOpen(id);
    },
    [id, onKeepOpen],
  );

  const handleAlertDismiss = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      onClose(id);
    },
    [onClose, id],
  );

  const defaultAction = actions.find(({ name }) => !name);

  const clickHandler =
    defaultAction && (() => onAction(id, defaultAction.action));

  const buttonActions = actions.filter(({ name }) => name);

  useEffect(() => {
    if (
      timeout === undefined ||
      timeoutSince === undefined ||
      stopped ||
      pinned
    ) {
      return;
    }

    const ref = window.setInterval(() => {
      setElapsed(Date.now() - timeoutSince);
    }, 25);

    return () => window.clearInterval(ref);
  }, [timeoutSince, stopped, timeout, pinned]);

  return (
    <Alert
      className={classes.toast}
      variant={style ?? 'primary'}
      onClick={clickHandler}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {!noClose && (
        <LongPressTooltip label={m?.general.close}>
          {({ props }) => (
            <CloseButton
              className={`float-end ms-2 ${classes.corner}`}
              onClick={handleAlertDismiss}
              {...props}
            />
          )}
        </LongPressTooltip>
      )}

      <span>{message}</span>

      {/* `gap` rather than a margin per button: the toolbar wraps, and a margin
          would indent whichever button starts the second row and leave the rows
          touching. */}
      {buttonActions.length > 0 && (
        <ButtonToolbar className="mt-2 gap-2">
          {buttonActions.map(
            ({ name, action, href, variant: buttonStyle }, i) => (
              <Button
                size="sm"
                key={i}
                variant={buttonStyle}
                // A link still dismisses: the toast has been acted on, and one
                // that survived an `intent://` hand-off would be waiting on return
                // to say something the user has already dealt with.
                href={href}
                onClick={() => onAction(id, action)}
              >
                {name}
              </Button>
            ),
          )}
        </ButtonToolbar>
      )}

      {timeout !== undefined && !pinned && (
        <div
          className={`d-flex align-items-center gap-2 mt-2 ${classes.countdown}`}
        >
          <div className="bg-body flex-grow-1">
            <div
              className="bg-primary"
              style={{
                width: `${((timeout - elapsed) / timeout) * 100}%`,
                height: '2px',
              }}
            />
          </div>

          {/* Not where there is no ×: cancelling the countdown also exempts the
              toast from `cancelType` and the predicates, leaving no way out. */}
          {!noClose && (
            <LongPressTooltip label={m?.general.cancelAutoClose}>
              {({ props }) => (
                <button
                  type="button"
                  className={classes.iconButton}
                  onClick={handleKeepOpen}
                  {...props}
                >
                  <LuAlarmClockOff />
                </button>
              )}
            </LongPressTooltip>
          )}
        </div>
      )}
    </Alert>
  );
}

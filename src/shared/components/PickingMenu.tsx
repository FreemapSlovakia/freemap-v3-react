import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

type Props = {
  /** What the map is being asked for. */
  prompt: ReactNode;
  onCancel: () => void;
  /** Adds a confirm button; without one the map click is the whole answer. */
  onConfirm?: () => void;
  /** Names the confirm button; OK when unset. */
  confirmLabel?: ReactNode;
  confirmDisabled?: boolean;
  /** Only where Escape really cancels the mode — see `keyboardHandler`. */
  cancelKbd?: string;
};

/**
 * The only toolbar up while the map waits for a click that says where — the
 * rest of the chrome is hidden; see `pickingModeSelector`.
 */
export function PickingMenu({
  prompt,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  cancelKbd,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="px-1">{prompt}</div>

        {onConfirm && (
          <LongPressTooltip
            breakpoint="sm"
            label={confirmLabel ?? m?.general.ok}
          >
            {({ label, labelClassName, props }) => (
              <Button
                variant="primary"
                onClick={onConfirm}
                disabled={confirmDisabled}
                {...props}
              >
                <FaCheck />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        <LongPressTooltip
          breakpoint="sm"
          label={m?.general.cancel}
          kbd={cancelKbd}
        >
          {({ label, labelClassName, props }) => (
            <Button variant="dark" onClick={onCancel} {...props}>
              <FaTimes />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}

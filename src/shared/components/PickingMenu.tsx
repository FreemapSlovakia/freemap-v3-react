import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

type Props = {
  /** What the map is being asked for. */
  prompt: ReactNode;
  onCancel: () => void;
};

/**
 * The only toolbar up while the map waits for a click that says where — the
 * rest of the chrome is hidden; see `pickingModeSelector`.
 */
export function PickingMenu({ prompt, onCancel }: Props): ReactElement {
  const m = useMessages();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="px-1">{prompt}</div>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel}>
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

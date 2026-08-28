import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

/**
 * The toolbar a map mode waiting on a click puts up in place of the selection's
 * own: what it is waiting for, and the way out of it.
 */
export function PromptToolbar({
  prompt,
  onCancel,
  children,
}: {
  prompt: ReactNode;
  onCancel: () => void;
  /** What the mode itself offers — a confirmation, say — before the way out. */
  children?: ReactNode;
}): ReactElement {
  const m = useMessages();

  return (
    <Toolbar className="mt-2">
      <span className="px-1">{prompt}</span>

      {children}

      <LongPressTooltip breakpoint="sm" kbd="Esc" label={m?.general.cancel}>
        {({ label, labelClassName, props }) => (
          <Button variant="secondary" onClick={onCancel} {...props}>
            <FaTimes />
            <span className={labelClassName}>{label}</span>
          </Button>
        )}
      </LongPressTooltip>
    </Toolbar>
  );
}

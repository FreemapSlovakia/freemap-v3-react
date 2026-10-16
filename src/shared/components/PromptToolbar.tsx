import { useMessages } from '@features/l10n/l10nInjector.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useEscapeKbd } from '@shared/hooks/useEscapeKbd.js';
import type { ReactElement, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

/**
 * The toolbar a map mode waiting on a click puts up in place of the selection's
 * own: what it is waiting for, and the way out of it.
 */
export function PromptToolbar({
  prompt,
  cancel,
  children,
}: {
  prompt: ReactNode;
  /** What leaves the mode; an action, so Escape's hint can tell it is the one. */
  cancel: UnknownAction;
  /** What the mode itself offers — a confirmation, say — before the way out. */
  children?: ReactNode;
}): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const cancelKbd = useEscapeKbd(cancel);

  return (
    <Toolbar className="mt-2">
      <span className="px-1">{prompt}</span>

      {children}

      <LongPressTooltip
        breakpoint="sm"
        kbd={cancelKbd}
        label={m?.general.cancel}
      >
        {({ label, labelClassName, props }) => (
          <Button
            variant="secondary"
            onClick={() => dispatch(cancel)}
            {...props}
          >
            <FaTimes />
            <span className={labelClassName}>{label}</span>
          </Button>
        )}
      </LongPressTooltip>
    </Toolbar>
  );
}

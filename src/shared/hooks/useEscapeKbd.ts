import { escapeAction } from '@app/keyboardHandler.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import { useAppSelector } from './useAppSelector.js';

/**
 * `Esc` for the `kbd` of the control dispatching `action`, while Escape does
 * just that; nothing while it does something else — so of several ways out on
 * screen, only the one the key takes shows it.
 */
export function useEscapeKbd(action: UnknownAction): 'Esc' | undefined {
  const escapes = useAppSelector((state) => {
    const pressed = escapeAction(state);

    return (
      pressed?.type === action.type &&
      JSON.stringify(pressed['payload']) === JSON.stringify(action['payload'])
    );
  });

  return escapes ? 'Esc' : undefined;
}

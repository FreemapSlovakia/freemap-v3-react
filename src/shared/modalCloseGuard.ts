import { getMessages } from '@features/l10n/messagesStore.js';
import {
  cancelOpenModal,
  openModal,
} from '@shared/components/ModalProvider.js';

/** One per shown form holding input its closing would lose. */
const guards = new Set<object>();

let asking = 0;

// Set when the question was withdrawn because its forms went (saved, closed).
let withdrawn = false;

/** Registers a form's guard (`useDirtyForm`); returns its removal. */
export function addCloseGuard(): () => void {
  const guard = {};

  guards.add(guard);

  return () => {
    guards.delete(guard);

    if (asking > 0 && !closeGuarded()) {
      withdrawn = true;

      cancelOpenModal();
    }
  };
}

export function closeGuarded(): boolean {
  return guards.size > 0;
}

/**
 * Whether to go ahead and lose unsaved input, asking only if there is any:
 * `'gone'` when the input went meanwhile, so there is nothing left to close.
 */
export async function confirmDiscard(): Promise<'discard' | 'keep' | 'gone'> {
  if (!closeGuarded()) {
    return 'discard';
  }

  const m = getMessages();

  asking++;

  withdrawn = false;

  try {
    const { result } = await openModal({
      message: m?.general.closeWithoutSaving,
      confirmLabel: m?.general.yes,
      cancelLabel: m?.general.no,
      confirmStyle: 'danger',
    });

    return result === 'confirm' ? 'discard' : withdrawn ? 'gone' : 'keep';
  } finally {
    asking--;
  }
}

/** `close` for the user's own dismissal: Cancel, ×, Escape, the backdrop. */
export function askBeforeClosing(close: () => void): void {
  // At once when there is nothing to ask about, as a plain close would.
  if (!closeGuarded()) {
    close();

    return;
  }

  void confirmDiscard().then((answer) => {
    if (answer === 'discard') {
      close();
    }
  });
}

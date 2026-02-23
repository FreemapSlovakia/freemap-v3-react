import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaBan, FaCircle } from 'react-icons/fa';
import { Shortcut } from '../../types/common.js';

interface ShortcutRecorderProps {
  value?: Shortcut | null;
  onChange?: (shortcut: Shortcut | null | undefined) => void;
}

const modifierOrderMac = ['meta', 'shift', 'alt', 'ctrl'] as const;
const modifierOrderWin = ['ctrl', 'shift', 'alt', 'meta'] as const;

const displayNames: Record<string, string> = {
  Escape: 'Esc',
  Enter: 'Enter',
  Space: 'Space',
  Tab: 'Tab',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  NumpadEnter: 'NumEnter',
  NumpadAdd: 'Num+',
  NumpadSubtract: 'Num-',
  NumpadDecimal: 'Num.',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Semicolon: ';',
  Quote: "'",
  Backslash: '\\',
  Comma: ',',
  Period: '.',
  Slash: '/',
  // TODO add more
};

export function formatShortcut(sc: Shortcut): string {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  const order = isMac ? modifierOrderMac : modifierOrderWin;

  const parts: string[] = [];

  for (const mod of order) {
    if (sc[mod]) {
      if (mod === 'meta') {
        parts.push(isMac ? '⌘' : '⊞');
      } else if (mod === 'shift') {
        parts.push('⇧');
      } else if (mod === 'alt') {
        parts.push('⌥');
      } else if (mod === 'ctrl') {
        parts.push('⌃');
      }
    }
  }

  const main =
    displayNames[sc.code] || sc.code.replace(/^Key/, '').replace(/^Digit/, '');

  parts.push(main.toLowerCase());

  return parts.join('');
}

export function ShortcutRecorder({
  value = null,
  onChange,
}: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!recording) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // cancel
      if (e.code === 'Escape') {
        setRecording(false);
        return;
      }

      if (
        (e.code === 'Backspace' || e.code === 'Delete') &&
        !(e.ctrlKey || e.altKey || e.metaKey)
      ) {
        setRecording(false);
        onChange?.(e.shiftKey ? undefined : null);
        return;
      }

      // Only proceed if non-modifier key
      if (
        e.code.startsWith('Shift') ||
        e.code.startsWith('Control') ||
        e.code.startsWith('Alt') ||
        e.code.startsWith('Meta')
      ) {
        return;
      }

      const newSc: Shortcut = {
        code: e.code,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      };

      setRecording(false);

      onChange?.(newSc);
    };

    window.addEventListener('keydown', handler, { capture: true });

    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  }, [recording, onChange]);

  const handleClick = () => {
    setRecording(true);
  };

  useEffect(() => {
    const handlePointerDown = () => {
      setRecording(false);
    };

    window.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);

  return (
    <Button
      type="button"
      size="sm"
      variant="light"
      tabIndex={0}
      onClick={handleClick}
      className="text-nowrap"
    >
      {recording ? (
        <FaCircle className="text-danger" />
      ) : value ? (
        formatShortcut(value)
      ) : (
        <FaBan className="text-danger" />
      )}
    </Button>
  );
}

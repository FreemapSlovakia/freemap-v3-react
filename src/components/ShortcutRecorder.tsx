import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

type Shortcut = {
  code: string; // event.code of main key
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
};

interface ShortcutRecorderProps {
  value?: Shortcut | null;
  onChange?: (shortcut: Shortcut | null) => void;
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
  // Add more as needed.
};

function formatShortcut(sc: Shortcut): string {
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

  parts.push(main);

  return parts.join('');
}

export function ShortcutRecorder({
  value = null,
  onChange,
}: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [shortcut, setShortcut] = useState<Shortcut | null>(value);
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Cancel/clear
      if (e.code === 'Escape') {
        setRecording(false);
        return;
      }
      if (
        (e.code === 'Backspace' || e.code === 'Delete') &&
        !(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)
      ) {
        setShortcut(null);
        setRecording(false);
        onChange?.(null);
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
      setShortcut(newSc);
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

  return (
    <div>
      <Button
        type="button"
        ref={containerRef}
        tabIndex={0}
        onClick={handleClick}
        style={{
          padding: '8px',
          border: '1px solid #ccc',
          display: 'inline-block',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {recording
          ? 'Recording… (Press a key)'
          : shortcut
            ? formatShortcut(shortcut)
            : 'Click to record shortcut'}
      </Button>
    </div>
  );
}

import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaCopy } from 'react-icons/fa';

export function useCopyButton(text: string) {
  const [checked, setChecked] = useState(false);

  const tid = useRef<number | undefined>(undefined);

  const handleCopyClick = useCallback(() => {
    // Clipboard access can be missing (insecure context) or rejected by a
    // permissions policy (embedded/webview); swallow so it isn't error noise.
    navigator.clipboard?.writeText(text).catch(() => undefined);

    setChecked(true);

    if (tid.current) {
      window.clearTimeout(tid.current);
    }

    tid.current = window.setTimeout(() => {
      tid.current = undefined;

      setChecked(false);
    }, 1000);
  }, [text]);

  useEffect(
    () => () => {
      if (tid.current) {
        window.clearTimeout(tid.current);
      }
    },
    [],
  );

  return (
    <LongPressTooltip label="Copy to clipboard">
      {({ props }) => (
        <Button onClick={handleCopyClick} {...props}>
          {checked ? <FaCheck /> : <FaCopy />}
        </Button>
      )}
    </LongPressTooltip>
  );
}

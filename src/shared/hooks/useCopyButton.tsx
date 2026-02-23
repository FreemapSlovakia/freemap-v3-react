import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaCopy } from 'react-icons/fa';

export function useCopyButton(text: string) {
  const [checked, setChecked] = useState(false);

  const tid = useRef<number | undefined>(undefined);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(text);

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
        <Button type="button" onClick={handleCopyClick} {...props}>
          {checked ? <FaCheck /> : <FaCopy />}
        </Button>
      )}
    </LongPressTooltip>
  );
}

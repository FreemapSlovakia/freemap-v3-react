import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, type ButtonProps } from 'react-bootstrap';
import { FaBook } from 'react-icons/fa';
import { useOpenManual } from '../hooks/useOpenManual.js';

/** Opens the manual at the chapter about a floating window, from its toolbar. */
export function ManualWindowButton({
  chapter,
  size,
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
  size?: ButtonProps['size'];
}): ReactElement {
  const m = useMessages();

  const openManual = useOpenManual('window');

  return (
    <LongPressTooltip label={m?.mainMenu.manual}>
      {({ props }) => (
        <Button
          variant="secondary"
          size={size}
          href={`#show=manual/${chapter}`}
          onClick={(e) => {
            e.preventDefault();

            openManual(chapter);
          }}
          {...props}
        >
          <FaBook />
        </Button>
      )}
    </LongPressTooltip>
  );
}

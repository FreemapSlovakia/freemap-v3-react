import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaBook } from 'react-icons/fa';
import { useOpenManual } from '../hooks/useOpenManual.js';

/**
 * Opens the manual at the chapter about a modal. Goes in its `Modal.Header`
 * after the title; the header's close button then sits right beside it.
 */
export function ManualHeaderButton({
  chapter,
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
}): ReactElement {
  const m = useMessages();

  const openManual = useOpenManual('modal');

  return (
    <LongPressTooltip label={m?.mainMenu.manual}>
      {({ props }) => (
        <Button
          variant="link"
          className="fm-modal-manual"
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

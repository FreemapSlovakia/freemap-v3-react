import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaBook } from 'react-icons/fa';
import { useOpenManual } from '../hooks/useOpenManual.js';

/**
 * Opens the manual at the chapter about a modal or a docked panel. Goes in its
 * header after the title; the header's close button then sits right beside it.
 */
export function ManualHeaderButton({
  chapter,
  from = 'modal',
}: {
  /** A `src/manual/<chapter>.<lang>.md` key; an unknown one opens the first. */
  chapter: string;
  from?: 'modal' | 'panel';
}): ReactElement {
  const m = useMessages();

  const openManual = useOpenManual(from);

  return (
    <LongPressTooltip label={m?.mainMenu.manual}>
      {({ props }) => (
        <Button
          variant="link"
          className="fm-modal-manual"
          href={`#show=manual/${chapter}`}
          // What F1 opens while this modal is in front.
          data-manual-chapter={chapter}
          onClick={(e) => {
            e.preventDefault();

            openManual(chapter);
          }}
          {...props}
        >
          {/* Centred like the ×, without the app's nudge onto a text line */}
          <FaBook style={{ top: 0 }} />
        </Button>
      )}
    </LongPressTooltip>
  );
}

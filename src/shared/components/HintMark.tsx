import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import type { ReactElement, ReactNode } from 'react';
import { FaRegQuestionCircle } from 'react-icons/fa';

type Props = {
  /** What the control means, shown on hover or a tap. */
  hint: ReactNode;
};

/**
 * A `?` beside a control, standing for the sentence that would otherwise sit
 * under it. Nothing until its feature's messages have loaded, and outside a
 * checkbox's own `<label>`, so pressing it explains rather than toggles.
 */
export function HintMark({ hint }: Props): ReactElement | null {
  return !hint ? null : (
    <GlyphMarker hint={hint} color="secondary" toggleOnClick>
      <FaRegQuestionCircle />
    </GlyphMarker>
  );
}

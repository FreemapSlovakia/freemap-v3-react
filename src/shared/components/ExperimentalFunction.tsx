import { useMessages } from '@features/l10n/l10nInjector.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import type { HTMLAttributes, ReactElement } from 'react';
import { FaFlask } from 'react-icons/fa';

/**
 * Marks a function as not finished yet.
 *
 * Goes **beside** a `<Button>`, never inside one: the flask carries its own
 * long-press tooltip, and a press that has to mean either "explain the flask" or
 * "press the button" can only get one of them wrong.
 */
export function ExperimentalFunction(
  props: HTMLAttributes<HTMLElement>,
): ReactElement {
  const m = useMessages();

  return (
    <GlyphMarker hint={m?.general.experimentalFunction} {...props}>
      <FaFlask />
    </GlyphMarker>
  );
}

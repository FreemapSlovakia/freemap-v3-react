import type { Tool } from '@app/store/actions.js';
import { type ChordTarget, chordFor } from '@shared/chordDefinitions.js';
import type { ReactElement } from 'react';

/**
 * The keys that reach something, printed as a menu prints them. Nothing is
 * drawn for a target with no chord, nor in an embedded map — `keyboardHandler`
 * starts no chord there, so the keys would name something that can't happen.
 */
export function Chord(
  target: ChordTarget | { tool: Tool },
): ReactElement | null {
  const keys = window.fmEmbedded ? [] : chordFor(target);

  return keys.length === 0 ? null : (
    <>
      {/* Keyed by position: a chord can press the same key twice (`e` `e`). */}
      {keys.map((key, i) => (
        <kbd key={i}>{key}</kbd>
      ))}
    </>
  );
}

import { useMessages } from '@features/l10n/l10nInjector.js';
import { promptSimplification } from '@shared/simplifyPrompt.js';
import type { Position } from 'geojson';
import { useCallback } from 'react';

/** {@link promptSimplification} with the question in the user's language. */
export function useSimplifyPrompt(): (
  lines: Position[][],
  preamble?: string,
) => number | null {
  const m = useMessages();

  return useCallback(
    (lines, preamble) =>
      promptSimplification(lines, m?.general.simplifyPrompt, preamble),
    [m],
  );
}

import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';

export function useNumberFormat(options?: Intl.NumberFormatOptions) {
  const language = useAppSelector((state) => state.l10n.language);

  // Callers pass a fresh options object each render; key the memo on its content
  // so the formatter keeps a stable identity (some callers use it as a memo or
  // effect dependency).
  const optionsKey = options ? JSON.stringify(options) : '';

  // biome-ignore lint/correctness/useExhaustiveDependencies: optionsKey is the stable proxy for options
  return useMemo(
    () => new Intl.NumberFormat(language, options),
    [language, optionsKey],
  );
}

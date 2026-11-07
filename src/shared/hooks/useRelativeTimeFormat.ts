import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';

export function useRelativeTimeFormat(
  options?: Intl.RelativeTimeFormatOptions,
) {
  const language = useAppSelector((state) => state.l10n.language);

  // Keyed on the options' content: callers pass a fresh literal every render.
  const key = options ? JSON.stringify(options) : '';

  return useMemo(
    () =>
      new Intl.RelativeTimeFormat(
        language,
        key ? (JSON.parse(key) as Intl.RelativeTimeFormatOptions) : undefined,
      ),
    [key, language],
  );
}

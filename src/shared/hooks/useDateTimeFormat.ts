import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';

export function useDateTimeFormat(options: Intl.DateTimeFormatOptions) {
  const language = useAppSelector((state) => state.l10n.language);

  // Keyed on the options' content: callers pass a fresh literal every render.
  const key = JSON.stringify(options);

  return useMemo(
    () =>
      new Intl.DateTimeFormat(
        language,
        JSON.parse(key) as Intl.DateTimeFormatOptions,
      ),
    [key, language],
  );
}

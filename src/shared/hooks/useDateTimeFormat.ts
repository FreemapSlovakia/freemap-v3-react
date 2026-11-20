import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';

/** A time of day with its weekday, as route and forecast times show it. */
export const WEEKDAY_TIME: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
};

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

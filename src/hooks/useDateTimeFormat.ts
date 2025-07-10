import { useAppSelector } from './useAppSelector.js';

export function useDateTimeFormat(options: Intl.DateTimeFormatOptions) {
  const language = useAppSelector((state) => state.l10n.language);

  return new Intl.DateTimeFormat(language, options);
}

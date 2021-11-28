import { useSelector } from 'react-redux';

export function useDateTimeFormat(options: Intl.DateTimeFormatOptions) {
  const language = useSelector((state) => state.l10n.language);

  return new Intl.DateTimeFormat(language, options);
}

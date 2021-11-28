import { useSelector } from 'react-redux';

export function useNumberFormat(options: Intl.NumberFormatOptions) {
  const language = useSelector((state) => state.l10n.language);

  return new Intl.NumberFormat(language, options);
}

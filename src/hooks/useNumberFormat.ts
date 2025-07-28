import { useAppSelector } from './useAppSelector.js';

export function useNumberFormat(options?: Intl.NumberFormatOptions) {
  const language = useAppSelector((state) => state.l10n.language);

  return new Intl.NumberFormat(language, options);
}

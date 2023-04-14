import { useAppSelector } from './reduxSelectHook';

export function useNumberFormat(options: Intl.NumberFormatOptions) {
  const language = useAppSelector((state) => state.l10n.language);

  return new Intl.NumberFormat(language, options);
}

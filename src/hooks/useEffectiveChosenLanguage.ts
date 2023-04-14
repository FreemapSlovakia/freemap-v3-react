import { getEffectiveChosenLanguage } from 'fm3/langUtils';
import { useAppSelector } from './reduxSelectHook';

export function useEffectiveChosenLanguage() {
  return getEffectiveChosenLanguage(
    useAppSelector((state) => state.l10n.chosenLanguage),
  );
}

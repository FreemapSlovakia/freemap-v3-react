import { getEffectiveChosenLanguage } from '../langUtils.js';
import { useAppSelector } from './reduxSelectHook.js';

export function useEffectiveChosenLanguage() {
  return getEffectiveChosenLanguage(
    useAppSelector((state) => state.l10n.chosenLanguage),
  );
}

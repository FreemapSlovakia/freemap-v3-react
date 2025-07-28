import { getEffectiveChosenLanguage } from '../langUtils.js';
import { useAppSelector } from './useAppSelector.js';

export function useEffectiveChosenLanguage() {
  return getEffectiveChosenLanguage(
    useAppSelector((state) => state.l10n.chosenLanguage),
  );
}

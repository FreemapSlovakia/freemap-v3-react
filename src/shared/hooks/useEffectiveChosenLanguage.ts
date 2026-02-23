import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { getEffectiveChosenLanguage } from '../../langUtils.js';

export function useEffectiveChosenLanguage() {
  return getEffectiveChosenLanguage(
    useAppSelector((state) => state.l10n.chosenLanguage),
  );
}

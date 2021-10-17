import { getEffectiveChosenLanguage } from 'fm3/langUtils';
import { useSelector } from 'react-redux';

export function useEffectiveChosenLanguage() {
  return getEffectiveChosenLanguage(
    useSelector((state) => state.l10n.chosenLanguage),
  );
}

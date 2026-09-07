import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Language } from '@shared/langUtils.js';

// Kept per language rather than per component: a layer menu or a settings table
// holds dozens of country marks at once, and there are only as many instances as
// there are UI languages.
const byLanguage = new Map<Language, Intl.DisplayNames>();

/** Country names in the UI language. `of` throws on a non-region code. */
export function useRegionNames(): Intl.DisplayNames {
  const language = useAppSelector((state) => state.l10n.language);

  let names = byLanguage.get(language);

  if (!names) {
    names = new Intl.DisplayNames(language, { type: 'region' });

    byLanguage.set(language, names);
  }

  return names;
}

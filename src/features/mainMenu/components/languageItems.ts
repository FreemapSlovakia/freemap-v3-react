import { type Language, languages } from '@shared/langUtils.js';

const languageNames: Record<Language, string> = {
  sk: 'Slovenčina',
  cs: 'Čeština',
  pl: 'Polski',
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  sl: 'Slovenščina',
  fr: 'Français',
};

// The flag's country code matches the language code for most languages; only
// these differ.
const flagCountries: Partial<Record<Language, string>> = {
  cs: 'cz',
  en: 'gb',
  sl: 'si',
};

function toFlag(language: Language): string {
  const country = flagCountries[language] ?? language;

  return String.fromCodePoint(
    ...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 0x41),
  );
}

// Menu order depends on the domain: freemap.sk leads with Slovak (home site)
// then English; other domains (freemap.eu, …) lead with English. The remaining
// languages follow alphabetically by endonym. Deriving the tail by sorting
// `languages` keeps any newly added language in the menu automatically.
function getLanguageItems() {
  const pinned: Language[] = window.location.hostname.endsWith('freemap.sk')
    ? ['sk', 'en']
    : ['en'];

  const rest = languages
    .filter((code) => !pinned.includes(code))
    .sort((a, b) => languageNames[a].localeCompare(languageNames[b]));

  return [...pinned, ...rest].map((code) => ({
    code,
    name: languageNames[code],
    flag: toFlag(code),
  }));
}

export const languageItems = getLanguageItems();

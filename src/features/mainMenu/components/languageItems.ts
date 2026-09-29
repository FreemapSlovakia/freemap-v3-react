import { type Language, languages } from '@shared/langUtils.js';
import { makeLabelComparator } from '@shared/stringUtils.js';

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
// Each endonym is in its own language, so the order is collated with a fixed
// locale — everyone sees the same menu regardless of the UI or browser language.
const isHomeSite = window.location.hostname.endsWith('freemap.sk');

function getLanguageItems() {
  const pinned: Language[] = isHomeSite ? ['sk', 'en'] : ['en'];

  const byName = makeLabelComparator('en');

  const rest = languages
    .filter((code) => !pinned.includes(code))
    .sort((a, b) => byName(languageNames[a], languageNames[b]));

  return [...pinned, ...rest].map((code) => ({
    code,
    name: languageNames[code],
    flag: toFlag(code),
  }));
}

export const languageItems = getLanguageItems();

// By Matomo actions per browser language (2026-07 – 2026-09).
const usageRank: Record<Language, number> = {
  sk: 0,
  en: 1,
  it: 2,
  cs: 3,
  hu: 4,
  pl: 5,
  de: 6,
  fr: 7,
  sl: 8,
};

// English leads off freemap.sk, as in the submenu.
function rankOf(code: Language) {
  return code === 'en' && !isHomeSite ? -1 : usageRank[code];
}

/** The flags beside the menu's Language item, most used first. */
export const flagItems = [...languageItems].sort(
  (a, b) => rankOf(a.code) - rankOf(b.code),
);

import z from 'zod';

// Canonical language list; drives the `Language` type and validation. The menu
// display order is domain-specific and computed in LanguageSubmenu.
export const languages = [
  'sk',
  'en',
  'cs',
  'de',
  'fr',
  'it',
  'hu',
  'pl',
  'sl',
] as const;

export type Language = (typeof languages)[number];

export const LanguageSchema = z.enum(languages);

export function isLanguage(lang: unknown): lang is Language {
  return (languages as readonly unknown[]).includes(lang);
}

export function getEffectiveChosenLanguage(
  chosenLanguage: string | null,
): Language {
  if (isLanguage(chosenLanguage)) {
    return chosenLanguage;
  }

  for (const lang of [
    ...(window.navigator.languages ?? []),
    window.navigator.language,
  ]) {
    const simplified = simplify(lang);

    if (isLanguage(simplified)) {
      return simplified;
    }
  }

  return 'en';
}

function simplify(lang: string | null | undefined) {
  return lang?.replace(/-.*/, '');
}

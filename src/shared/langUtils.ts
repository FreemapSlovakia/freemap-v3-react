import z from 'zod';

export const languages = [
  'sk',
  'cs',
  'pl',
  'hu',
  'en',
  'de',
  'it',
  'sl',
  'fr',
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

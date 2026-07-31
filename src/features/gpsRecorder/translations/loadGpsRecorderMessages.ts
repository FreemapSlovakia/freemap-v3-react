import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

let cache: GpsRecorderMessages | undefined;

let cacheLang: string | undefined;

/**
 * Loads the recorder messages for a language for use outside React — the toasts
 * the tool raises resolve their `messageKey` against this. React components
 * should use `useGpsRecorderMessages` instead; the chunk is the same one, so a
 * component that has already rendered has paid for this too.
 */
export async function loadGpsRecorderMessages(
  language: string,
): Promise<GpsRecorderMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "gps-recorder-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as GpsRecorderMessages;
}

import type { MeasurementMessages } from './MeasurementMessages.js';

let cache: MeasurementMessages | undefined;

let cacheLang: string | undefined;

// Loads the measurement messages for a language for use outside React (the
// measurement processor's result/error toasts). Results are cached per language.
export async function loadMeasurementMessages(
  language: string,
): Promise<MeasurementMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "measurement-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MeasurementMessages;
}

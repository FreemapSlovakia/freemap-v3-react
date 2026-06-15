import type { MapSettingsMessages } from './MapSettingsMessages.js';

let cache: MapSettingsMessages | undefined;

let cacheLang: string | undefined;

// Loads the map-settings messages for a language for use outside React (the
// settings-save toasts dispatched from `saveSettingsProcessor`, the l10n
// language processor, and the home-location picker). Results are cached per
// language; the chunk is shared with the components' dynamic import.
export async function loadMapSettingsMessages(
  language: string,
): Promise<MapSettingsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "map-settings-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MapSettingsMessages;
}

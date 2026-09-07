import type { ElevationChartMessages } from './ElevationChartMessages.js';

let cache: ElevationChartMessages | undefined;

let cacheLang: string | undefined;

// Loads the elevation-chart messages for a language for use outside React
// (toast dispatch). React components should use `useLocalMessages` instead.
// Results are cached per language; the chunk is shared with the components'
// dynamic import.
export async function loadElevationChartMessages(
  language: string,
): Promise<ElevationChartMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "elevation-chart-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as ElevationChartMessages;
}

import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { MapSettingsMessages } from './MapSettingsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "map-settings-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useMapSettingsMessages(): MapSettingsMessages | undefined {
  return useLocalMessages<MapSettingsMessages>(factory);
}

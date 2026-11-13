import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { TerrainModelMessages } from './TerrainModelMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "terrain-model-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useTerrainModelMessages(): TerrainModelMessages | undefined {
  return useLocalMessages<TerrainModelMessages>(factory);
}

import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { OsmNotesMessages } from './OsmNotesMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "osm-notes-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useOsmNotesMessages(): OsmNotesMessages | undefined {
  return useLocalMessages<OsmNotesMessages>(factory);
}

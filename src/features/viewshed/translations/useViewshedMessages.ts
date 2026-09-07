import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "viewshed-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useViewshedMessages(): ViewshedMessages | undefined {
  return useLocalMessages<ViewshedMessages>(factory);
}

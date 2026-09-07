import { useLocalMessages } from '@features/l10n/l10nInjector.js';
import type { EventsMessages } from './EventsMessages.js';

const factory = (language: string) =>
  import(
    /* webpackChunkName: "events-translation-[request]" */
    `./${language}.messages.tsx`
  );

export function useEventsMessages(): EventsMessages | undefined {
  return useLocalMessages<EventsMessages>(factory);
}

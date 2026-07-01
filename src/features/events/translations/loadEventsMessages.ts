import type { EventsMessages } from './EventsMessages.js';

let cache: EventsMessages | undefined;

let cacheLang: string | undefined;

// Loads the events messages for a language for use outside React (the events
// load/save/delete processors' error toasts). React components should use
// `useEventsMessages` instead. Cached per language; the chunk is shared with
// the components' dynamic import.
export async function loadEventsMessages(
  language: string,
): Promise<EventsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "events-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as EventsMessages;
}

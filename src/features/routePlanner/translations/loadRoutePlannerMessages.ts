import type { RoutePlannerMessages } from './RoutePlannerMessages.js';

let cache: RoutePlannerMessages | undefined;

let cacheLang: string | undefined;

// Loads the route-planner messages for a language for use outside React (export
// processors, toast/error dispatch in processors). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadRoutePlannerMessages(
  language: string,
): Promise<RoutePlannerMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "route-planner-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as RoutePlannerMessages;
}

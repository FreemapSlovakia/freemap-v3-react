import type { MyMapsMessages } from './MyMapsMessages.js';

let cache: MyMapsMessages | undefined;

let cacheLang: string | undefined;

// Loads the my-maps messages for a language for use outside React (the maps
// load/save/delete processors' error toasts). React components should use
// `useLocalMessages` instead. Results are cached per language; the chunk is
// shared with the components' dynamic import.
export async function loadMyMapsMessages(
  language: string,
): Promise<MyMapsMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "my-maps-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as MyMapsMessages;
}

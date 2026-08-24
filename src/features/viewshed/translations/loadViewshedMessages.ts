import type { ViewshedMessages } from './ViewshedMessages.js';

let cache: ViewshedMessages | undefined;

let cacheLang: string | undefined;

/**
 * Loads the viewshed messages for a language for use outside React — the toast
 * a failed render raises resolves its `messageKey` against this. Components use
 * `useViewshedMessages`; the chunk is the same one either way.
 */
export async function loadViewshedMessages(
  language: string,
): Promise<ViewshedMessages> {
  if (cacheLang !== language) {
    cache = (
      await import(
        /* webpackChunkName: "viewshed-translation-[request]" */
        `./${language}.messages.tsx`
      )
    ).default;

    cacheLang = language;
  }

  return cache as ViewshedMessages;
}

const ARTICLE_URL =
  /^https?:\/\/([a-z-]+)\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)/i;

/** OSM's `wikipedia=` as `lang:Title`, or the article's URL some write instead. */
export function parseWikipediaTag(
  value: string | undefined,
): { lang: string; title: string } | undefined {
  const trimmed = value?.trim() ?? '';

  const url = ARTICLE_URL.exec(trimmed);

  if (url) {
    try {
      return {
        lang: url[1]!.toLowerCase(),
        title: decodeURIComponent(url[2]!).replaceAll('_', ' '),
      };
    } catch {
      return undefined;
    }
  }

  // Lower case only, so `Category:` in a title is no language; `(?!//)`: another
  // site's URL is no `lang:Title`.
  const m = /^([a-z][a-z-]{1,11}):(?!\/\/)(.+)$/.exec(trimmed);

  return m ? { lang: m[1]!, title: m[2]! } : undefined;
}

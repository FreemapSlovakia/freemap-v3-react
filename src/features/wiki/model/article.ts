import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import type { WikiPreview } from './actions.js';
import { cleanExtract } from './cleanExtract.js';

/** Fetches a URL's JSON; the caller decides how to cancel and authenticate. */
export type GetJson = (url: string) => Promise<unknown>;

export const getJson: GetJson = async (url) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};

const LangLinksSchema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        langlinks: z
          .array(z.object({ lang: z.string(), '*': z.string() }))
          .optional(),
      }),
    ),
  }),
  continue: z.record(z.string(), z.unknown()).optional(),
});

const ArticleSchema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        title: z.string(),
        extract: z.string(),
        thumbnail: z
          .object({ source: z.string(), width: z.number(), height: z.number() })
          .optional(),
        pageimage: z.string().optional(),
        pageprops: z
          .object({ wikibase_item: z.string().optional() })
          .optional(),
      }),
    ),
  }),
});

/** The article in `language` where one exists, else in `lang`; `intro`, its opening only. */
export async function fetchArticle(
  get: GetJson,
  sourceLang: string,
  sourceTitle: string,
  language: string,
  intro = false,
): Promise<WikiPreview> {
  let lang = sourceLang;

  let title = sourceTitle;

  if (language !== lang) {
    let cont: Record<string, unknown> | undefined = {};

    do {
      const data = LangLinksSchema.parse(
        await get(
          `https://${lang}.wikipedia.org/w/api.php?` +
            objectToURLSearchParams({
              origin: '*',
              action: 'query',
              prop: 'langlinks',
              // Only the one wanted, else they come ten to a page.
              lllang: language,
              format: 'json',
              // OSM tags often name a redirect.
              redirects: '1',
              titles: title,
              ...cont,
            }),
        ),
      );

      const item = Object.values(data.query.pages)[0]?.langlinks?.find(
        (ll) => ll.lang === language,
      );

      if (item) {
        lang = item.lang;

        title = item['*'];

        break;
      }

      cont = data.continue;
    } while (cont);
  }

  const data = ArticleSchema.parse(
    await get(
      `https://${lang}.wikipedia.org/w/api.php?` +
        objectToURLSearchParams({
          origin: '*',
          action: 'query',
          prop: 'extracts|pageimages|pageprops',
          ppprop: 'wikibase_item',
          format: 'json',
          piprop: 'thumbnail|name',
          pithumbsize: 280,
          redirects: '1',
          titles: title,
          ...(intro && { exintro: '1' }),
        }),
    ),
  );

  const { pageprops, ...page } = Object.values(data.query.pages)[0]!;

  return {
    ...page,
    extract: cleanExtract(page.extract),
    lang,
    // The redirect's target, where it named one.
    langTitle: page.title,
    wikidata: pageprops?.wikibase_item,
  };
}

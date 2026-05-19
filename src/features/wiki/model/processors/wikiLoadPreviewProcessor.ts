import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { WikiPreview, wikiLoadPreview, wikiSetPreview } from '../actions.js';

const WikiResponse1Schema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        langlinks: z
          .array(
            z.object({
              lang: z.string(),
              '*': z.string(),
            }),
          )
          .optional(),
      }),
    ),
  }),
  continue: z.record(z.string(), z.unknown()).optional(),
});

const WikiResponse2Schema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        title: z.string(),
        extract: z.string(),
        thumbnail: z
          .object({
            source: z.string(),
            width: z.number(),
            height: z.number(),
          })
          .optional(),
      }),
    ),
  }),
  continue: z.record(z.string(), z.unknown()).optional(),
});

export const wikiLoadPreviewProcessor: Processor<typeof wikiLoadPreview> = {
  actionCreator: wikiLoadPreview,
  errorKey: 'general.loadError',
  handle: async ({ getState, dispatch, action }) => {
    const p = action.payload.indexOf(':');

    let lang = action.payload.slice(0, p);

    let title = action.payload.slice(p + 1);

    const { language } = getState().l10n;

    if (language !== lang) {
      let cont: Record<string, unknown> | undefined = {};

      do {
        const res = await httpRequest({
          getState,
          url:
            `https://${lang}.wikipedia.org/w/api.php?` +
            objectToURLSearchParams({
              origin: '*',
              action: 'query',
              prop: 'langlinks',
              format: 'json',
              titles: title,
              ...cont,
            }),
          expectedStatus: 200,
          cancelActions: [setActiveModal],
        });

        const okData = WikiResponse1Schema.parse(await res.json());

        const item = Object.values(okData.query.pages)[0]?.langlinks?.find(
          (ll) => ll.lang === language,
        );

        if (item) {
          lang = item.lang;

          title = item['*'];

          break;
        }

        cont = okData.continue;
      } while (cont);
    }

    const res = await httpRequest({
      getState,
      url:
        `https://${lang}.wikipedia.org/w/api.php?` +
        objectToURLSearchParams({
          origin: '*',
          action: 'query',
          prop: 'extracts|pageimages',
          format: 'json',
          pithumbsize: 280,
          titles: title,
        }),

      // url: `https://sk.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=${encodeURIComponent(
      //   action.payload,
      // )}&origin=*`,
      expectedStatus: 200,
      cancelActions: [setActiveModal],
    });

    const data = WikiResponse2Schema.parse(await res.json());

    const preview: WikiPreview = {
      ...Object.values(data.query.pages)[0],
      lang,
      langTitle: title,
    };

    dispatch(wikiSetPreview(preview));
  },
};

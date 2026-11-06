import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isAbortError } from '@shared/isAbortError.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import {
  type WikiPreview,
  wikiLoadPreview,
  wikiSetPreview,
} from '../actions.js';
import { selectedWikiId, wikiLayerOnSelector } from '../selectors.js';

/** Turning the layer off lets go of its article; a link naming one turns it on. */
export const wikiLayerOffProcessor: Processor = {
  stateChangePredicate: wikiLayerOnSelector,
  handle({ getState, dispatch }) {
    if (
      !wikiLayerOnSelector(getState()) &&
      selectedWikiId(getState()) !== null
    ) {
      dispatch(selectFeature(null));
    }
  },
};

/** The selected article's preview loaded, or none kept once nothing is. */
export const wikiSelectionProcessor: Processor = {
  stateChangePredicate: selectedWikiId,
  handle: ({ getState, dispatch }) => {
    const state = getState();

    const id = selectedWikiId(state);

    if (id !== null) {
      dispatch(wikiLoadPreview(id));
    } else if (state.wiki.preview || state.wiki.loading) {
      dispatch(wikiSetPreview(null));
    }
  },
};

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
    try {
      dispatch(wikiSetPreview(await loadPreview(getState, action.payload)));
    } catch (err) {
      // Nothing would show the article, nor retry it: selecting it again does.
      if (!isAbortError(err) && selectedWikiId(getState()) === action.payload) {
        dispatch(selectFeature(null));
      }

      throw err;
    }
  },
};

async function loadPreview(
  getState: () => RootState,
  id: string,
): Promise<WikiPreview> {
  const p = id.indexOf(':');

  let lang = id.slice(0, p);

  let title = id.slice(p + 1);

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
        stateChangePredicate: selectedWikiId,
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
    // Another article selected, or none.
    stateChangePredicate: selectedWikiId,
  });

  const data = WikiResponse2Schema.parse(await res.json());

  return { ...Object.values(data.query.pages)[0]!, lang, langTitle: title };
}

import {
  wikiLoadPreview,
  WikiPreview,
  wikiSetPoints,
  wikiSetPreview,
} from 'fm3/actions/wikiActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

interface WikiResponse1 {
  query: {
    pages: { [key: string]: { langlinks?: { lang: string; '*': string }[] } };
  };
  continue?: Record<string, unknown>;
}

interface WikiResponse2 {
  query: {
    pages: {
      [key: string]: {
        title: string;
        extract: string;
        thumbnail?: { source: string; width: number; height: number };
      };
    };
  };
  continue?: Record<string, unknown>;
}

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
        const { data } = await httpRequest({
          getState,
          method: 'GET',
          url: `https://${lang}.wikipedia.org/w/api.php`,
          params: {
            origin: '*',
            action: 'query',
            prop: 'langlinks',
            format: 'json',
            titles: title,
            ...cont,
          },
          expectedStatus: 200,
          cancelActions: [wikiLoadPreview, wikiSetPoints],
        });

        const okData: WikiResponse1 = assertType<WikiResponse1>(data);

        const item = Object.values(okData.query.pages)[0]?.langlinks?.find(
          (ll) => ll.lang == language,
        );

        if (item) {
          lang = item.lang;
          title = item['*'];

          break;
        }

        cont = okData.continue;
      } while (cont);
    }

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `https://${lang}.wikipedia.org/w/api.php`,
      params: {
        origin: '*',
        action: 'query',
        prop: 'extracts|pageimages',
        format: 'json',
        pithumbsize: 280,
        titles: title,
      },

      // url: `https://sk.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=${encodeURIComponent(
      //   action.payload,
      // )}&origin=*`,
      expectedStatus: 200,
      cancelActions: [wikiLoadPreview, wikiSetPoints],
    });

    const okData = assertType<WikiResponse2>(data);

    // TODO validate

    const preview: WikiPreview = {
      ...Object.values(okData.query.pages)[0],
      lang,
      langTitle: title,
    };

    dispatch(wikiSetPreview(preview));

    // dispatch(
    //   wikiSetPreview({
    //     title: data.parse.title,
    //     extract: data.parse.text['*'],
    //   }),
    // );
  },
};

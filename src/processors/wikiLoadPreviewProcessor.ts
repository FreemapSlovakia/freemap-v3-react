import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import {
  wikiSetPoints,
  wikiLoadPreview,
  wikiSetPreview,
} from 'fm3/actions/wikiActions';

export const wikiLoadPreviewProcessor: Processor<typeof wikiLoadPreview> = {
  actionCreator: wikiLoadPreview,
  errorKey: 'tracking.loadError', // TODO
  handle: async ({ getState, dispatch, action }) => {
    const p = action.payload.indexOf(':');
    let lang = action.payload.slice(0, p);
    let title = action.payload.slice(p + 1);
    const { language } = getState().l10n;

    if (language !== lang) {
      let cont = {};

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

        const item = (Object.values(
          data.query.pages,
        )[0] as any)?.langlinks?.find((ll: any) => ll.lang == language);

        if (item) {
          lang = item.lang;
          title = item['*'];

          break;
        }

        cont = data.continue;
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

    // TODO validate

    dispatch(wikiSetPreview(Object.values(data.query.pages)[0] as any));

    // dispatch(
    //   wikiSetPreview({
    //     title: data.parse.title,
    //     extract: data.parse.text['*'],
    //   }),
    // );
  },
};

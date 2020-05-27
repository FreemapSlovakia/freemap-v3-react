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

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url:
        `https://${action.payload.slice(0, p)}.wikipedia.org/w/api.php` +
        `?origin=*&action=query&prop=extracts|pageimages&format=json&pithumbsize=280&titles=${encodeURIComponent(
          action.payload.slice(p + 1),
        )}`,
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

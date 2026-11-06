import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isAbortError } from '@shared/isAbortError.js';
import { wikiLoadPreview, wikiSetPreview } from '../actions.js';
import { fetchArticle } from '../article.js';
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

// The language too: it can settle only after a link has selected the article.
const previewKey = (state: RootState) =>
  `${selectedWikiId(state)}\n${state.l10n.language}`;

/** The selected article's preview loaded, or none kept once nothing is. */
export const wikiSelectionProcessor: Processor = {
  stateChangePredicate: previewKey,
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

export const wikiLoadPreviewProcessor: Processor<typeof wikiLoadPreview> = {
  actionCreator: wikiLoadPreview,
  errorKey: 'general.loadError',
  handle: async ({ getState, dispatch, action }) => {
    const id = action.payload;

    const p = id.indexOf(':');

    const key = previewKey(getState());

    try {
      const preview = await fetchArticle(
        async (url) =>
          (
            await httpRequest({
              getState,
              url,
              expectedStatus: 200,
              // Another article selected, none, or another language.
              stateChangePredicate: previewKey,
            })
          ).json(),
        id.slice(0, p),
        id.slice(p + 1),
        getState().l10n.language,
      );

      // A later request, started after the change, isn't cancelled by it.
      if (previewKey(getState()) === key) {
        dispatch(wikiSetPreview(preview));
      }
    } catch (err) {
      // Nothing would show the article, nor retry it: selecting it again does.
      if (!isAbortError(err) && selectedWikiId(getState()) === id) {
        dispatch(selectFeature(null));
      }

      throw err;
    }
  },
};

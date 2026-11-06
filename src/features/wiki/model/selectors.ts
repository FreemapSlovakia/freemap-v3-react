import { userLayersSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';

/** The Wikipedia overlay's layer code. */
export const WIKI_LAYER = 'w';

export const wikiLayerOnSelector = (state: RootState): boolean =>
  userLayersSelector(state).includes(WIKI_LAYER);

/** The selected article's `<lang>:<title>`, if one is. */
export const selectedWikiId = ({ main: { selection } }: RootState) =>
  selection?.type === 'wiki' ? selection.id : null;

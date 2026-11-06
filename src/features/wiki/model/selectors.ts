import type { RootState } from '@app/store/store.js';

/** The Wikipedia overlay's layer code. */
export const WIKI_LAYER = 'w';

/** The selected article's `<lang>:<title>`, if one is. */
export const selectedWikiId = ({ main: { selection } }: RootState) =>
  selection?.type === 'wiki' ? selection.id : null;

import type { RootState } from '@app/store/store.js';

export const selectedOsmNoteId = ({ main: { selection } }: RootState) =>
  selection?.type === 'osm-note' ? selection.id : null;

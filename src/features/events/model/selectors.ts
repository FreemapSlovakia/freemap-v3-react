import type { RootState } from '@app/store/store.js';

export const selectedEventId = ({ main: { selection } }: RootState) =>
  selection?.type === 'event' ? selection.id : null;

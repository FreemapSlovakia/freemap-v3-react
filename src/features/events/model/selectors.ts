import { userLayersSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { EVENTS_LAYER } from './actions.js';

export const selectedEventId = ({ main: { selection } }: RootState) =>
  selection?.type === 'event' ? selection.id : null;

/** The user's own layers, so a library preview neither fetches nor draws them. */
export const eventsLayerOnSelector = (state: RootState): boolean =>
  userLayersSelector(state).includes(EVENTS_LAYER);

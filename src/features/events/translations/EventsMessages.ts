import type { ReactNode } from 'react';
import type { EventItem } from '../model/actions.js';

export type EventsMessages = {
  noEvents: string;
  details: (props: { event: EventItem }) => ReactNode;
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
};

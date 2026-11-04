import type { ReactNode } from 'react';
import type { EventItem } from '../model/actions.js';

export type EventsMessages = {
  noEvents: string;
  details: (props: { event: EventItem }) => ReactNode;
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  coverError: (props: { err: unknown }) => string;
  newMapError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
  participationError: (props: { err: unknown }) => string;
  loginToParticipate: string;
};

import type { ReactNode } from 'react';
import type { EventItem } from '../model/actions.js';

export type EventsMessages = {
  noEvents: string;
  // form
  event: string;
  eventHint: string;
  formDescription: string;
  startAt: string;
  endAt: string;
  startPoint: string;
  takeFromRouteStart: string;
  pickOnMap: string;
  pickStartPrompt: string;
  visibility: string;
  visibilityPublic: string;
  visibilityUnlisted: string;
  // selection
  details: (props: { event: EventItem }) => ReactNode;
  open: string;
  backToEvents: string;
  // errors
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
};

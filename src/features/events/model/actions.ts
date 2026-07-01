import { createAction } from '@reduxjs/toolkit';
import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

export const EventPointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export type EventPoint = z.infer<typeof EventPointSchema>;

export const EventVisibilitySchema = z.enum(['public', 'unlisted']);

export type EventVisibility = z.infer<typeof EventVisibilitySchema>;

/** A single event as returned by the API. */
export const EventSchema = z.object({
  id: z.string(),
  ownerId: z.number(),
  mapId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startAt: IsoDateSchema,
  endAt: IsoDateSchema.nullable(),
  startPoint: EventPointSchema.nullable(),
  filterLocation: EventPointSchema.nullable(),
  visibility: EventVisibilitySchema,
  activityType: z.string().nullable(),
  difficulty: z.string().nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  canWrite: z.boolean(),
});

export type EventItem = z.infer<typeof EventSchema>;

/**
 * Panel/layer filter. `inMapArea` restricts the listing to the current map
 * viewport (bbox derived at fetch time); `activityType` is a reserved
 * placeholder that isn't sent to the server yet.
 */
export interface EventsFilter {
  from?: Date;
  to?: Date;
  inMapArea?: boolean;
  activityType?: string;
}

/**
 * Where the event's referenced saved map comes from: an existing "My maps"
 * entry, or a new saved map published from the current app state.
 */
export type EventSaveSource =
  | { type: 'map'; mapId: string }
  | { type: 'current'; name: string };

export interface EventSavePayload {
  /** Present when editing an existing event. */
  id?: string;
  source: EventSaveSource;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  startPoint?: EventPoint | null;
  filterLocation?: EventPoint | null;
  visibility: EventVisibility;
}

export const eventsSetList = createAction<EventItem[]>('EVENTS_SET_LIST');

export const eventsLoadList = createAction('EVENTS_LOAD_LIST');

export const eventsSetFilter = createAction<EventsFilter>('EVENTS_SET_FILTER');

export const eventsSave = createAction<EventSavePayload>('EVENTS_SAVE');

export const eventsDelete = createAction<string>('EVENTS_DELETE');

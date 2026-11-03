import { createAction } from '@reduxjs/toolkit';
import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';

/** Map overlay-layer code for the events markers layer. */
export const EVENTS_LAYER = 'A';

export const EventPointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export type EventPoint = z.infer<typeof EventPointSchema>;

export const EventVisibilitySchema = z.enum(['public', 'unlisted']);

export type EventVisibility = z.infer<typeof EventVisibilitySchema>;

/** What a map gains by being an event; at most one per map. */
export const MapEventSchema = z.object({
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
});

export type MapEvent = z.infer<typeof MapEventSchema>;

/** A listed event: its map, titled by the map's name. */
export const EventSchema = z.object({
  ...MapEventSchema.shape,
  mapId: z.string(),
  name: z.string().nullable(),
  userId: z.number(),
  canWrite: z.boolean(),
});

export type EventItem = z.infer<typeof EventSchema>;

/**
 * The layer's filter. `inMapArea` restricts the listing to the current map
 * viewport (bbox derived at fetch time); `activityType` is reserved and isn't
 * sent to the server yet.
 */
export interface EventsFilter {
  from?: Date;
  to?: Date;
  inMapArea?: boolean;
  activityType?: string;
}

export interface EventSavePayload {
  mapId: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  startPoint: EventPoint;
  filterLocation: EventPoint | null;
  visibility: EventVisibility;
}

export const eventsSetList = createAction<EventItem[]>('EVENTS_SET_LIST');

export const eventsLoadList = createAction('EVENTS_LOAD_LIST');

export const eventsSetFilter = createAction<EventsFilter>('EVENTS_SET_FILTER');

/** Makes a map an event, or replaces its event. */
export const eventsSave = createAction<EventSavePayload>('EVENTS_SAVE');

/** Stops the map with this id being an event. */
export const eventsDelete = createAction<string>('EVENTS_DELETE');

/** The selected event, as its details show it; `null` while none is. */
export const eventsSetSelected = createAction<EventItem | null>(
  'EVENTS_SET_SELECTED',
);

/** Loads an event's map, appended to what is on the map or replacing it. */
export const eventsOpen = createAction<{ mapId: string; merge: boolean }>(
  'EVENTS_OPEN',
);

/** The opened map has loaded, or failed to. */
export const eventsOpenDone = createAction('EVENTS_OPEN_DONE');

/** Takes the next map click as the start point of the event being edited. */
export const eventsSetPickingStart = createAction<boolean>(
  'EVENTS_SET_PICKING_START',
);

/** The start point clicked on the map, for the form to take; `null` once taken. */
export const eventsStartPicked = createAction<EventPoint | null>(
  'EVENTS_START_PICKED',
);

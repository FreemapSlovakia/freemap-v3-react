import { createAction } from '@reduxjs/toolkit';
import { IsoDateSchema } from '@shared/types/common.js';
import z from 'zod';
import type { EventsColorizeBy } from './colorize.js';
import type { EventsFilter } from './filter.js';

/** Map overlay-layer code for the events markers layer. */
export const EVENTS_LAYER = 'A';

export const EventPointSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

export type EventPoint = z.infer<typeof EventPointSchema>;

export const EventVisibilitySchema = z.enum(['public', 'unlisted']);

export type EventVisibility = z.infer<typeof EventVisibilitySchema>;

/** A trip's stats; meters and seconds. */
export const TripStatsShape = {
  /** Kinds the trip suits (see `transports.ts`); empty where unsaid. */
  transports: z.array(z.string()),
  distance: z.number().nullable(),
  duration: z.number().nullable(),
  ascent: z.number().nullable(),
  descent: z.number().nullable(),
};

export type TripStats = {
  [K in keyof typeof TripStatsShape]: z.infer<(typeof TripStatsShape)[K]>;
};

export const DIFFICULTIES = [
  'easy',
  'moderate',
  'demanding',
  'expert',
] as const;

export const DifficultySchema = z.enum(DIFFICULTIES);

export type Difficulty = z.infer<typeof DifficultySchema>;

/** Who and what the trip suits; null where the organizer didn't say. */
export const AttributesShape = {
  difficulty: DifficultySchema.nullable(),
  dogs: z.boolean().nullable(),
  children: z.boolean().nullable(),
};

export type Attributes = {
  [K in keyof typeof AttributesShape]: z.infer<(typeof AttributesShape)[K]>;
};

export const EventSchema = z.object({
  id: z.string(),
  userId: z.number(),
  /** The organizer, as `UserChip` shows a user. */
  user: z.object({
    id: z.number(),
    name: z.string(),
    hasPicture: z.boolean(),
    premium: z.boolean(),
  }),
  mapId: z.string().nullable(),
  mapName: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startAt: IsoDateSchema,
  endAt: IsoDateSchema.nullable(),
  startPoint: EventPointSchema,
  visibility: EventVisibilitySchema,
  /** The cover image's name; see {@link coverUrl}. */
  cover: z.string().nullable(),
  ...TripStatsShape,
  ...AttributesShape,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  canWrite: z.boolean(),
  interestedCount: z.number(),
  goingCount: z.number(),
  /** The user's own; null when logged out or undecided. */
  myParticipation: z.enum(['interested', 'going']).nullable(),
});

export type EventItem = z.infer<typeof EventSchema>;

export const coverUrl = (name: string, size: 'large' | 'thumb') =>
  `${process.env['API_URL']}/events/covers/${encodeURIComponent(name)}${size === 'thumb' ? '?size=thumb' : ''}`;

/** What the event form sends; dates as ISO strings. */
export type EventBody = TripStats &
  Attributes & {
    /** Another owner than the user, which only an eventManager may set. */
    userId?: number;
    mapId: string | null;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    startPoint: EventPoint;
    visibility: EventVisibility;
  };

export const eventsSetList = createAction<EventItem[]>('EVENTS_SET_LIST');

export const eventsLoadList = createAction('EVENTS_LOAD_LIST');

export const eventsSetFilter = createAction<EventsFilter>('EVENTS_SET_FILTER');

/**
 * Creates an event, or with `id` updates it; `cover` replaces its cover image,
 * or `null` removes it. `newMap` first saves what is on the map as a new map,
 * named `newMap`, and links that.
 */
export const eventsSave = createAction<{
  id?: string;
  body: EventBody;
  cover?: File | null;
  newMap?: string;
}>('EVENTS_SAVE');

/** The save request settled; the form is released either way. */
export const eventsSaveDone = createAction<{ ok: boolean }>('EVENTS_SAVE_DONE');

export const eventsDelete = createAction<string>('EVENTS_DELETE');

export type Participation = EventItem['myParticipation'];

/** Says the user is interested in or going to an event, or with `null` neither. */
export const eventsSetParticipation = createAction<{
  id: string;
  status: Participation;
}>('EVENTS_SET_PARTICIPATION');

/** The selected event, as its details show it; `null` while none is. */
export const eventsSetSelected = createAction<EventItem | null>(
  'EVENTS_SET_SELECTED',
);

/** Loads an event's linked map into the user's own, appended or replacing it. */
export const eventsOpen = createAction<{
  id: string;
  mapId: string;
  merge: boolean;
}>('EVENTS_OPEN');

/** The opened map has loaded, or failed to. */
export const eventsOpenDone = createAction('EVENTS_OPEN_DONE');

/** Takes the next map click as the start point of the event being edited. */
export const eventsSetPickingStart = createAction<boolean>(
  'EVENTS_SET_PICKING_START',
);

/** Where the start point is being placed, by a click or by dragging it. */
export const eventsSetPickPosition = createAction<EventPoint | null>(
  'EVENTS_SET_PICK_POSITION',
);

/** Km of the circle around the point being picked; set before picking a place to filter by. */
export const eventsSetPickRadius = createAction<number | null>(
  'EVENTS_SET_PICK_RADIUS',
);

/** Ends picking, handing the placed point to the form. */
export const eventsConfirmPick = createAction('EVENTS_CONFIRM_PICK');

/** The start point picked on the map, for the form to take; `null` once taken. */
export const eventsStartPicked = createAction<EventPoint | null>(
  'EVENTS_START_PICKED',
);

export const eventsColorizeBy = createAction<EventsColorizeBy | null>(
  'EVENTS_COLORIZE_BY',
);

/** Shows or hides the colorize legend; toggles without a payload. */
export const eventsToggleLegend = createAction<boolean | undefined>(
  'EVENTS_TOGGLE_LEGEND',
);

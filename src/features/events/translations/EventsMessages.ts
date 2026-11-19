import type { ReactNode } from 'react';
import type { Difficulty } from '../model/actions.js';
import type { EventsColorizeBy, MineCategory } from '../model/colorize.js';
import type { Within } from '../model/filter.js';
import type { EventsListSort, EventsNearSort } from '../model/listSort.js';

export type EventsMessages = {
  noEvents: string;
  /** The open map's toolbar: the events linking it. */
  mapEvents: string;
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  coverError: (props: { err: unknown }) => string;
  newMapError: (props: { err: unknown }) => string;
  replaceMapError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
  participationError: (props: { err: unknown }) => string;
  savedFilterError: (props: { err: unknown }) => string;
  /** The API's limit on saved filters is reached. */
  savedFiltersFull: (props: { err: unknown }) => string;
  loginToParticipate: string;
  difficulty: Record<Difficulty, string>;
  /** An optional choice left unanswered. */
  notSaid: string;
  any: string;
  form: {
    newEvent: string;
    editEvent: string;
    organizer: string;
    organizerPlaceholder: string;
    organizerHint: string;
    onlyOrganizer: string;
    unavailable: string;
    title: string;
    description: string;
    contactHint: string;
    cover: string;
    coverTooLarge: string;
    start: string;
    end: string;
    endHint: string;
    endBeforeStart: string;
    dateOnly: string;
    linkedMap: string;
    noMap: string;
    newMapFromContent: string;
    /** Overwrites the event's own map with what is on the map. */
    replaceMapFromContent: string;
    noTripStats: string;
    unsavedTitle: string;
    unsavedMessage: (props: { name: string }) => string;
    saveOpenMap: (props: { name: string }) => string;
    newMap: string;
    startPoint: string;
    setLocation: string;
    transport: string;
    difficulty: string;
    dogs: string;
    dogsWelcome: string;
    dogsNotAllowed: string;
    children: string;
    childrenSuitable: string;
    childrenNotSuitable: string;
    length: string;
    duration: string;
    ascent: string;
    descent: string;
  };
  filter: {
    title: string;
    date: string;
    dateHint: string;
    /** `dates` picks fixed dates; the rest are "within the next …". */
    periods: Record<'dates' | Within, string>;
    near: string;
    anywhere: string;
    within: string;
    myLocation: string;
    dogsWelcome: string;
    childrenSuitable: string;
    from: string;
    to: string;
    unsaid: string;
    unsaidHint: string;
    /** Whether the events are imported from calendars or entered here. */
    origin: string;
    originHint: string;
    own: string;
    imported: string;
  };
  savedFilters: {
    /** The select: don't save, save a new one, or edit one. */
    savedFilter: string;
    dontSave: string;
    newFilter: string;
    name: string;
    notify: string;
    saveAndApply: string;
    /** With fixed dates: those are not saved. */
    datesWarning: string;
    delete: string;
    deleteTitle: string;
    deleteMessage: (props: { name: string }) => string;
  };
  /** What the details show. */
  card: {
    dogsWelcome: string;
    noDogs: string;
    children: string;
    noChildren: string;
    /** Under the participation buttons of an imported event; `source` is its calendar's name, styled. */
    importedNote: (props: { source: ReactNode }) => ReactNode;
  };
  /** The layer's event list in the map layers panel. */
  list: {
    search: string;
    /** The checkbox keeping the list to the map's view. */
    inView: string;
    noMatch: string;
    sorts: Record<EventsListSort, string>;
    /** The header's dropdown of what each row shows. */
    show: string;
    /** Names the distance a row shows under a distance sort. */
    distanceFrom: Record<EventsNearSort, string>;
    /** Those who said they are interested in / going to an event, as counted. */
    interestedCount: string;
    goingCount: string;
  };
  selection: {
    discussion: string;
    backToEvents: string;
    interested: string;
    going: string;
    openInNewTab: string;
    loadHere: string;
    deleteTitle: string;
    deleteMessage: (props: { title: string }) => string;
  };
  picking: {
    startPoint: string;
    place: string;
  };
  menu: {
    filter: string;
    clearFilter: string;
    newEvent: string;
  };
  colorize: {
    by: string;
    none: string;
    legend: string;
    modes: Record<EventsColorizeBy, string>;
    ended: string;
    happening: string;
    /** The when scale's unit. */
    days: string;
    mine: Record<MineCategory, string>;
    /** An event naming more than one transport. */
    several: string;
    yes: string;
    no: string;
  };
};

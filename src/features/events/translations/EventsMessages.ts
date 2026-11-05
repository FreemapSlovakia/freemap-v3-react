import type { Difficulty } from '../model/actions.js';
import type { EventsColorizeBy, MineCategory } from '../model/colorize.js';

export type EventsMessages = {
  noEvents: string;
  fetchListError: (props: { err: unknown }) => string;
  saveError: (props: { err: unknown }) => string;
  coverError: (props: { err: unknown }) => string;
  newMapError: (props: { err: unknown }) => string;
  deleteError: (props: { err: unknown }) => string;
  participationError: (props: { err: unknown }) => string;
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
    linkedMap: string;
    noMap: string;
    newMapFromContent: string;
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
    visibility: string;
    public: string;
    unlisted: string;
  };
  filter: {
    title: string;
    date: string;
    dateHint: string;
    near: string;
    anywhere: string;
    within: string;
    myLocation: string;
    homePosition: string;
    dogsWelcome: string;
    childrenSuitable: string;
    from: string;
    to: string;
    unsaid: string;
    unsaidHint: string;
  };
  /** What the details show. */
  card: {
    unlisted: string;
    dogsWelcome: string;
    noDogs: string;
    children: string;
    noChildren: string;
  };
  selection: {
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

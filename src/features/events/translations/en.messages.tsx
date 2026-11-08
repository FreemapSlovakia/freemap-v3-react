import { getMessages } from '@features/l10n/messagesStore.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const en: EventsMessages = {
  noEvents: 'No events found',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Error loading events', err),
  saveError: ({ err }) => addError(getMessages()!, 'Error saving event', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'The event is saved, but not its cover image',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Error saving the new map, so the event is not saved either',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Error deleting event', err),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Error saving your participation', err),
  loginToParticipate: 'Log in to say you are interested or going.',
  difficulty: {
    easy: 'Easy',
    moderate: 'Moderate',
    demanding: 'Demanding',
    expert: 'Expert',
  },
  notSaid: 'Not said',
  any: 'Any',
  form: {
    newEvent: 'New event',
    editEvent: 'Edit event',
    organizer: 'Organizer',
    organizerPlaceholder: 'You — or type a user’s name',
    organizerHint:
      'Enter the event for its organizer: an existing account, or a new name, which becomes an organizer without a login.',
    onlyOrganizer: 'Only the event’s organizer can change it.',
    unavailable: 'This event can’t be loaded — it may have been deleted.',
    title: 'Title',
    description: 'Description',
    contactHint:
      'Say how to reach you — a phone number, an email or a chat group: events have no discussion yet.',
    cover: 'Cover image',
    coverTooLarge: 'The image is larger than 20 MB.',
    start: 'Start',
    end: 'End',
    endHint: 'No end means until the end of the day.',
    endBeforeStart: 'The end is before the start.',
    dateOnly: 'Dates only, no time',
    linkedMap: 'Linked map',
    noMap: 'None',
    newMapFromContent: 'New map from the current content',
    noTripStats: 'The map has no route or lines to take trip stats from.',
    unsavedTitle: 'Unsaved changes',
    unsavedMessage: ({ name }) =>
      `The open map “${name}” has unsaved changes. Save them and link it, or save the content as a new map?`,
    saveOpenMap: ({ name }) => `Save “${name}”`,
    newMap: 'New map',
    startPoint: 'Start point',
    setLocation: 'Set the location',
    transport: 'Transport',
    difficulty: 'Difficulty',
    dogs: 'Dogs',
    dogsWelcome: 'Welcome',
    dogsNotAllowed: 'Not allowed',
    children: 'Children',
    childrenSuitable: 'Suitable',
    childrenNotSuitable: 'Not suitable',
    length: 'Length',
    duration: 'Duration',
    ascent: 'Ascent',
    descent: 'Descent',
    visibility: 'Visibility',
    public: 'Public',
    unlisted: 'Unlisted (only by its link)',
  },
  filter: {
    title: 'Events filter',
    date: 'Date',
    dateHint:
      'Without a start date, only events that haven’t ended yet are shown.',
    near: 'Near',
    anywhere: 'Anywhere',
    within: 'within',
    myLocation: 'My location',
    homePosition: 'Home position',
    dogsWelcome: 'Dogs welcome',
    childrenSuitable: 'Suitable for children',
    from: 'from',
    to: 'to',
    unsaid: 'Include events that don’t say',
    unsaidHint:
      'Transport, difficulty, length, duration and ascent: events that leave them out are shown too.',
    origin: 'Origin',
    originHint:
      'Imported events are taken over automatically from the calendars of organizations such as hiking clubs. Their organizers don’t follow them here; for details and changes, see the source linked in the description. Events entered here are added by their organizers themselves.',
    own: 'Entered here',
    imported: 'Imported',
  },
  card: {
    unlisted: 'Unlisted',
    dogsWelcome: 'Dogs welcome',
    noDogs: 'No dogs',
    children: 'Suitable for children',
    noChildren: 'Not for children',
    importedNote: ({ source }) => (
      <>
        This event is imported from the {source} calendar; neither its organizer
        nor most of its participants follow it here.
      </>
    ),
  },
  list: {
    search: 'Search in titles',
    inView: 'Only those in the current view',
    noMatch: 'No event matches the criteria.',
    sorts: {
      date: 'By date',
      title: 'By title',
      lengthAsc: 'Shortest first',
      lengthDesc: 'Longest first',
      ascentAsc: 'Least ascent first',
      ascentDesc: 'Most ascent first',
      durationAsc: 'Shortest duration first',
      durationDesc: 'Longest duration first',
      nearMap: 'Nearest to the map center',
      nearHome: 'Nearest to home',
      nearPlace: 'Nearest to the filter’s place',
    },
    show: 'Shown in rows',
    distanceFrom: {
      nearMap: 'Distance from the map center',
      nearHome: 'Distance from home',
      nearPlace: 'Distance from the filter’s place',
    },
  },
  selection: {
    backToEvents: 'Back to events',
    interested: 'Interested',
    going: 'Going',
    openInNewTab: 'Open in new tab',
    loadHere: 'Load here',
    deleteTitle: 'Delete event',
    deleteMessage: ({ title }) =>
      `Delete event “${title}”? Its linked map stays.`,
  },
  picking: {
    startPoint: 'Select start point',
    place: 'Select place',
  },
  menu: {
    filter: 'Filter',
    newEvent: 'New event',
  },
  colorize: {
    by: 'Colorize by',
    none: 'None',
    legend: 'Legend',
    modes: {
      when: 'When',
      mine: 'Mine and others',
      transport: 'Transport',
      distance: 'Length',
      duration: 'Duration',
      ascent: 'Ascent',
      difficulty: 'Difficulty',
      dogs: 'Dogs',
      children: 'Children',
    },
    ended: 'Ended',
    happening: 'Happening',
    several: 'Several',
    days: 'days',
    mine: {
      mine: 'Mine',
      going: 'Going',
      interested: 'Interested',
      others: 'Others',
    },
    yes: 'Yes',
    no: 'No',
  },
};

export default en;

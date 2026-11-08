import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const de: DeepPartialWithRequiredObjects<EventsMessages> = {
  noEvents: 'Keine Veranstaltungen gefunden',
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Laden der Veranstaltungen', err),
  saveError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern der Veranstaltung', err),
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'Die Veranstaltung ist gespeichert, ihr Titelbild jedoch nicht',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Fehler beim Speichern der neuen Karte, daher ist auch die Veranstaltung nicht gespeichert',
      err,
    ),
  deleteError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Löschen der Veranstaltung', err),
  participationError: ({ err }) =>
    addError(getMessages()!, 'Fehler beim Speichern Ihrer Teilnahme', err),
  loginToParticipate:
    'Melden Sie sich an, um Interesse oder Ihre Teilnahme anzugeben.',
  difficulty: {
    easy: 'Leicht',
    moderate: 'Mittel',
    demanding: 'Anspruchsvoll',
    expert: 'Für Experten',
  },
  notSaid: 'Keine Angabe',
  any: 'Beliebig',
  form: {
    newEvent: 'Neue Veranstaltung',
    editEvent: 'Veranstaltung bearbeiten',
    organizer: 'Veranstalter',
    organizerPlaceholder: 'Sie — oder Name eines Benutzers eingeben',
    organizerHint:
      'Die Veranstaltung wird für ihren Veranstalter eingetragen: ein bestehendes Konto oder ein neuer Name, aus dem ein Veranstalter ohne Anmeldung entsteht.',
    onlyOrganizer: 'Nur der Veranstalter kann die Veranstaltung ändern.',
    unavailable:
      'Die Veranstaltung kann nicht geladen werden — möglicherweise wurde sie gelöscht.',
    title: 'Titel',
    description: 'Beschreibung',
    contactHint:
      'Geben Sie an, wie Sie erreichbar sind — Telefonnummer, E-Mail oder Chatgruppe: Veranstaltungen haben noch keine Diskussion.',
    cover: 'Titelbild',
    coverTooLarge: 'Das Bild ist größer als 20 MB.',
    start: 'Beginn',
    end: 'Ende',
    linkedMap: 'Verknüpfte Karte',
    noMap: 'Keine',
    newMapFromContent: 'Neue Karte aus dem aktuellen Inhalt',
    noTripStats:
      'Die Karte enthält keine Route und keine Linien, aus denen sich Tourdaten ermitteln lassen.',
    unsavedTitle: 'Nicht gespeicherte Änderungen',
    unsavedMessage: ({ name }) =>
      `Die geöffnete Karte „${name}“ hat nicht gespeicherte Änderungen. Diese speichern und die Karte verknüpfen oder den Inhalt als neue Karte speichern?`,
    saveOpenMap: ({ name }) => `„${name}“ speichern`,
    newMap: 'Neue Karte',
    startPoint: 'Startpunkt',
    setLocation: 'Ort festlegen',
    transport: 'Anreise',
    difficulty: 'Schwierigkeit',
    dogs: 'Hunde',
    dogsWelcome: 'Willkommen',
    dogsNotAllowed: 'Nicht erlaubt',
    children: 'Kinder',
    childrenSuitable: 'Geeignet',
    childrenNotSuitable: 'Nicht geeignet',
    length: 'Länge',
    duration: 'Dauer',
    ascent: 'Anstieg',
    descent: 'Abstieg',
    visibility: 'Sichtbarkeit',
    public: 'Öffentlich',
    unlisted: 'Nicht gelistet (nur über den Link)',
  },
  filter: {
    title: 'Veranstaltungsfilter',
    date: 'Datum',
    dateHint:
      'Ohne Startdatum werden nur Veranstaltungen angezeigt, die noch nicht zu Ende sind.',
    near: 'In der Nähe von',
    anywhere: 'Überall',
    within: 'im Umkreis von',
    myLocation: 'Mein Standort',
    homePosition: 'Heimatposition',
    dogsWelcome: 'Hunde willkommen',
    childrenSuitable: 'Für Kinder geeignet',
    from: 'von',
    to: 'bis',
    unsaid: 'Auch Veranstaltungen ohne Angabe',
    unsaidHint:
      'Anreise, Schwierigkeit, Länge, Dauer und Anstieg: Veranstaltungen ohne diese Angaben werden ebenfalls angezeigt.',
    origin: 'Herkunft',
    originHint:
      'Übernommene Veranstaltungen werden automatisch aus den Kalendern von Organisationen wie Wandervereinen übernommen. Ihre Veranstalter verfolgen sie hier nicht; Einzelheiten und Änderungen finden Sie in der in der Beschreibung genannten Quelle. Hier eingetragene Veranstaltungen fügen ihre Veranstalter selbst hinzu.',
    own: 'Hier eingetragen',
    imported: 'Übernommen',
  },
  card: {
    unlisted: 'Nicht gelistet',
    dogsWelcome: 'Hunde willkommen',
    noDogs: 'Keine Hunde',
    children: 'Für Kinder geeignet',
    noChildren: 'Nicht für Kinder',
    importedNote: ({ source }) => (
      <>
        Diese Veranstaltung stammt aus dem Kalender von {source}; weder ihr
        Veranstalter noch die meisten Teilnehmenden verfolgen sie hier.
      </>
    ),
  },
  list: {
    search: 'In Titeln suchen',
    inView: 'Nur im aktuellen Kartenausschnitt',
    noMatch: 'Keine Veranstaltung passt.',
    sorts: {
      date: 'Nach Datum',
      title: 'Nach Titel',
      lengthAsc: 'Kürzeste zuerst',
      lengthDesc: 'Längste zuerst',
      ascentAsc: 'Geringster Anstieg zuerst',
      ascentDesc: 'Größter Anstieg zuerst',
      nearMap: 'Nächste zur Kartenmitte',
      nearHome: 'Nächste zum Zuhause',
      nearPlace: 'Nächste zum Ort im Filter',
    },
  },
  selection: {
    backToEvents: 'Zurück zu den Veranstaltungen',
    interested: 'Interessiert',
    going: 'Dabei',
    openInNewTab: 'In neuem Tab öffnen',
    loadHere: 'Hier laden',
    deleteTitle: 'Veranstaltung löschen',
    deleteMessage: ({ title }) =>
      `Veranstaltung „${title}“ löschen? Die verknüpfte Karte bleibt erhalten.`,
  },
  picking: {
    startPoint: 'Startpunkt auswählen',
    place: 'Ort auswählen',
  },
  menu: {
    filter: 'Filter',
    newEvent: 'Neue Veranstaltung',
  },
  colorize: {
    by: 'Einfärben nach',
    none: 'Keine',
    legend: 'Legende',
    modes: {
      when: 'Termin',
      mine: 'Meine und andere',
      transport: 'Anreise',
      distance: 'Länge',
      duration: 'Dauer',
      ascent: 'Anstieg',
      difficulty: 'Schwierigkeit',
      dogs: 'Hunde',
      children: 'Kinder',
    },
    ended: 'Beendet',
    happening: 'Läuft',
    several: 'Mehrere',
    days: 'Tage',
    mine: {
      mine: 'Meine',
      going: 'Dabei',
      interested: 'Interessiert',
      others: 'Andere',
    },
    yes: 'Ja',
    no: 'Nein',
  },
};

export default de;

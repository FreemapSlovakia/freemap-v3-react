import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { EventsMessages } from './EventsMessages.js';

const it: DeepPartialWithRequiredObjects<EventsMessages> = {
  fetchListError: ({ err }) =>
    addError(getMessages()!, 'Errore durante il caricamento degli eventi', err),
  saveError: ({ err }) =>
    addError(getMessages()!, "Errore durante il salvataggio dell'evento", err),
  deleteError: ({ err }) =>
    addError(getMessages()!, "Errore durante l'eliminazione dell'evento", err),
  difficulty: {
    easy: 'Facile',
    moderate: 'Media',
    demanding: 'Impegnativa',
    expert: 'Per esperti',
  },
  form: {
    newEvent: 'Nuovo evento',
    editEvent: 'Modifica evento',
    organizer: 'Organizzatore',
    organizerPlaceholder: 'Lei — oppure scriva il nome di un utente',
    organizerHint:
      'L’evento viene inserito a nome del suo organizzatore: un account esistente oppure un nome nuovo, che diventa un organizzatore senza accesso.',
    onlyOrganizer: 'Solo l’organizzatore dell’evento può modificarlo.',
    unavailable:
      'Impossibile caricare questo evento — potrebbe essere stato eliminato.',
    title: 'Titolo',
    description: 'Descrizione',
    contactHint:
      'Indichi come essere contattati — un numero di telefono, un’e-mail o un gruppo di chat: gli eventi non hanno ancora una discussione.',
    cover: 'Immagine di copertina',
    coverTooLarge: 'L’immagine supera i 20 MB.',
    start: 'Inizio',
    end: 'Fine',
    linkedMap: 'Mappa collegata',
    noMap: 'Nessuna',
    newMapFromContent: 'Nuova mappa dal contenuto attuale',
    noTripStats:
      'La mappa non ha un percorso né linee da cui ricavare i dati dell’escursione.',
    unsavedTitle: 'Modifiche non salvate',
    unsavedMessage: ({ name }) =>
      `La mappa aperta «${name}» ha modifiche non salvate. Salvarle e collegarla, oppure salvare il contenuto come nuova mappa?`,
    saveOpenMap: ({ name }) => `Salva «${name}»`,
    newMap: 'Nuova mappa',
    startPoint: 'Punto di partenza',
    setLocation: 'Imposta la posizione',
    transport: 'Mezzo',
    difficulty: 'Difficoltà',
    dogs: 'Cani',
    dogsWelcome: 'Benvenuti',
    dogsNotAllowed: 'Non ammessi',
    children: 'Bambini',
    childrenSuitable: 'Adatto',
    childrenNotSuitable: 'Non adatto',
    length: 'Lunghezza',
    duration: 'Durata',
    ascent: 'Salita',
    descent: 'Discesa',
    visibility: 'Visibilità',
    public: 'Pubblico',
    unlisted: 'Non elencato (solo tramite link)',
  },
  filter: {
    title: 'Filtro eventi',
    date: 'Data',
    dateHint:
      'Senza una data di inizio vengono mostrati solo gli eventi non ancora terminati.',
    near: 'Vicino a',
    anywhere: 'Ovunque',
    within: 'entro',
    myLocation: 'La mia posizione',
    homePosition: 'Posizione di casa',
    dogsWelcome: 'Cani benvenuti',
    childrenSuitable: 'Adatto ai bambini',
    from: 'da',
    to: 'a',
    unsaid: 'Includi gli eventi che non lo indicano',
    unsaidHint:
      'Mezzo, difficoltà, lunghezza, durata e salita: vengono mostrati anche gli eventi che non li indicano.',
    origin: 'Origine',
    originHint:
      'Gli eventi importati vengono ripresi automaticamente dai calendari di organizzazioni come i club escursionistici. I loro organizzatori non li seguono qui; per dettagli e modifiche consulti la fonte indicata nella descrizione. Gli eventi inseriti qui sono aggiunti dai loro stessi organizzatori.',
    own: 'Inseriti qui',
    imported: 'Importati',
  },
  card: {
    unlisted: 'Non elencato',
    dogsWelcome: 'Cani benvenuti',
    noDogs: 'Senza cani',
    children: 'Adatto ai bambini',
    noChildren: 'Non adatto ai bambini',
    importedNote: ({ source }) => (
      <>
        Questo evento è importato dal calendario di {source}; né l’organizzatore
        né la maggior parte dei partecipanti lo seguono qui.
      </>
    ),
  },
  list: {
    search: 'Cerca nei titoli',
    inView: 'Solo nella vista attuale',
    noMatch: 'Nessun evento corrisponde.',
    sorts: {
      date: 'Per data',
      title: 'Per titolo',
      lengthAsc: 'Dal più corto',
      lengthDesc: 'Dal più lungo',
      ascentAsc: 'Dal dislivello minore',
      ascentDesc: 'Dal dislivello maggiore',
      nearMap: 'Più vicini al centro della mappa',
      nearHome: 'Più vicini a casa',
      nearPlace: 'Più vicini al luogo del filtro',
    },
  },
  selection: {
    backToEvents: 'Torna agli eventi',
    interested: 'Interessato',
    going: 'Partecipo',
    openInNewTab: 'Apri in una nuova scheda',
    loadHere: 'Carica qui',
    deleteTitle: 'Elimina evento',
    deleteMessage: ({ title }) =>
      `Eliminare l’evento «${title}»? La mappa collegata resta.`,
  },
  picking: {
    startPoint: 'Selezioni il punto di partenza',
    place: 'Selezioni il luogo',
  },
  menu: {
    filter: 'Filtro',
    newEvent: 'Nuovo evento',
  },
  colorize: {
    modes: {
      when: 'Data',
      mine: 'Miei e altri',
      transport: 'Mezzo',
      distance: 'Lunghezza',
      duration: 'Durata',
      ascent: 'Salita',
      difficulty: 'Difficoltà',
      dogs: 'Cani',
      children: 'Bambini',
    },
    mine: {
      mine: 'Miei',
      going: 'Partecipo',
      interested: 'Interessato',
      others: 'Altri',
    },
    by: 'Colora per',
    none: 'Nessuno',
    legend: 'Legenda',
    ended: 'Terminato',
    happening: 'In corso',
    several: 'Più mezzi',
    days: 'giorni',
    yes: 'Sì',
    no: 'No',
  },
  noEvents: 'Nessun evento trovato',
  coverError: ({ err }) =>
    addError(
      getMessages()!,
      'L’evento è stato salvato, ma non la sua immagine di copertina',
      err,
    ),
  newMapError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il salvataggio della nuova mappa, quindi neanche l’evento è stato salvato',
      err,
    ),
  participationError: ({ err }) =>
    addError(
      getMessages()!,
      'Errore durante il salvataggio della sua partecipazione',
      err,
    ),
  loginToParticipate:
    'Acceda per indicare che è interessato o che parteciperà.',
  notSaid: 'Non indicato',
  any: 'Qualsiasi',
};

export default it;

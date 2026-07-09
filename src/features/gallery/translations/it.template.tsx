import { getMessages } from '@features/l10n/messagesStore.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import type { GalleryMessages } from './GalleryMessages.js';

const it: DeepPartialWithRequiredObjects<GalleryMessages> = {
  sendGalleryEmails: 'Notifica i commenti alle foto via email',
  stats: {
    leaderboard: 'Classifica',
    country: 'Paese',
    perUserPerCountry: 'Foto per autore e paese',
    perUser: 'Foto per autore',
    more: 'Più',
    less: 'Meno',
    user: 'Autore',
    photos: 'Foto',
    numberOfPhotos: 'Numero di foto',
    timePeriod: 'Periodo di tempo',
    allTime: 'Sempre',
    last3months: 'Ultimi 3 mesi',
    last30days: 'Ultimi 30 giorni',
  },

  legend: 'Legenda',
  filter: 'Filtro',
  showPhotosFrom: 'Vedi le foto',
  showLayer: 'Mostra il livello',
  upload: 'Carica',

  f: {
    '-createdAt': 'dagli ultimi caricati',
    '-takenAt': 'dai più recenti',
    '-rating': 'dai più valutati',
    '-lastCommentedAt': "dall'ultimo commento",
  },

  colorizeBy: 'Colora in base',
  showDirection: 'Mostra la direzione dello scatto',

  c: {
    disable: 'Non colorare',
    mine: 'Diversi dai miei',
    userId: 'Autore',
    rating: 'Valutazioni',
    takenAt: 'Data scatto',
    createdAt: 'Data di caricamento',
    season: 'Stagione',
    premium: 'Premium',
    license: 'Licenza',
  },

  viewer: {
    title: 'Foto',
    comments: 'Commenti',
    newComment: 'Nuovo commento',
    addComment: 'Aggiungi',
    yourRating: 'La tua valutazione:',
    showOnTheMap: 'Mostra sulla mappa',
    openInNewWindow: 'Apri in…',
    uploaded: ({ username, createdAt }) => (
      <>
        Caricato da {username} il {createdAt}
      </>
    ),
    captured: (takenAt) => <>Captured on {takenAt}</>,
    deletePrompt: (title) =>
      title ? (
        <>
          Vuoi davvero eliminare la foto <i>{title}</i>?
        </>
      ) : (
        <>Vuoi davvero eliminare questa foto?</>
      ),
    deleteTitle: 'Eliminazione foto',
    modify: 'Modifica',
    premiumOnly:
      'Questa foto è stata resa disponibile dal suo autore solo agli utenti con accesso premium.',
    noComments: 'Nessun commento',
  },

  editForm: {
    name: 'Nome',
    description: 'Descrizione',
    takenAt: {
      datetime: 'Data e ora dello scatto',
      date: 'Data scatto',
      time: 'Orario scatto',
    },
    location: 'Luogo',
    azimuth: 'Azimut',
    tags: 'Tag',
    setLocation: 'Imposta il luogo',
  },

  uploadModal: {
    title: 'Carica foto',
    uploading: (n) => `Uploading (${n})`,
    upload: 'Carica',
    rules: `
      <p>Trascina qui le tue foto o clicca qui per selezionarle.</p>
      <ul>
        <li>Non caricare foto troppo piccole (diapositive). Le dimensioni massime non sono limitate. La dimensione massima del file è limitata a 10 MB. I file più grandi saranno respinti.</li>
        <li>Carica soltanto foto di panorami o di documentazione. I ritratti e le macro non sono accettate e saranno eliminate senza preavviso.</li>
        <li>Carica soltanto foto scattate da te e di tua proprietà.</li>
        <li>Didascalie o commenti che non si riferiscono direttamente al contenuto delle foto caricate o che contraddicono i principi generalmente accettati di convivenza civile verranno rimossi. I trasgressori di questa regola saranno avvisati e, in caso di ripetute violazioni, il loro account nell'applicazione potrebbe essere cancellato.</li>
        <li>Caricando le foto, accetti che esse saranno distribuite secondo i termini della licenza che scegli per ciascuna di esse (CC BY-SA 4.0 per impostazione predefinita).</li>
        <li>L'operatore (Freemap.sk) declina ogni responsabilità e non risponde per danni diretti o indiretti derivanti dalla pubblicazione di una foto in galleria. La persona che ha caricato l'immagine sul server è pienamente responsabile della foto.</li>
        <li>L'operatore si riserva il diritto di modificare la descrizione, il nome, la posizione e i tag della foto, o di eliminare la foto se il contenuto è inappropriato (in violazione di queste regole).</li>
        <li>L'operatore si riserva il diritto di eliminare l'account nel caso in cui l'utente violi ripetutamente la politica della galleria pubblicando contenuti inappropriati.</li>
      </ul>
    `,
    success: 'Le foto sono state caricate con successo.',
    showPreview:
      "Mostra automaticamente l'anteprima (aumenta il consumo di CPU e memoria)",
    premium: 'Disponibile solo per gli utenti con accesso completo',
    loadPreview: 'Carica anteprima',
  },
  license: {
    label: 'Licenza',
    chooseForAll: 'Imposta la licenza di tutte le mie foto',
    changeNote:
      "Il cambio di licenza vale solo per l'uso futuro; le copie ottenute in precedenza mantengono la licenza con cui sono state concesse.",
    since: 'Dal',
    names: {
      'CC0-1.0': 'CC0 1.0 (pubblico dominio)',
      'CC-BY-4.0': 'CC BY 4.0',
      'CC-BY-SA-4.0': 'CC BY-SA 4.0',
      'CC-BY-NC-4.0': 'CC BY-NC 4.0',
      'CC-BY-NC-SA-4.0': 'CC BY-NC-SA 4.0',
    },
    descriptions: {
      'CC0-1.0':
        'Rinunci a tutti i diritti e rilasci la foto nel pubblico dominio — chiunque può usarla per qualsiasi scopo senza attribuzione.',
      'CC-BY-4.0':
        "Altri possono condividere e modificare la foto, anche a fini commerciali, purché citino l'autore.",
      'CC-BY-SA-4.0':
        "Altri possono condividere e modificare la foto, anche a fini commerciali, purché citino l'autore e distribuiscano il proprio lavoro con la stessa licenza.",
      'CC-BY-NC-4.0':
        "Altri possono condividere e modificare la foto per scopi non commerciali, purché citino l'autore.",
      'CC-BY-NC-SA-4.0':
        "Altri possono condividere e modificare la foto per scopi non commerciali, purché citino l'autore e distribuiscano il proprio lavoro con la stessa licenza.",
    },
  },

  locationPicking: {
    title: "Selezione l'ubicazione della foto",
  },

  deletingError: ({ err }) =>
    addError(getMessages()!, 'Error deleting photo:', err),

  tagsFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching tags:', err),

  pictureFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching photo:', err),

  picturesFetchingError: ({ err }) =>
    addError(getMessages()!, 'Error fetching photos:', err),

  savingError: ({ err }) =>
    addError(getMessages()!, 'Error saving photo:', err),

  commentAddingError: ({ err }) =>
    addError(getMessages()!, 'Error adding comment:', err),

  ratingError: ({ err }) =>
    addError(getMessages()!, 'Error rating photo:', err),
  missingPositionError: 'Luogo mancante.',
  invalidPositionError: 'Formato coordinate di posizione non valide.',
  invalidTakenAt: 'Data e orario di scatto non valide.',

  filterModal: {
    title: 'Filtro foto',
    tag: 'Tag',
    createdAt: 'Data di caricamento',
    takenAt: 'Data di scatto',
    author: 'Autore',
    rating: 'Valutazione',
    noTags: 'no tag',
    pano: 'Panorama',
    premium: 'Premium',
  },

  noPicturesFound: 'Non è stata trovata nessuna foto in questo posto.',
  linkToWww: 'foto su www.freemap.sk',
  linkToImage: 'file immagine',

  allMyPhotos: {
    title: 'Modifica accesso',
    premium: 'Includi tutte le mie foto nei contenuti premium',
    free: 'Rendi tutte le mie foto accessibili a tutti',
    confirmPremium:
      'Includere tutte le tue foto nei contenuti premium? Solo gli utenti con accesso premium potranno vederle.',
    confirmFree: 'Rendere tutte le tue foto accessibili a tutti?',
    confirmLicense: (license) =>
      `Impostare la licenza di tutte le tue foto su ${license}? Le foto che usano già un'altra licenza saranno rilicenziate d'ora in poi.`,
  },

  recentTags: 'Tag recenti da assegnare:',
};

export default it;

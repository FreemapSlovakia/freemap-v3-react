import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const it: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Salva mappa per uso offline',
  modifyOfflineMap: 'Modifica mappa offline',
  toDownload: 'Da scaricare',
  addOfflineMap: 'Aggiungi mappa offline',
  emptyMessage:
    'Nessuna mappa offline ancora salvata. Aggiungine una per usare le mappe senza connessione a internet.',
  zoom: 'Zoom',
  tiles: 'Riquadri',
  size: 'Dimensione',
  ready: 'Pronta',
  incomplete: ({ pct }) => <>Incompleta ({pct} %)</>,
  resume: 'Riprendi',
  stop: 'Interrompi',
  total: 'Totale',
  largeDownload: ({ tiles, size }) => (
    <>
      Download grande: {tiles} riquadri (~{size}). Potrebbe richiedere un po' di
      tempo.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Spazio insufficiente: il download richiede circa {size}, ma in questo
      browser sono disponibili solo {free}. Si interromperebbe a metà.
    </>
  ),
  estSize: 'Dimensione stimata',
  startCaching: 'Avvia salvataggio',
  cachedSuccess: ({ name }) => `Mappa «${name}» salvata con successo.`,
  activate: 'Attiva',
  focus: 'Zooma sull’area',
  namePrefix: 'Offline',
  offlineWiden:
    'Senza connessione questa mappa può essere ridotta, ma non ingrandita — per ingrandirla servirebbe scaricare tasselli che non contiene.',
  premiumZoomHint:
    "I livelli di zoom più dettagliati di questo strato sono premium. Una mappa offline conserva le sue tessere per sempre e le mostra senza connessione, quindi scaricarli richiede l'accesso premium.",
  premiumWiden:
    'Questa mappa arriva a livelli di zoom premium. Senza accesso premium può essere ridotta, ma non ingrandita: ingrandirla scaricherebbe di nuovo tessere premium.',
  premiumSkipped:
    'I livelli di zoom più dettagliati di questa mappa sono premium e non sono stati scaricati, perciò resta contrassegnata come incompleta.',
  networkFallback: 'Scarica da internet i tasselli mancanti',
  networkFallbackHint:
    "Attivo: spostandosi fuori dall'area scaricata o ingrandendo di più vengono mostrati i tasselli dal vivo, finché c'è connessione a internet. Disattivo: la mappa mostra solo ciò che è stato scaricato.",
  deleteTitle: 'Elimina mappa offline',
  deleteConfirm: ({ name }) => (
    <>
      Eliminare davvero la mappa offline <b>{name}</b> con tutti i suoi
      tasselli?
    </>
  ),
  browse: {
    intro:
      'I tasselli incontrati sulla mappa possono essere conservati per dopo, così le aree già visitate si caricano senza internet. Vale per tutti i livelli a tasselli ed è indipendente dalle mappe offline scaricate.',
    mode: 'Origine dei tasselli',
    modes: {
      networkOnly: 'Solo internet',
      networkFirst: 'Internet, poi cache',
      cacheFirst: 'Cache, poi internet',
      cacheOnly: 'Solo cache',
    },
    store: 'Salva i tasselli scaricati da internet',
    maxAge: 'Conserva i tasselli per',
    maxSize: 'Limite di dimensione',
    days: ({ days }) => <>{days} giorni</>,
    keepForever: "Finché c'è spazio",
    noSizeLimit: 'Nessun limite',
    retentionHint:
      'I tasselli scaduti vengono eliminati e, oltre il limite di dimensione, se ne vanno per primi quelli mostrati meno di recente.',
    cached: ({ tiles, size }) => (
      <>
        In cache: <strong>{tiles}</strong> tasselli ({size})
      </>
    ),
    clear: 'Svuota la cache',
    clearConfirm:
      'Eliminare davvero tutti i tasselli conservati durante la navigazione? Le impostazioni restano.',
  },
};

export default it;

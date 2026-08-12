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
};

export default it;

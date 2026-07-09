import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const it: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Salva mappa per uso offline',
  addOfflineMap: 'Aggiungi mappa offline',
  emptyMessage:
    'Nessuna mappa offline ancora salvata. Aggiungine una per usare le mappe senza connessione a internet.',
  zoom: 'Zoom',
  tiles: 'Riquadri',
  size: 'Dimensione',
  ready: 'Pronta',
  incomplete: ({ pct }) => <>Incompleta ({pct} %)</>,
  pause: 'Pausa',
  resume: 'Riprendi',
  total: 'Totale',
  largeDownload: ({ tiles, size }) => (
    <>
      Download grande: {tiles} riquadri (~{size}). Potrebbe richiedere un po' di
      tempo.
    </>
  ),
  estSize: 'Dimensione stimata',
  startCaching: 'Avvia salvataggio',
  cachedSuccess: ({ name }) => `Mappa «${name}» salvata con successo.`,
  activate: 'Attiva',
  namePrefix: 'Offline',
};

export default it;

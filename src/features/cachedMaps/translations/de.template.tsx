import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const de: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Karte für Offline-Nutzung speichern',
  addOfflineMap: 'Offline-Karte hinzufügen',
  emptyMessage:
    'Noch keine Offline-Karten gespeichert. Fügen Sie eine hinzu, um Karten ohne Internetverbindung zu nutzen.',
  zoom: 'Zoom',
  tiles: 'Kacheln',
  size: 'Größe',
  ready: 'Bereit',
  incomplete: ({ pct }) => <>Unvollständig ({pct} %)</>,
  pause: 'Pausieren',
  resume: 'Fortsetzen',
  total: 'Gesamt',
  largeDownload: ({ tiles, size }) => (
    <>
      Großer Download: {tiles} Kacheln (~{size}). Dies kann eine Weile dauern.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Nicht genug Speicherplatz: Der Download benötigt etwa {size}, in diesem
      Browser sind aber nur {free} verfügbar. Er würde vorzeitig abbrechen.
    </>
  ),
  estSize: 'Geschätzte Größe',
  startCaching: 'Speicherung starten',
  cachedSuccess: ({ name }) => `Karte „${name}“ wurde erfolgreich gespeichert.`,
  activate: 'Aktivieren',
  focus: 'Auf Bereich zoomen',
  namePrefix: 'Offline',
};

export default de;

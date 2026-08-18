import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const de: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Karte für Offline-Nutzung speichern',
  modifyOfflineMap: 'Offline-Karte bearbeiten',
  toDownload: 'Herunterzuladen',
  addOfflineMap: 'Offline-Karte hinzufügen',
  emptyMessage:
    'Noch keine Offline-Karten gespeichert. Fügen Sie eine hinzu, um Karten ohne Internetverbindung zu nutzen.',
  zoom: 'Zoom',
  tiles: 'Kacheln',
  size: 'Größe',
  ready: 'Bereit',
  incomplete: ({ pct }) => <>Unvollständig ({pct} %)</>,
  resume: 'Fortsetzen',
  stop: 'Anhalten',
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
  offlineWiden:
    'Ohne Verbindung kann diese Karte verkleinert, aber nicht vergrößert werden — beim Vergrößern müssten Kacheln heruntergeladen werden, die sie nicht enthält.',
  premiumZoomHint:
    'Die tiefsten Zoomstufen dieser Ebene sind Premium. Eine Offline-Karte behält ihre Kacheln dauerhaft und zeigt sie ohne Verbindung, deshalb erfordert das Herunterladen dieser Stufen einen Premium-Zugang.',
  premiumWiden:
    'Diese Karte reicht bis in Premium-Zoomstufen. Ohne Premium-Zugang lässt sie sich verkleinern, aber nicht vergrößern — beim Vergrößern würden Premium-Kacheln neu geladen.',
  premiumSkipped:
    'Die tiefsten Zoomstufen dieser Karte sind Premium und wurden nicht heruntergeladen, deshalb bleibt sie als unvollständig markiert.',
};

export default de;

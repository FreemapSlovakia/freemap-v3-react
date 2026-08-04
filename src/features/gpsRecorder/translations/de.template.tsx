import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const de: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Aufzeichnen',
  pause: 'Pausieren',
  stop: 'Beenden',
  connect: 'Verbinden',
  install: 'Recorder installieren',
  update: 'Recorder aktualisieren',
  delete: 'Aufzeichnung löschen',
  settings: 'Aufzeichnungseinstellungen',
  details: 'Details der Aufzeichnung',
  state: {
    recording: 'Zeichnet auf',
    stopped: 'Gestoppt',
    unknown: 'Nicht verbunden',
  },
  connection: {
    connecting: 'Verbindung zum Recorder wird hergestellt…',
    syncing: 'Spur wird geladen…',
    live: 'Live',
    reconnecting: 'Verbindung wird wiederhergestellt…',
    offline: 'Keine Live-Ansicht',
  },
  stats: {
    distance: 'Entfernung',
    duration: 'Dauer',
    elevation: 'Höhe',
    ascent: 'Anstieg',
    speed: 'Geschwindigkeit',
    avgSpeed: 'Durchschnittsgeschwindigkeit',
    accuracy: 'Genauigkeit',
    satellites: 'Satelliten',
    points: 'Punkte',
    segments: 'Segmente',
    lastFix: 'Letzte Messung',
  },
  stopModal: {
    title: 'Aufzeichnung beenden?',
    message: ({ tool }) => (
      <>
        Die Aufzeichnung läuft noch. Beenden stoppt sie und verschiebt die Spur
        in das Werkzeug <b>{tool}</b>. Im Recorder bleibt nichts zurück, die
        nächste Aufzeichnung beginnt also eine neue Spur.
      </>
    ),
    confirm: 'Beenden',
  },
  deleteModal: {
    title: 'Aufzeichnung löschen?',
    message:
      'Der Recorder verwirft seine gesamte Spur. Das lässt sich nicht ' +
      'rückgängig machen. Beenden Sie die Aufzeichnung stattdessen, wenn Sie ' +
      'sie behalten möchten.',
    confirm: 'Löschen',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Der Recorder übersteht eine lange Aufzeichnung möglicherweise nicht:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'Der genaue Standort ist nicht erlaubt.',
    permissionBackground:
      'Der Standort im Hintergrund ist nicht erlaubt, daher stoppt die ' +
      'Aufzeichnung, sobald die App nicht im Vordergrund ist.',
    permissionNotifications:
      'Benachrichtigungen sind nicht erlaubt, daher kann Android den Aufzeichnungsdienst stoppen.',
    battery:
      'Der Recorder unterliegt der Akkuoptimierung, daher kann Android ihn stoppen.',
    oem: ({ vendor }) =>
      `${vendor}-Geräte schränken Hintergrund-Apps über Androids eigene ` +
      `Regeln hinaus ein, und der entsprechende Schritt im Recorder ist nicht bestätigt.`,
    open: 'Recorder öffnen',
  },
  errors: {
    unreachable:
      'Der Recorder hat nicht geantwortet — er läuft vielleicht nicht.',
    lnaDenied:
      'Der Browser hat den Zugriff auf das lokale Netzwerk verweigert, daher ' +
      'ist die Live-Ansicht nicht verfügbar. Die Aufzeichnung selbst ist ' +
      'nicht betroffen.',
    setupNeeded:
      'Der Recorder kann noch nicht aufzeichnen — öffnen Sie ihn und erteilen ' +
      'Sie, worum er bittet.',
    recording: 'Stoppen Sie die Aufzeichnung, bevor Sie ihre Spur löschen.',
    incomplete:
      'Ein Teil der Aufzeichnung hat diese Seite noch nicht erreicht, daher ' +
      'wurde nichts übernommen und nichts gelöscht. Verbinden Sie sich neu ' +
      'und beenden Sie erneut.',
    notStored:
      'Die Aufzeichnung konnte in diesem Browser nicht gespeichert werden und ' +
      'blieb daher auf dem Recorder. Sie liegt in Ihren Spuren — exportieren ' +
      'oder speichern Sie sie von dort.',
    notPersisted:
      'Dieser Browser wollte nicht zusichern, seinen Speicher zu behalten, ' +
      'daher blieb die Aufzeichnung auf dem Recorder. Sie liegt in Ihren ' +
      'Spuren — exportieren oder speichern Sie sie und löschen Sie dann die ' +
      'Aufzeichnung.',
    needsForeground:
      'Android hat den Recorder nicht aus dem Hintergrund starten lassen. ' +
      'Öffnen Sie ihn und starten Sie dort, oder erlauben Sie ihm, ohne ' +
      'Akkueinschränkungen zu laufen, damit er von hier gestartet werden kann.',
    outdated: 'Der Recorder ist für diese Version der Karte zu alt.',
    http: 'Der Recorder hat mit einem Fehler geantwortet.',
    protocol: 'Der Recorder hat etwas Unerwartetes geantwortet.',
    unknown: 'Die Kommunikation mit dem Recorder ist fehlgeschlagen.',
  },
  settingsModal: {
    title: 'Aufzeichnungseinstellungen',
    recorderSection: 'Was aufgezeichnet wird',
    recorderIntro:
      'Der Recorder wendet sie beim Start einer Aufzeichnung an, eine ' +
      'Änderung wirkt sich daher nicht auf eine bereits laufende Aufzeichnung aus.',
    intervalMs: 'Zeit zwischen den Messungen',
    minDistanceM: 'Mindestabstand zwischen den Messungen',
    maxAccuracyM: 'Messungen verwerfen, die ungenauer sind als',
    maxAccuracyOff: 'Jede Messung behalten',
    source: 'Positionsquelle',
    sourceGps: 'GPS-Empfänger',
    sourceFused: 'Kombiniert (GPS, WLAN und Sensoren)',
    sourceHint:
      'Der Empfänger misst die Höhe bei jeder Messung; die kombinierte Quelle ' +
      'verortet Sie zwischen Gebäuden und unter Bäumen besser, wiederholt ' +
      'aber dieselbe Höhe über mehrere Sekunden.',
    priority: 'Genauigkeit',
    priorityHigh: 'Höchste (GPS, meiste Akkulast)',
    priorityBalanced: 'Ausgewogen',
    priorityLow: 'Niedrig (geringste Akkulast)',
    priorityFusedOnly: 'Gilt nur für die kombinierte Quelle.',
    displaySection: 'Anzeige',
    splitGapS: 'Neues Segment beginnen nach einer Pause von',
    splitGapOff: 'Nie trennen',
    splitGapHint:
      'Eine längere Pause als diese wird als Lücke gezeichnet und exportiert, ' +
      'nicht als gerade Linie darüber hinweg.',
    feedLocation: 'Aufzeichnung für „Standort ermitteln“ verwenden',
    feedLocationHint:
      'Während der Aufzeichnung zeigt „Standort ermitteln“ die aufgezeichneten ' +
      'Messungen, statt dass der Browser das GPS separat verfolgt.',
    keepScreenAwake: 'Bildschirm während der Aufzeichnung eingeschaltet lassen',
  },
};

export default de;

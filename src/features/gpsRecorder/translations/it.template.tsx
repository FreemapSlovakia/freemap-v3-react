import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { GpsRecorderMessages } from './GpsRecorderMessages.js';

const it: DeepPartialWithRequiredObjects<GpsRecorderMessages> = {
  record: 'Registra',
  pause: 'Sospendi',
  stop: 'Termina',
  connect: 'Connetti',
  install: 'Installa il registratore',
  update: 'Aggiorna il registratore',
  delete: 'Elimina la registrazione',
  settings: 'Impostazioni di registrazione',
  details: 'Dettagli della registrazione',
  recordInBrowser: 'Registra in questo browser',
  browserBadge: 'In questo browser',
  browserWarning:
    'Registrazione in questo browser. Si interrompe quando lo schermo si ' +
    'blocca o quando lasci questa pagina, quindi tienila aperta e lo schermo ' +
    'acceso per tutto il percorso.',
  browserNoStorage:
    'Registrazione in questo browser, ma la registrazione non vi verrà ' +
    'salvata — ricaricando o chiudendo questa pagina la perdi. Per ' +
    'conservarla, termina la registrazione.',
  state: {
    recording: 'In registrazione',
    stopped: 'Fermato',
    unknown: 'Non connesso',
  },
  connection: {
    connecting: 'Connessione al registratore…',
    syncing: 'Recupero della traccia…',
    live: 'In diretta',
    reconnecting: 'Riconnessione…',
    offline: 'Nessuna vista in diretta',
  },
  stats: {
    distance: 'Distanza',
    duration: 'Durata',
    elevation: 'Quota',
    ascent: 'Ascesa',
    speed: 'Velocità',
    avgSpeed: 'Velocità media',
    accuracy: 'Precisione',
    satellites: 'Satelliti',
    points: 'Punti',
    segments: 'Segmenti',
    lastFix: 'Ultima rilevazione',
  },
  stopModal: {
    title: 'Terminare la registrazione?',
    message: ({ tool }) => (
      <>
        La registrazione è ancora in corso. Terminandola si ferma e la traccia
        passa allo strumento <b>{tool}</b>. Nel registratore non resta nulla,
        quindi la prossima registrazione inizia una nuova traccia.
      </>
    ),
    confirm: 'Termina',
  },
  deleteModal: {
    title: 'Eliminare la registrazione?',
    message:
      'Il registratore scarta l’intera traccia. L’operazione non può essere ' +
      'annullata. Se vuoi conservarla, termina invece la registrazione.',
    confirm: 'Elimina',
  },
  setup: {
    summary: ({ items }) => (
      <>
        Il registratore potrebbe non sopravvivere a una registrazione lunga:
        <ul className="mb-0 ps-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    permissionFine: 'La posizione precisa non è consentita.',
    permissionBackground:
      'La posizione in background non è consentita, quindi la registrazione ' +
      'si ferma quando l’app non è in primo piano.',
    permissionNotifications:
      'Le notifiche non sono consentite, quindi Android può fermare il servizio di registrazione.',
    battery:
      'Il registratore è soggetto all’ottimizzazione della batteria, quindi Android può fermarlo.',
    oem: ({ vendor }) =>
      `I dispositivi ${vendor} limitano le app in background oltre le regole ` +
      `di Android e il relativo passaggio nel registratore non risulta completato.`,
    open: 'Apri il registratore',
  },
  errors: {
    unreachable: 'Il registratore non ha risposto — forse non è in esecuzione.',
    lnaDenied:
      'Il browser ha negato l’accesso alla rete locale, quindi la vista in ' +
      'diretta non è disponibile. La registrazione in sé non ne risente.',
    setupNeeded:
      'Il registratore non può ancora registrare — aprilo e concedi ciò che chiede.',
    recording: 'Ferma la registrazione prima di eliminarne la traccia.',
    incomplete:
      'Una parte della registrazione non è ancora arrivata a questa pagina, ' +
      'quindi non è stato preso né eliminato nulla. Riconnettiti e termina di nuovo.',
    notStored:
      'Non è stato possibile salvare la registrazione in questo browser, ' +
      'quindi è rimasta sul registratore. La trovi nelle tue tracce — ' +
      'esportala o salvala da lì.',
    notPersisted:
      'Questo browser non ha garantito di conservare la propria memoria, ' +
      'quindi la registrazione è rimasta sul registratore. La trovi nelle tue ' +
      'tracce — esportala o salvala, poi elimina la registrazione.',
    needsForeground:
      'Android non ha permesso al registratore di avviarsi dal background. ' +
      'Aprilo e avvia da lì, oppure consentigli di funzionare senza ' +
      'restrizioni della batteria per poterlo avviare da qui.',
    outdated:
      'Il registratore è troppo vecchio per questa versione della mappa.',
    locationDenied:
      'Questo sito non è autorizzato a usare la tua posizione. Consentilo ' +
      'nelle impostazioni del browser per questo sito, poi avvia di nuovo la ' +
      'registrazione.',
    locationUnavailable:
      'Questo browser non è in grado di rilevare la tua posizione.',
    http: 'Il registratore ha risposto con un errore.',
    protocol: 'Il registratore ha risposto con qualcosa di inatteso.',
    unknown: 'La comunicazione con il registratore non è riuscita.',
  },
  settingsModal: {
    title: 'Impostazioni di registrazione',
    backend: 'Registra con',
    backendApp: 'L’app del registratore',
    backendBrowser: 'Questo browser',
    backendHint:
      'L’app registra anche a schermo spento e misura la quota a ogni ' +
      'rilevazione. Questo browser richiede la pagina aperta e lo schermo ' +
      'acceso, ma non richiede alcuna installazione.',
    backendLockedHint:
      'Non modificabile mentre una registrazione è in corso. Prima sospendila ' +
      'o terminala.',
    recorderSection: 'Cosa viene registrato',
    recorderIntro:
      'Il registratore le applica all’avvio di una registrazione, quindi ' +
      'modificarle non influisce su una registrazione già in corso.',
    browserIntro:
      'Vengono applicate all’avvio di una registrazione, quindi modificarle ' +
      'non influisce su una registrazione già in corso. È il browser a ' +
      'decidere ogni quanto comunica una posizione, perciò questi sono limiti ' +
      'più che istruzioni.',
    intervalMs: 'Tempo tra le rilevazioni',
    minDistanceM: 'Distanza minima tra le rilevazioni',
    maxAccuracyM: 'Scarta le rilevazioni meno precise di',
    maxAccuracyOff: 'Conserva ogni rilevazione',
    source: 'Origine della posizione',
    sourceGps: 'Ricevitore GPS',
    sourceFused: 'Combinata (GPS, wifi e sensori)',
    sourceHint:
      'Il ricevitore misura la quota a ogni rilevazione; l’origine combinata ' +
      'ti colloca meglio tra gli edifici e sotto gli alberi, ma ripete la ' +
      'stessa quota anche per alcuni secondi.',
    priority: 'Precisione',
    priorityHigh: 'Massima (GPS, più batteria)',
    priorityBalanced: 'Bilanciata',
    priorityLow: 'Bassa (meno batteria)',
    priorityFusedOnly: 'Vale solo per l’origine combinata.',
    displaySection: 'Visualizzazione',
    splitGapS: 'Inizia un nuovo segmento dopo una pausa di',
    splitGapOff: 'Non dividere mai',
    splitGapHint:
      'Una pausa più lunga di questa viene disegnata ed esportata come ' +
      'interruzione, non come linea retta che la attraversa.',
    feedLocation: 'Usa la registrazione per «Localizzami»',
    feedLocationHint:
      'Durante la registrazione, «Localizzami» mostra le rilevazioni ' +
      'registrate invece di far seguire il GPS al browser separatamente.',
    keepScreenAwake: 'Mantieni lo schermo acceso durante la registrazione',
  },
};

export default it;

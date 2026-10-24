import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const it: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Scelga da dove guardare con il pulsante {icon} qui sotto.</>
  ),
  preparing: 'Il panorama è in preparazione…',
  rendering: 'Rendering del panorama…',
  encoding: "Compressione dell'immagine…",
  decoding: "Decompressione dell'immagine…",
  queued: ({ ahead }) =>
    ahead === 0
      ? 'In attesa del renderer…'
      : ahead === 1
        ? 'In attesa — c’è un panorama prima.'
        : `In attesa — ci sono ${ahead} panorami prima.`,
  cancel: 'Annulla',
  update: 'Aggiorna',
  outdated: 'L’immagine è del punto di osservazione precedente.',
  locate: 'Vista dalla mia posizione',
  pickViewpoint: 'Scegli sulla mappa',
  pickViewpointPrompt: 'Clicchi sulla mappa il punto da cui vuole guardare',
  lookAt: 'Guarda un luogo sulla mappa',
  pickTargetPrompt: 'Clicchi sulla mappa il luogo che vuole guardare',
  createToposcope: 'Crea una tavola d’orientamento da questa vista',
  toposcopeMergeModal: {
    title: 'La mappa non è vuota',
    message:
      'Sulla mappa ci sono già dei punti disegnati. Aggiungere a essi le cime di questa vista o sostituirle? In ogni caso il centro della tavola si sposta su questo punto di osservazione.',
    append: 'Aggiungi',
    replace: 'Sostituisci',
  },
  settings: {
    title: 'Impostazioni del panorama',
    tiltHint:
      'Quanto cielo e quanto terreno entrano nell’immagine — gli angoli sopra e sotto l’orizzonte.',
    depthLift: 'Dispiega la distanza',
    depthLiftOff: 'Vista reale',
    depthLiftHint:
      'Solleva il terreno lontano, così le catene distanti si staccano dalle creste davanti a loro, come in un panorama disegnato a mano. Porta però nell’immagine anche cime che da qui non si vedrebbero davvero; i loro nomi sono contrassegnati. I percorsi del sole e della luna non vi sono disegnati.',
    rangeHint:
      'Il terreno oltre i 300 km è una funzione premium. Ogni chilometro in più viene percorso lungo ogni raggio dell’immagine, quindi una vista più lontana costa al renderer proporzionalmente di più.',
    look: 'Aspetto',
    looks: {
      natural: 'Naturale',
      relief: 'Rilievo ombreggiato',
      drawn: 'Disegnato',
      engraved: 'Inciso',
      custom: 'Personalizzato',
    },
    ridgeStrength: 'Intensità delle linee di cresta',
    ridgeWidth: 'Spessore delle linee di cresta',
    ridgeColor: 'Colore delle creste',
    ground: 'Terreno',
    groundHint:
      'Un colore solo, che la foschia integrata sbiadisce verso il cielo con la distanza — oppure un gradiente, che colora il terreno in base a quanto è lontano e sostituisce del tutto la foschia.',
    groundSolid: 'Colore',
    groundGradient: 'Gradiente',
    gradientFar: 'Il gradiente arriva a',
    gradientFarAuto: 'Automatico',
    gradientFarHint:
      'La distanza a cui si raggiunge l’ultimo colore; il centro della barra sta a un terzo di essa. In automatico misura il terreno effettivamente inquadrato, così l’intera tavolozza si spende su ciò che l’immagine mostra.',
    gradientSky: 'Sfumare nel cielo',
    gradientSkyHint:
      'L’ultimo colore diventa il cielo stesso, così le catene lontane si dissolvono nell’orizzonte invece di stagliarvisi contro. Disattivato dà il profilo netto che vuole una locandina.',
    gradientClip: 'Nascondere il terreno oltre',
    gradientClipHint:
      'Il terreno oltre quella distanza viene omesso invece di essere dipinto piatto nell’ultimo colore, così tutto il gradiente si spende su ciò che l’immagine mostra. Le cime che vi si trovano non vengono nominate.',
  },
  quality: {
    detail: 'Dettaglio',
  },
  frame: 'Inquadratura e dettaglio',
  tilt: {
    label: 'Ampiezza verticale',
    standard: 'Standard',
    wide: 'Alta',
    flat: 'Bassa',
    below: "Sotto l'orizzonte",
    above: "Sopra l'orizzonte",
  },
  fov: {
    label: 'Ampiezza orizzontale',
    full: 'Tutto attorno',
  },
  sky: {
    title: 'Sole e luna',
    sun: 'Percorso del sole',
    moon: 'Percorso della luna',
    date: 'Giorno',
    dateHint:
      'Gli orari sono nel fuso orario di questo dispositivo e indicano quando l’ultimo spicchio del disco scompare dietro il terreno o il primo riappare. Il terreno è nudo, quindi alberi ed edifici possono nasconderlo prima.',
    today: 'Oggi',
    lit: (percent) => `illuminata al ${percent}`,
    unfolded: (
      <>
        Non su un’immagine dispiegata: il terreno lontano è disegnato più in
        alto di dove sta, quindi i percorsi taglierebbero l’orizzonte nei punti
        sbagliati. Nelle impostazioni del panorama porti{' '}
        <i>Dispiega la distanza</i> su <i>Vista reale</i> e aggiorni.
      </>
    ),
  },
  labels: {
    title: 'Nomi delle cime',
    density: 'Numero di nomi',
    none: 'Nessuno',
    few: 'Meno',
    normal: 'Normale',
    many: 'Di più',
    weight: 'Valuta le cime per',
    weightHint:
      'Per grandezza vengono nominate le grandi montagne per quanto lontane siano, al centro ciò che riempie la vista, e per vicinanza ciò che è vicino comunque appaia.',
    weights: [
      'Grandezza',
      'Più grandezza',
      'Grandezza e vicinanza',
      'Più vicinanza',
      'Vicinanza',
    ],
    prominence: 'Privilegia le montagne vere',
    prominenceOff: 'Disattivato',
    prominenceHint:
      'Una cima riceve il nome per essere una montagna in sé, non solo per quanto spicca dal punto di osservazione — così anche una vetta famosa stretta fra vicine più alte si guadagna il nome. Per molte cime è sconosciuta e queste vengono valutate come prima.',
    haze: 'Fin dove arrivano i nomi',
    hazeOff: 'Aria tersa',
    hazeHint:
      'Quanto deve essere lontana una cima perché la foschia conti più della cima stessa. Oltre il triplo di quella distanza non viene nominato più nulla.',
    subLine: 'Sotto il nome',
    subLineHint:
      'Cosa dice la seconda riga dell’etichetta di ogni cima. Con una qualsiasi di queste attiva, ogni etichetta occupa due righe, così ne stanno di meno. La prominenza (P) è quanto la cima si alza sopra la sella più bassa verso un terreno più alto; l’isolamento (I) è quanto dista quel terreno più alto.',
    subLineParts: {
      ele: 'Quota',
      distance: 'Distanza',
      prominence: 'Prominenza',
      isolation: 'Isolamento',
    },
    subLineAbbr: { prominence: 'P', isolation: 'I' },
    showRevealed: 'Nomina le cime scoperte',
    showRevealedHint:
      'Cime che il dispiegamento della distanza ha tirato fuori da dietro una cresta più vicina: sono disegnate, ma da qui non si vedono davvero. I loro nomi sono più chiari e, quando non c’è spazio per entrambi, la precedenza va alla cima che si vede.',
  },
  dominance: {
    label: 'Dominanza minima',
    all: 'Qualsiasi',
  },
  autoPan: 'Ruota con il dispositivo o da sé',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline: 'Il panorama viene reso dal server e il dispositivo è offline.',
    unreachable:
      'Non è stato possibile raggiungere il servizio di rendering. Potrebbe non essere attivo, oppure qualcosa lungo il percorso blocca la richiesta.',
    busy: 'Il servizio di rendering non è disponibile in questo momento. Riprovi fra poco.',
    tooMany:
      'Ultimamente sono stati resi troppi panorami. Riprovi più tardi oppure passi al premium.',
    noData:
      'Per questo punto di osservazione non ci sono dati del terreno. Provi a cliccare altrove.',
    failed: 'Non è stato possibile rendere il panorama.',
  },
  caveats: {
    viewpoint:
      'L’occhio viene posto sul punto più alto entro pochi metri dal punto cliccato, così la vista dalla cima non è rovinata dalla roccia lì accanto.',
    depthLift:
      'La distanza è dispiegata, quindi questa immagine è un disegno e non una fotografia: le cime dal nome più chiaro sono in realtà coperte da una cresta davanti a loro, e una distanza letta dall’immagine non significa più una linea di vista libera.',
  },
  terrainSource: 'Terreno',
  peakSource: 'Nomi delle cime',
};

export default it;

import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const it: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Scegli sulla mappa',
  locate: 'Visibilità dalla mia posizione',
  pickViewpointPrompt: 'Clicca sulla mappa il punto da cui vuoi guardare',
  detail: 'Qualità / velocità',
  details: {
    superfast: 'Minima / velocissima',
    fast: 'Bassa / veloce',
    standard: 'Standard',
    detailed: 'Dettagliata / lenta',
    finest: 'Massima / lentissima',
  },
  settings: 'Impostazioni della visibilità',
  targetHeight: 'Altezza del bersaglio',
  targetHeightHint:
    'Quanto è alto ciò che stai guardando — alzalo per vedere da dove sarebbero visibili un traliccio o una persona su una cresta.',
  color: 'Colore',
  strength: 'Intensità',
  strengthMeasured: 'Come misurata',
  strengthHint:
    'Il livello è sfumato in base a quanto terreno vedi, perciò le superfici viste quasi di taglio risultano molto pallide. Aumentandola si solleva l’estremo pallido senza appiattire il resto.',
  minOpacity: 'Opacità minima',
  minOpacityHint:
    'Con quanta intensità è disegnato il terreno visibile, anche se lo vedi quasi di taglio. Al 100% il livello è una semplice maschera: visibile o no, niente in mezzo.',
  update: 'Aggiorna',
  outdated: 'Il livello è del punto di osservazione precedente.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'In attesa del renderer…'
      : ahead === 1
        ? 'In attesa — c’è un calcolo prima.'
        : `In attesa — ci sono ${ahead} calcoli prima.`,
  errors: {
    offline: 'La visibilità è calcolata dal server e tu sei offline.',
    unreachable:
      'Non è stato possibile raggiungere il servizio di rendering. Potrebbe non essere attivo, oppure qualcosa fra te e lui blocca la richiesta.',
    busy: 'Il servizio di rendering non è disponibile in questo momento. Riprova fra poco.',
    tooMany:
      'Ultimamente sono stati fatti troppi calcoli. Riprova più tardi oppure passa al premium.',
    noData:
      'Per questo punto di osservazione non ci sono dati del terreno. Prova a cliccare altrove.',
    failed: 'Non è stato possibile calcolare la visibilità.',
  },
};

export default it;

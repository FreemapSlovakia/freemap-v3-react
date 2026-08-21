import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const it: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint:
    'Colloca il centro della tavola con il pulsante ◎ nella barra degli strumenti.',
  addCenter: 'Colloca il centro',
  moveCenter: 'Sposta il centro',
  pickCenterPrompt: 'Fai clic sulla mappa dove si trova la tavola',
  addPointsHint:
    'Aggiungi punti disegnati; ognuno diventa un raggio della tavola. Anche il centro è un punto disegnato: etichettalo e spostalo nello strumento di disegno.',
  downloadAsSvg: 'Scarica come SVG',
  osmAttribution: '© OpenStreetMap contributors',
  credit: ({ site }) => `Tavola d'orientamento di ${site}`,
  settings: {
    title: "Tavola d'orientamento",
    inscriptions: 'Iscrizioni',
    innerCircleRadius: 'Raggio del cerchio interno',
    outerCircleRadius: 'Raggio del cerchio esterno',
    scale: 'Scala',
    scaleHint:
      'Quanto è grande la scritta rispetto alla tavola. Ridimensionare il pannello scala tutto il disegno insieme.',
    preventUpturnedText: 'Previeni il testo sotto-sopra',
    line1: 'Prima riga',
    line2: 'Seconda riga',
    lineHint:
      'Disponibili: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} e {p:nome} per qualsiasi proprietà del punto. Una parte tra [parentesi quadre] viene scritta solo se tutto ciò che contiene ha un valore, come [{elevation} · ]{distance}.',
    placeholders:
      "Un'iscrizione può contenere {attribution} per i crediti della mappa e {credit} per questo portale.",
  },
};

export default it;

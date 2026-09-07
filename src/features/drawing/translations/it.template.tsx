import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const it: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Proprietà',
  edit: {
    pointKeys:
      'Scrivi {p:nome} per una proprietà chiamata nome e {location} per la posizione.',
    lineKeys:
      'Scrivi {p:nome} per una proprietà chiamata nome, {length} per la lunghezza ({length_m}, {length_km}, {length_mi}) e {azimuth} per una linea dritta di due punti.',
    polygonKeys:
      'Scrivi {p:nome} per una proprietà chiamata nome, {area} per l’area ({area_m2}, {area_a}, {area_ha}, {area_km2}, {area_ac}) e {perimeter} per il perimetro ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    optionalKeys:
      'Una parte tra [parentesi quadre] viene scritta solo se tutto ciò che contiene ha un valore: {p:nome}[, {p:ele} m] omette la quota quando manca.',
    properties: 'Proprietà',
    propertyKey: 'Nome',
    propertyValue: 'Valore',
    addProperty: 'Aggiungi proprietà',
    removeProperty: 'Rimuovi proprietà',
    insertIntoLabel: "Inserisci nell'etichetta",
    title: 'Proprietà',
    color: 'Colore',
    fillColor: 'Colore di riempimento',
    label: 'Etichetta',
    width: 'Larghezza',
    hint: "Invio va a capo. Per rimuovere l'etichetta lascia il campo vuoto.",
    shape: 'Forma',
    text: 'Testo',
    textHint: 'Icona o massimo 2 caratteri mostrati nel marcatore.',
    type: 'Tipo di geometria',
    dashArray: 'Stile tratteggio',
    lineCap: 'Terminazione linea',
    lineCapRound: 'Arrotondata',
    lineCapButt: 'Piatta',
    lineCapSquare: 'Quadrata',
    lineJoin: 'Giunzione linea',
    lineJoinRound: 'Arrotondata',
    lineJoinMiter: 'A punta',
    lineJoinBevel: 'Smussata',
  },
  continue: 'Continua',
  join: 'Unisci',
  split: 'Separa',
  stopDrawing: 'Ferma il disegno',
  selectPointToJoin: 'Seleziona un punto per unire le linee',
  reverse: 'Inverti direzione',
  simplify: 'Semplifica',
  cutHole: 'Ritaglia un buco',
  cutHoleHint: 'Disegna il buco all’interno di questo poligono.',
  makeHole: 'Trasforma in un buco del poligono che lo racchiude',
  detachHole: 'Stacca il buco',
  defProps: {
    menuItem: 'Impostazioni stile',
    title: 'Impostazioni dello stile di disegno',
    applyToAll: 'Salva e applica a tutti',
  },

  projection: {
    projectPoint: 'Proietta punto',
    distance: 'Distanza',
    azimuth: 'Azimut',
  },
};

export default it;

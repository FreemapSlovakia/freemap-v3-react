import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const it: DeepPartialWithRequiredObjects<DrawingMessages> = {
  modify: 'Proprietà',
  edit: {
    title: 'Proprietà',
    color: 'Colore',
    fillColor: 'Colore di riempimento',
    label: 'Etichetta',
    width: 'Larghezza',
    hint: "Per rimuovere l'etichetta lascia il campo vuoto.",
    shape: 'Forma',
    icon: 'Icona',
    iconChoose: 'Scegli icona…',
    iconNone: 'Nessuna icona',
    iconSearch: 'Cerca icone',
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

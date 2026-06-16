import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { DrawingMessages } from './DrawingMessages.js';

const de: DeepPartialWithRequiredObjects<DrawingMessages> = {
  edit: {
    title: 'Eigenschaften',
    color: 'Farbe',
    fillColor: 'Füllfarbe',
    label: 'Beschriftung',
    width: 'Breite',
    hint: 'Um die Beschriftung zu entfernen, lassen Sie das Feld leer.',
    shape: 'Form',
    icon: 'Symbol',
    iconChoose: 'Symbol auswählen…',
    iconNone: 'Kein Symbol',
    iconSearch: 'Symbole suchen',
    text: 'Text',
    textHint:
      'Symbol oder maximal 2 Zeichen werden in der Markierung angezeigt.',
    type: 'Geometrietyp',
    dashArray: 'Strichelung',
    lineCap: 'Linienende',
    lineCapRound: 'Rund',
    lineCapButt: 'Flach',
    lineCapSquare: 'Quadratisch',
    lineJoin: 'Linienverbindung',
    lineJoinRound: 'Rund',
    lineJoinMiter: 'Spitz',
    lineJoinBevel: 'Abgeschrägt',
  },

  defProps: {
    menuItem: 'Stileinstellungen',
    title: 'Standard-Stileinstellungen für Zeichnen',
    applyToAll: 'Speichern und auf alle anwenden',
  },

  projection: {
    projectPoint: 'Punkt projizieren',
    azimuth: 'Azimut',
    distance: 'Entfernung',
  },

  modify: 'Eigenschaften',
  continue: 'Fortfahren',
  join: 'Verbinden',
  split: 'Teilen',
  stopDrawing: 'Zeichnen beenden',
  selectPointToJoin: 'Punkt zum Verbinden der Linien wählen',
  reverse: 'Richtung umkehren',
  simplify: 'Vereinfachen',
};

export default de;

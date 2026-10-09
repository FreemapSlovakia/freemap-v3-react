import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { DrawingMessages } from './DrawingMessages.js';

const de: DeepPartialWithRequiredObjects<DrawingMessages> = {
  edit: {
    pointKeys:
      'Schreibe {p:name} für eine Eigenschaft namens name und {location} für die Position.',
    lineKeys:
      'Schreibe {p:name} für eine Eigenschaft namens name, {length} für die Länge ({length_m}, {length_km}, {length_mi}) und {azimuth} bei einer geraden Linie aus zwei Punkten.',
    polygonKeys:
      'Schreibe {p:name} für eine Eigenschaft namens name, {area} für die Fläche ({area_m2}, {area_a}, {area_ha}, {area_km2}, {area_ac}) und {perimeter} für den Umfang ({perimeter_m}, {perimeter_km}, {perimeter_mi}).',
    optionalKeys:
      'Ein Teil in [eckigen Klammern] wird nur geschrieben, wenn alles darin einen Wert hat: {p:name}[, {p:ele} m] lässt die Höhe weg, wenn sie fehlt.',
    properties: 'Eigenschaften',
    propertyKey: 'Name',
    propertyValue: 'Wert',
    addProperty: 'Eigenschaft hinzufügen',
    removeProperty: 'Eigenschaft entfernen',
    insertIntoLabel: 'In die Beschriftung einfügen',
    showLabel: 'Beschriftung anzeigen',
    labelVisibility: {
      always: 'Immer',
      hover: 'Beim Überfahren',
      selected: 'Wenn ausgewählt',
      'hover-selected': 'Beim Überfahren oder wenn ausgewählt',
    },
    different: '<verschieden>',
    change: 'Ändern',
    keep: 'Beibehalten',
    title: 'Eigenschaften',
    color: 'Farbe',
    fillColor: 'Füllfarbe',
    label: 'Beschriftung',
    width: 'Breite',
    hint: 'Mit der Eingabetaste beginnt eine neue Zeile. Um die Beschriftung zu entfernen, lassen Sie das Feld leer.',
    shape: 'Form',
    text: 'Text',
    or: 'oder',
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
    menuItem: 'Standardstil festlegen',
    title: 'Standard-Stileinstellungen für Zeichnen',
    applyToAll: 'Speichern und auf alle anwenden',
  },

  projection: {
    projectPoint: 'Punkt projizieren',
    azimuth: 'Azimut',
    distance: 'Entfernung',
    add: 'Hinzufügen',
  },

  modify: 'Eigenschaften',
  batch: {
    title: 'Eigenschaften gesammelt bearbeiten',
    dialogTitle: ({ kind, count }) =>
      `Eigenschaften gesammelt bearbeiten – ${kind} (${count})`,
    all: 'Alle Objekte',
    points: 'Alle Punkte',
    lines: 'Alle Linien',
    polygons: 'Alle Polygone',
  },
  continue: 'Fortfahren',
  join: 'Verbinden',
  split: 'Teilen',
  stopDrawing: 'Zeichnen beenden',
  selectPointToJoin: 'Punkt zum Verbinden der Linien wählen',
  reverse: 'Richtung umkehren',
  simplify: 'Vereinfachen',
  cutHole: 'Loch ausschneiden',
  cutHoleHint: 'Zeichnen Sie das Loch innerhalb dieses Polygons.',
  makeHole: 'In ein Loch des umschließenden Polygons umwandeln',
  detachHole: 'Loch ablösen',
};

export default de;

import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const de: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint:
    'Setze die Mitte der Tafel mit der Schaltfläche ◎ in der Werkzeugleiste.',
  addCenter: 'Mitte setzen',
  moveCenter: 'Mitte verschieben',
  pickCenterPrompt: 'Klicke auf die Karte, wo die Tafel steht',
  addPointsHint:
    'Zeichne Punkte ein; aus jedem wird ein Strahl der Tafel. Auch die Mitte ist ein gezeichneter Punkt — beschriftet und verschoben wird sie im Zeichenwerkzeug.',
  downloadAsSvg: 'Als SVG herunterladen',
  osmAttribution: '© OpenStreetMap-Mitwirkende',
  credit: ({ site }) => `Panoramatafel von ${site}`,
  cardinals: { n: 'N', e: 'O', s: 'S', w: 'W' },
  settings: {
    title: 'Panoramatafel',
    inscriptions: 'Inschriften',
    innerCircleRadius: 'Radius des inneren Kreises',
    outerCircleRadius: 'Radius des äußeren Kreises',
    scale: 'Maßstab',
    scaleHint:
      'Wie groß die Schrift gegenüber der Tafel ist. Das Fenster zu vergrößern skaliert die ganze Zeichnung mit.',
    preventUpturnedText: 'Text nicht auf dem Kopf stehen lassen',
    line1: 'Erste Zeile',
    line2: 'Zweite Zeile',
    lineHint:
      'Verfügbar: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} und {property:name} für jede Eigenschaft des Punktes. Ein fehlender Wert nimmt sein Trennzeichen mit.',
    placeholders:
      'Eine Inschrift kann {attribution} für den Kartennachweis und {credit} für dieses Portal enthalten.',
  },
};

export default de;

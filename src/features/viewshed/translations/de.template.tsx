import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ViewshedMessages } from './ViewshedMessages.js';

const de: DeepPartialWithRequiredObjects<ViewshedMessages> = {
  pickViewpoint: 'Auf der Karte wählen',
  locate: 'Sichtbarkeit von meinem Standort',
  pickViewpointPrompt: 'Klicken Sie auf die Karte, von wo aus Sie schauen',
  detail: 'Qualität / Geschwindigkeit',
  details: {
    superfast: 'Niedrigste / schnellste',
    fast: 'Niedrige / schnelle',
    standard: 'Standard',
    detailed: 'Detailliert / langsam',
    finest: 'Feinste / langsamste',
  },
  settings: 'Sichtbarkeitseinstellungen',
  targetHeight: 'Höhe des Ziels',
  targetHeightHint:
    'Wie hoch das ist, worauf Sie schauen — heben Sie es an, um zu sehen, von wo aus ein Mast oder ein Mensch auf dem Grat sichtbar wäre.',
  color: 'Farbe',
  strength: 'Stärke',
  strengthMeasured: 'Wie gemessen',
  strengthHint:
    'Die Ebene ist danach eingefärbt, wie viel vom Boden Sie sehen, weshalb fast von der Seite gesehenes Gelände sehr blass herauskommt. Ein höherer Wert hebt das blasse Ende an, ohne den Rest einzuebnen.',
  minOpacity: 'Geringste Deckkraft',
  minOpacityHint:
    'Wie kräftig sichtbares Gelände erscheint, auch wenn es fast von der Seite gesehen wird. Bei 100 % ist die Ebene eine reine Schablone: sichtbar oder nicht, nichts dazwischen.',
  update: 'Aktualisieren',
  outdated: 'Die Ebene zeigt den vorherigen Blickpunkt.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Warten auf den Renderer…'
      : ahead === 1
        ? 'Warten — eine Berechnung ist vorher dran.'
        : `Warten — ${ahead} Berechnungen sind vorher dran.`,
  errors: {
    offline:
      'Die Sichtbarkeit wird auf dem Server berechnet, und Sie sind offline.',
    unreachable:
      'Der Rendering-Dienst war nicht erreichbar. Er ist möglicherweise außer Betrieb, oder etwas zwischen Ihnen und ihm blockiert die Anfrage.',
    busy: 'Der Rendering-Dienst ist derzeit nicht verfügbar. Versuchen Sie es gleich noch einmal.',
    tooMany:
      'In letzter Zeit zu viele Berechnungen. Versuchen Sie es später noch einmal, oder holen Sie sich Premium.',
    noData:
      'Für diesen Blickpunkt gibt es keine Geländedaten. Klicken Sie an eine andere Stelle.',
    failed: 'Die Sichtbarkeit konnte nicht berechnet werden.',
  },
};

export default de;

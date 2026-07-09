import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const de: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Füge den folgenden Code in deine HTML-Seite ein:',
  example: 'Das Ergebnis wird folgendermaßen aussehen:',
  dimensions: 'Größe',
  height: 'Höhe',
  width: 'Breite',
  enableFeatures: 'Funktionen aktivieren',
  enableSearch: 'Suche',
  enableMapSwitch: 'Kartenebenen wechseln',
  enableLocateMe: 'Standort ermitteln',
};

export default de;

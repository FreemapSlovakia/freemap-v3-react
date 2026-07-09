import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const hu: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'A következő kódot írja be HTML-oldalába:',
  example: 'Az eredmény így fog kinézni:',
  dimensions: 'Méretek',
  height: 'Magasság',
  width: 'Szélesség',
  enableFeatures: 'Funkciók engedélyezése',
  enableSearch: 'keresés',
  enableMapSwitch: 'térképréteg-kapcsoló',
  enableLocateMe: 'saját hely megtalálása',
};

export default hu;

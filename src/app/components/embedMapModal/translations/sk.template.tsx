import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const sk: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Vložte na vašu stránku tento html kód:',
  example: 'Výsledok bude vyzerať nasledovne:',
  dimensions: 'Veľkosť',
  height: 'Výška',
  width: 'Šírka',
  enableFeatures: 'Povoliť funkcie',
  enableSearch: 'vyhľadávanie',
  enableMapSwitch: 'prepínanie vrstiev mapy',
  enableLocateMe: 'nájdenie vlastnej pozície',
};

export default sk;

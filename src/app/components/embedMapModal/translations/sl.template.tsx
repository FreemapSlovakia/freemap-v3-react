import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const sl: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Na svojo spletno stran vstavite to kodo HTML:',
  example: 'Rezultat bo videti takole:',
  dimensions: 'Velikost',
  height: 'Višina',
  width: 'Širina',
  enableFeatures: 'Omogoči funkcije',
  enableSearch: 'iskanje',
  enableMapSwitch: 'preklapljanje slojev zemljevida',
  enableLocateMe: 'poišči me',
};

export default sl;

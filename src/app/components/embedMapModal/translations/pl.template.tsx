import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { EmbedMessages } from './EmbedMessages.js';

const pl: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Umieść poniższy kod na swojej stronie HTML:',
  example: 'Wynik będzie wyglądał następująco:',
  dimensions: 'Wymiary',
  height: 'Wysokość',
  width: 'Szerokość',
  enableFeatures: 'Włącz funkcje',
  enableSearch: 'wyszukiwanie',
  enableMapSwitch: 'przełączanie warstw mapy',
  enableLocateMe: 'znajdź mnie',
};

export default pl;

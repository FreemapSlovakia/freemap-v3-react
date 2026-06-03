import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { EmbedMessages } from './EmbedMessages.js';

const it: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Inserisci il codice seguente nella tua pagina HTML:',
  example: 'Il risultato sarà simile a questo:',
  dimensions: 'Dimensioni',
  height: 'Altezza',
  width: 'Larghezza',
  enableFeatures: 'Abilita caratteristiche',
  enableSearch: 'cerca',
  enableMapSwitch: 'Cambia livello mappa',
  enableLocateMe: 'trovami',
};

export default it;

import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { EmbedMessages } from './EmbedMessages.js';

const cs: DeepPartialWithRequiredObjects<EmbedMessages> = {
  code: 'Vložte na vaši stránku tento html kód:',
  example: 'Výsledek bude vypadat následovně:',
  dimensions: 'Velikost',
  height: 'Výška',
  width: 'Šířka',
  enableFeatures: 'Povolit funkce',
  enableSearch: 'vyhledávání',
  enableMapSwitch: 'přepínání vrstev mapy',
  enableLocateMe: 'nalezení vlastní pozice',
};

export default cs;

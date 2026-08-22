import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const sk: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Umiestnite stred ružice tlačidlom ◎ nižšie.',
  addCenter: 'Umiestniť stred',
  moveCenter: 'Presunúť stred',
  centerAtMyPosition: 'Vystrediť na moju polohu',
  pickCenterPrompt: 'Kliknite do mapy tam, kde ružica stojí',
  addPointsHint:
    'Pridajte kreslené body; z každého sa stane lúč ružice. Aj stred je kreslený bod — popíšte a presúvajte ho v nástroji kreslenia.',
  downloadAsSvg: 'Stiahnuť ako SVG',
  osmAttribution: '© prispievatelia OpenStreetMap',
  credit: ({ site }) => `Orientačná ružica od ${site}`,
  settings: {
    title: 'Orientačná ružica',
    inscriptions: 'Vlastné texty',
    innerCircleRadius: 'Polomer vnútornej kružnice',
    outerCircleRadius: 'Polomer vonkajšej kružnice',
    scale: 'Mierka',
    scaleHint:
      'Veľkosť textu voči ružici. Zmenou veľkosti panela sa mení celá kresba naraz.',
    preventUpturnedText: 'Zabrániť textu dole hlavou',
    line1: 'Prvý riadok',
    line2: 'Druhý riadok',
    lineHint:
      'K dispozícii: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} a {p:nazov} pre ľubovoľnú vlastnosť bodu. Časť v [hranatých zátvorkách] sa vypíše, len keď má všetko v nej hodnotu, napríklad [{elevation} · ]{distance}.',
    placeholders:
      'Vo vlastnom texte môžete použiť {attribution} pre zdroj mapy a {credit} pre tento portál.',
  },
};

export default sk;

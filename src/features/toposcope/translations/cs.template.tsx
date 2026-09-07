import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const cs: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Umístěte střed růžice tlačítkem ◎ níže.',
  addCenter: 'Umístit střed',
  moveCenter: 'Přesunout střed',
  centerAtMyPosition: 'Vystředit na mou polohu',
  pickCenterPrompt: 'Klikněte do mapy tam, kde růžice stojí',
  addPointsHint:
    'Přidejte kreslené body; z každého se stane paprsek růžice. I střed je kreslený bod — popište a přesouvejte jej v nástroji kreslení.',
  downloadAsSvg: 'Stáhnout jako SVG',
  osmAttribution: '© přispěvatelé OpenStreetMap',
  credit: ({ site }) => `Orientační růžice od ${site}`,
  settings: {
    title: 'Orientační růžice',
    inscriptions: 'Vlastní texty',
    innerCircleRadius: 'Poloměr vnitřní kružnice',
    outerCircleRadius: 'Poloměr vnější kružnice',
    scale: 'Měřítko',
    scaleHint:
      'Velikost textu vůči růžici. Změnou velikosti panelu se mění celá kresba najednou.',
    preventUpturnedText: 'Zabránit textu vzhůru nohama',
    line1: 'První řádek',
    line2: 'Druhý řádek',
    lineHint:
      'K dispozici: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} a {p:nazev} pro libovolnou vlastnost bodu. Část v [hranatých závorkách] se vypíše, jen když má všechno v ní hodnotu, například [{elevation} · ]{distance}.',
    placeholders:
      'Ve vlastním textu můžete použít {attribution} pro zdroj mapy a {credit} pro tento portál.',
  },
};

export default cs;

import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const cs: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Umístěte střed růžice tlačítkem ◎ v panelu nástrojů.',
  addCenter: 'Umístit střed',
  moveCenter: 'Přesunout střed',
  pickCenterPrompt: 'Klikněte do mapy tam, kde růžice stojí',
  addPointsHint:
    'Přidejte kreslené body; z každého se stane paprsek růžice. I střed je kreslený bod — popište a přesouvejte jej v nástroji kreslení.',
  downloadAsSvg: 'Stáhnout jako SVG',
  osmAttribution: '© přispěvatelé OpenStreetMap',
  credit: ({ site }) => `Orientační růžice od ${site}`,
  cardinals: { n: 'S', e: 'V', s: 'J', w: 'Z' },
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
      'K dispozici: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} a {property:nazev} pro libovolnou vlastnost bodu. Chybějící hodnota si s sebou vezme i oddělovač.',
    placeholders:
      'Ve vlastním textu můžete použít {attribution} pro zdroj mapy a {credit} pro tento portál.',
  },
};

export default cs;

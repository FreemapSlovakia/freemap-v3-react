import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const hu: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Helyezze el a tábla középpontját az eszköztár ◎ gombjával.',
  addCenter: 'Középpont elhelyezése',
  moveCenter: 'Középpont áthelyezése',
  pickCenterPrompt: 'Kattintson a térképre oda, ahol a tábla áll',
  addPointsHint:
    'Adjon hozzá rajzolt pontokat; mindegyikből a tábla egy sugara lesz. A középpont is rajzolt pont — a rajzeszközben feliratozhatja és mozgathatja.',
  downloadAsSvg: 'Letöltés SVG-ként',
  osmAttribution: '© OpenStreetMap közreműködők',
  credit: ({ site }) => `Panorámatábla — ${site}`,
  cardinals: { n: 'É', e: 'K', s: 'D', w: 'Ny' },
  settings: {
    title: 'Panorámatábla',
    inscriptions: 'Feliratok',
    innerCircleRadius: 'Belső kör sugara',
    outerCircleRadius: 'Külső kör sugara',
    scale: 'Méretarány',
    scaleHint:
      'A felirat mérete a táblához képest. A panel átméretezése az egész rajzot együtt nagyítja.',
    preventUpturnedText: 'Szöveg megfordulásának megakadályozása',
    line1: 'Első sor',
    line2: 'Második sor',
    lineHint:
      'Használható: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} és {property:nev} a pont bármely tulajdonságához. A hiányzó érték az elválasztóját is elviszi.',
    placeholders:
      'A feliratban az {attribution} a térkép forrását, a {credit} ezt a portált jelöli.',
  },
};

export default hu;

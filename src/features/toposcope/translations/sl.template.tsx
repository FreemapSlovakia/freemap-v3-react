import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { ToposcopeMessages } from './ToposcopeMessages.js';

const sl: DeepPartialWithRequiredObjects<ToposcopeMessages> = {
  pickCenterHint: 'Postavite središče table z gumbom ◎ v orodni vrstici.',
  addCenter: 'Postavi središče',
  moveCenter: 'Premakni središče',
  pickCenterPrompt: 'Kliknite na zemljevid tam, kjer tabla stoji',
  addPointsHint:
    'Dodajte narisane točke; vsaka postane žarek table. Tudi središče je narisana točka — označite in premikajte jo v orodju za risanje.',
  downloadAsSvg: 'Prenesi kot SVG',
  osmAttribution: '© sodelavci OpenStreetMap',
  credit: ({ site }) => `Panoramska tabla — ${site}`,
  settings: {
    title: 'Panoramska tabla',
    inscriptions: 'Napisi',
    innerCircleRadius: 'Polmer notranjega kroga',
    outerCircleRadius: 'Polmer zunanjega kroga',
    scale: 'Merilo',
    scaleHint:
      'Kako velika je pisava glede na tablo. Sprememba velikosti okna poveča celotno risbo skupaj.',
    preventUpturnedText: 'Prepreči obrnjeno besedilo',
    line1: 'Prva vrstica',
    line2: 'Druga vrstica',
    lineHint:
      'Na voljo: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location} in {p:ime} za katero koli lastnost točke. Del v [oglatih oklepajih] se izpiše le, kadar ima vse v njem vrednost, na primer [{elevation} · ]{distance}.',
    placeholders:
      'V napisu lahko uporabite {attribution} za vir zemljevida in {credit} za ta portal.',
  },
};

export default sl;

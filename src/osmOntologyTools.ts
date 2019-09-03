export function resolveTrackSurface(tags: { [key: string]: string }): string {
  if (tags.surface) {
    return tags.surface;
  }
  if (
    [
      'motorway',
      'trunk',
      'primary',
      'secondary',
      'tertiary',
      'service',
      'unclassified',
      'residential',
    ].indexOf(tags.highway) >= 0
  ) {
    return 'asphalt';
  }
  return 'unknown';
}

export function resolveTrackClass(tags: { [key: string]: string }): string {
  if (tags.highway) {
    if (tags.highway === 'track') {
      return tags.tracktype || 'unknown';
    }
    return tags.highway;
  }
  return 'unknown';
}

const trackGradeToBike: { [key: string]: string } = {
  grade1: 'road-bike',
  grade2: 'trekking-bike',
  grade3: 'trekking-bike',
  grade4: 'mtb-bike',
  grade5: 'no-bike',
};

export function resolveBicycleTypeSuitableForTrack(tags: {
  [key: string]: string;
}): string {
  if (['motorway', 'trunk'].indexOf(tags.highway) >= 0) {
    return 'no-bike';
  }

  if (resolveTrackSurface(tags) === 'asphalt') {
    return 'road-bike';
  }

  return (tags.tracktype && trackGradeToBike[tags.tracktype]) || 'unknown';
}

// TODO finish
// const translations = {
//   surface: {
//     asphalt: 'asfalt',
//     gravel: 'štrk',
//     fine_gravel: 'jemný štrk',
//     dirt: 'hlina',
//     ground: 'hlina',
//     cobblestone: 'dlažba',
//     compacted: 'spevnený',
//     paved: 'spevnený',
//     unknown: 'neznámy',
//     unpaved: 'nespevnený',
//     'concrete:plates': 'betónové platne',
//     concrete: 'betón',
//     grass: 'trávnatý',
//   },
//   'track-class': {
//     motorway: 'diaľnica',
//     trunk: 'rýchlostná cesta',
//     primary: 'cesta I. triedy',
//     secondary: 'cesta II. triedy',
//     tertiary: 'cesta III. triedy',
//     service: 'prístupová',
//     unclassified: 'prístupová',
//     residential: 'prístupová',
//     grade1: 'kvalitná spevená cesta (1. stupeň)',
//     grade2: 'udržiavaná spevená cesta  (2. stupeň)',
//     grade3: 'spevená cesta  (3. stupeň)',
//     grade4: 'poľná cesta/zvážnica (4. stupeň)',
//     grade5: 'ťazko priestupná/zarastená cesta (5. stupeň)',
//     path: 'chodník',
//     footway: 'chodník',
//     pedestrian: 'pešia zóna',
//     unknown: 'neznámy',
//   },
//   'bicycle-type': {
//     'road-bike': 'cestný',
//     'trekking-bike': 'trekkingový',
//     'mtb-bike': 'horský',
//     'no-bike': 'vjazd na bicykli zakázaný',
//     unknown: 'neznámy',
//   },
// };
//
// // if no translation is found, return original english key
// export function translate(group, key: string) {
//   if (translations[group]) {
//     const t = translations[group][key];
//     return t || key;
//   }
//   return key;
// }

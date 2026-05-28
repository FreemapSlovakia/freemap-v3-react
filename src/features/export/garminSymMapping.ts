// Mapping between our drawing-point icon specs (poi:<name> / fa:<name>) and
// Garmin GPX `<sym>` values. Garmin and most consumers (BaseCamp, MapSource,
// many handhelds) recognise a fixed catalog of symbol names; emitting them on
// export gives users a recognisable icon on the device. The mapping is
// curated — not every POI or Font Awesome name has a Garmin counterpart, so
// callers fall back to extensions or omit `<sym>` when no entry exists.
//
// Reference: Garmin GPX symbol list (BaseCamp / MapSource defaults), e.g.
// https://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd & community wikis.

import { faSpec, poiSpec } from '@shared/drawingIcons.js';

// poi name (filename stem) -> Garmin sym. Multiple poi entries may share the
// same sym, which is fine for export.
const POI_TO_SYM: Record<string, string> = {
  // food & drink
  restaurant: 'Restaurant',
  fast_food: 'Fast Food',
  cafe: 'Restaurant',
  bar: 'Bar',
  biergarten: 'Bar',
  pub: 'Bar',
  pizza: 'Pizza',
  // shopping
  supermarket: 'Shopping Center',
  shop: 'Shopping Center',
  mall: 'Shopping Center',
  department_store: 'Department Store',
  convenience: 'Convenience Store',
  // services
  atm: 'ATM',
  bank: 'Bank',
  post_office: 'Post Office',
  pharmacy: 'Pharmacy',
  telephone: 'Telephone',
  information: 'Information',
  // accommodation
  hotel: 'Lodging',
  motel: 'Lodging',
  hostel: 'Lodging',
  guest_house: 'Lodging',
  apartment: 'Residence',
  alpine_hut: 'Lodging',
  basic_hut: 'Lodging',
  chalet: 'Lodging',
  // worship
  church: 'Church',
  chapel: 'Church',
  // health
  hospital: 'Medical Facility',
  doctors: 'Medical Facility',
  dentist: 'Medical Facility',
  defibrillator: 'Medical Facility',
  // transport
  fuel: 'Gas Station',
  charging_station: 'Gas Station',
  parking: 'Parking Area',
  car: 'Car',
  car_repair: 'Car Repair',
  car_wash: 'Car Repair',
  bus_station: 'Bus Station',
  bus_stop: 'Bus Station',
  ferry_terminal: 'Marina',
  // education
  school: 'School',
  college: 'School',
  kindergarten: 'School',
  // recreation & nature
  park: 'Park',
  camp_site: 'Campground',
  picnic_site: 'Picnic Area',
  picnic_table: 'Picnic Area',
  peak: 'Summit',
  viewpoint: 'Scenic Area',
  attraction: 'Scenic Area',
  beach: 'Beach',
  forest: 'Forest',
  // landmarks
  museum: 'Museum',
  cinema: 'Movie Theater',
  theatre: 'Movie Theater',
  stadium: 'Stadium',
  cemetery: 'Cemetery',
  zoo: 'ZOO',
  // utilities & infrastructure
  drinking_water: 'Drinking Water',
  drinking_spring: 'Drinking Water',
  toilets: 'Restroom',
  shower: 'Shower',
  dam: 'Dam',
  bridge: 'Bridge',
  tunnel: 'Tunnel',
  building: 'Building',
  lighthouse: 'Beacon',
  // emergency
  police: 'Police Station',
  fire_station: 'Civil',
  danger: 'Danger Area',
  // sports
  golf_course: 'Golf Course',
  bowling_alley: 'Bowling',
  fishing: 'Fishing Area',
  swimming: 'Swimming Area',
  swimming_pool: 'Swimming Area',
  water_park: 'Swimming Area',
  skiing: 'Skiing Area',
  fitness_centre: 'Fitness Center',
  // aviation/marine
  aerodrome: 'Heliport',
  helipad: 'Heliport',
  marina: 'Marina',
  wreck: 'Shipwreck',
};

// Font Awesome solid `iconName` -> Garmin sym.
const FA_TO_SYM: Record<string, string> = {
  anchor: 'Anchor',
  bell: 'Bell',
  bus: 'Bus Station',
  campground: 'Campground',
  car: 'Car',
  'car-side': 'Car',
  church: 'Church',
  fish: 'Fishing Area',
  flag: 'Flag, Red',
  'flag-checkered': 'Flag, Red',
  futbol: 'Stadium',
  'gas-pump': 'Gas Station',
  gift: 'Shopping Center',
  golf: 'Golf Course',
  'graduation-cap': 'School',
  helicopter: 'Heliport',
  hospital: 'Medical Facility',
  hotel: 'Lodging',
  house: 'Residence',
  home: 'Residence',
  info: 'Information',
  'info-circle': 'Information',
  'map-pin': 'Pin, Red',
  mountain: 'Summit',
  'mug-hot': 'Restaurant',
  parking: 'Parking Area',
  phone: 'Telephone',
  plane: 'Heliport',
  'shopping-cart': 'Shopping Center',
  shower: 'Shower',
  skiing: 'Skiing Area',
  skull: 'Skull and Crossbones',
  'skull-crossbones': 'Skull and Crossbones',
  ship: 'Marina',
  store: 'Shopping Center',
  swimmer: 'Swimming Area',
  'swimming-pool': 'Swimming Area',
  tree: 'Forest',
  trees: 'Forest',
  truck: 'Truck Stop',
  utensils: 'Knife & Fork',
  warning: 'Danger Area',
  'exclamation-triangle': 'Danger Area',
};

// Reverse: Garmin sym -> our preferred icon spec. Where both a poi and an fa
// map to the same sym, poi wins (richer artwork). Garmin sym names are
// matched case-insensitively to be lenient about consumer variations.
const SYM_TO_SPEC: Map<string, string> = (() => {
  const m = new Map<string, string>();

  // fa first so poi can overwrite
  for (const [name, sym] of Object.entries(FA_TO_SYM)) {
    m.set(sym.toLowerCase(), faSpec(name));
  }

  for (const [name, sym] of Object.entries(POI_TO_SYM)) {
    m.set(sym.toLowerCase(), poiSpec(name));
  }

  // a few extra incoming aliases that don't appear as values above
  const aliases: Record<string, string> = {
    waypoint: poiSpec('information'),
    flag: faSpec('flag'),
    'flag, blue': faSpec('flag'),
    'flag, green': faSpec('flag'),
    'pin, blue': faSpec('map-pin'),
    'pin, green': faSpec('map-pin'),
    summit: poiSpec('peak'),
    'scenic area': poiSpec('viewpoint'),
    airport: poiSpec('aerodrome'),
  };

  for (const [k, v] of Object.entries(aliases)) {
    if (!m.has(k)) {
      m.set(k, v);
    }
  }

  return m;
})();

/**
 * Maps a drawing-point `icon` spec to a Garmin `<sym>` value, or undefined if
 * no well-known mapping exists. `text:<...>` (raw text label) returns nothing
 * because there's no symbol equivalent.
 */
export function iconSpecToGarminSym(
  icon: string | undefined,
): string | undefined {
  if (!icon) {
    return undefined;
  }

  if (icon.startsWith('poi:')) {
    return POI_TO_SYM[icon.slice(4)];
  }

  if (icon.startsWith('fa:')) {
    return FA_TO_SYM[icon.slice(3)];
  }

  return undefined;
}

/**
 * Maps a Garmin `<sym>` value back to a drawing-point icon spec. Matching is
 * case-insensitive. Returns undefined when the sym is not recognised; callers
 * then leave the drawing point's icon unset.
 */
export function garminSymToIconSpec(
  sym: string | undefined,
): string | undefined {
  if (!sym) {
    return undefined;
  }

  return SYM_TO_SPEC.get(sym.trim().toLowerCase());
}

// Garmin sym values from the BaseCamp / MapSource catalog that we do not yet
// map either direction. Most are listed because we have no matching poi/fa
// icon (e.g. nautical Navaid variants, model-specific markers, geocaching
// flags). Add a poi/fa entry to the dictionaries above when we ship an icon
// that's a good fit.
//
// Devices/recreation:
//   Amusement Park, Bike Trail, Block (Blue/Green/Red), Border Crossing,
//   Car Rental, Circle (x-Large/x-Small), City (Capitol/Large/Medium/Small),
//   Controlled Area, Cover, Crossing, Diver Down Flag 1, Diver Down Flag 2,
//   Drive-Through, Exit, Flag (Blue/Green only — Red maps via fa:flag),
//   Geocache, Geocache Found, Glider Area, Ground Transportation, Horn,
//   Hunting Area, Levee, Light, Lighthouse (we use poi:lighthouse -> Beacon),
//   Man Overboard, Mile Marker, Military, Mine, Mobile Winter Recreation,
//   Oil Field, Pin (Blue/Green — Red maps via fa:map-pin), Private Field,
//   Radio Beacon, Restricted Area, RV Park, Scales, Seaplane Base, Short Tower,
//   Soft Field, Tall Tower, Toll Booth, TracBack Point, Trail Head, Tunnel,
//   Ultralight Area, Water Hydrant, Waypoint, Weigh Station, Wrecker
// Nautical/aviation Navaid colour variants (mostly used on marine maps):
//   Navaid Amber/Black/Blue/Green/Green-Red/Green-White/Orange/Red/
//   Red-Green/Red-White/Violet/White/White-Green/White-Red
// Marine activities:
//   Anchor Prohibited, Boat Ramp, Buoy Ambr/Black/Blue/Green/etc.,
//   Coast Guard, Controlled, Dam (already mapped), Fish Cleaning Station,
//   Fishing Hot Spot Facility, Free 24 hr, Open 24 Hours, Restaurant Bait
// Activities (Garmin Connect):
//   Activity-related symbols like Run, Hike, Bike, Climbing, Kayak, Snowboard
//   tend to be encoded via Garmin's TrackPointExtension rather than <sym>.

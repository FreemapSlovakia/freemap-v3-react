// Mapping between our drawing-point icon specs and OsmAnd's GPX waypoint
// extensions (`<osmand:icon>`, `<osmand:background>`, `<osmand:color>`).
// OsmAnd ships a large named icon catalog (mostly mirroring OSM tag values
// like `amenity_restaurant`, `tourism_museum`, `historic_castle`, …) and a
// fixed background-shape vocabulary that lines up well with our markerType.
//
// Reference: OsmAnd GPX format docs and the in-app icon picker. Names follow
// the `<key>_<value>` convention used throughout OsmAnd's POI rendering.

import type { MarkerType } from '@features/objects/model/actions.js';
import { faSpec, poiSpec } from '@shared/drawingIcons.js';

// markerType <-> OsmAnd background. OsmAnd's valid values are exactly these
// three; we render `pin` as `octagon` since OsmAnd has no pointed-pin shape.
const MARKER_TYPE_TO_BACKGROUND: Record<MarkerType, string> = {
  pin: 'octagon',
  square: 'square',
  ring: 'circle',
};

const BACKGROUND_TO_MARKER_TYPE: Record<string, MarkerType> = {
  octagon: 'pin',
  square: 'square',
  circle: 'ring',
};

export function markerTypeToOsmAndBackground(
  markerType: MarkerType | undefined,
): string | undefined {
  return markerType ? MARKER_TYPE_TO_BACKGROUND[markerType] : undefined;
}

export function osmAndBackgroundToMarkerType(
  background: string | undefined,
): MarkerType | undefined {
  if (!background) {
    return undefined;
  }

  return BACKGROUND_TO_MARKER_TYPE[background.trim().toLowerCase()];
}

// poi name (filename stem) -> OsmAnd icon name. The OsmAnd catalog mostly
// follows `<osmkey>_<value>`, so many of our poi names map directly with a
// well-known prefix.
const POI_TO_OSMAND: Record<string, string> = {
  // food & drink
  restaurant: 'amenity_restaurant',
  fast_food: 'amenity_fast_food',
  cafe: 'amenity_cafe',
  bar: 'amenity_bar',
  pub: 'amenity_pub',
  biergarten: 'amenity_biergarten',
  pizza: 'amenity_restaurant',
  ice_cream: 'amenity_ice_cream',
  // shopping
  supermarket: 'shop_supermarket',
  shop: 'shop_convenience',
  mall: 'shop_mall',
  department_store: 'shop_department_store',
  convenience: 'shop_convenience',
  bakery: 'shop_bakery',
  butcher: 'shop_butcher',
  clothes: 'shop_clothes',
  bookmaker: 'shop_bookmaker',
  book: 'shop_books',
  alcohol: 'shop_alcohol',
  beverages: 'shop_beverages',
  bicycle: 'shop_bicycle',
  florist: 'shop_florist',
  chemist: 'shop_chemist',
  // services
  atm: 'amenity_atm',
  bank: 'amenity_bank',
  bureau_de_change: 'amenity_bureau_de_change',
  post_office: 'amenity_post_office',
  pharmacy: 'amenity_pharmacy',
  telephone: 'amenity_telephone',
  information: 'tourism_information',
  // accommodation
  hotel: 'tourism_hotel',
  motel: 'tourism_motel',
  hostel: 'tourism_hostel',
  guest_house: 'tourism_guest_house',
  apartment: 'tourism_apartment',
  alpine_hut: 'tourism_alpine_hut',
  basic_hut: 'tourism_wilderness_hut',
  chalet: 'tourism_chalet',
  // worship
  church: 'amenity_place_of_worship',
  chapel: 'amenity_place_of_worship',
  // health
  hospital: 'amenity_hospital',
  doctors: 'amenity_doctors',
  dentist: 'amenity_dentist',
  defibrillator: 'emergency_defibrillator',
  // transport
  fuel: 'amenity_fuel',
  charging_station: 'amenity_charging_station',
  parking: 'amenity_parking',
  bicycle_parking: 'amenity_bicycle_parking',
  bicycle_rental: 'amenity_bicycle_rental',
  bicycle_repair_station: 'amenity_bicycle_repair_station',
  car: 'shop_car',
  car_repair: 'shop_car_repair',
  car_wash: 'amenity_car_wash',
  bus_station: 'amenity_bus_station',
  bus_stop: 'highway_bus_stop',
  ferry_terminal: 'amenity_ferry_terminal',
  taxi: 'amenity_taxi',
  // education
  school: 'amenity_school',
  college: 'amenity_college',
  university: 'amenity_university',
  kindergarten: 'amenity_kindergarten',
  library: 'amenity_library',
  // recreation & nature
  park: 'leisure_park',
  playground: 'leisure_playground',
  camp_site: 'tourism_camp_site',
  picnic_site: 'tourism_picnic_site',
  picnic_table: 'tourism_picnic_site',
  bbq: 'amenity_bbq',
  peak: 'natural_peak',
  volcano: 'natural_volcano',
  viewpoint: 'tourism_viewpoint',
  attraction: 'tourism_attraction',
  beach: 'natural_beach',
  forest: 'natural_wood',
  tree: 'natural_tree',
  spring: 'natural_spring',
  cave_entrance: 'natural_cave_entrance',
  // landmarks
  museum: 'tourism_museum',
  artwork: 'tourism_artwork',
  cinema: 'amenity_cinema',
  theatre: 'amenity_theatre',
  arts_centre: 'amenity_arts_centre',
  community_centre: 'amenity_community_centre',
  stadium: 'leisure_stadium',
  cemetery: 'amenity_grave_yard',
  zoo: 'tourism_zoo',
  // historic
  castle: 'historic_castle',
  archaeological_site: 'historic_archaeological_site',
  monument: 'historic_monument',
  memorial: 'historic_memorial',
  ruins: 'historic_ruins',
  cross: 'historic_wayside_cross',
  wayside_shrine: 'historic_wayside_shrine',
  // utilities & infrastructure
  drinking_water: 'amenity_drinking_water',
  drinking_spring: 'amenity_drinking_water',
  toilets: 'amenity_toilets',
  shower: 'amenity_shower',
  dam: 'waterway_dam',
  bridge: 'man_made_bridge',
  tunnel: 'highway_tunnel',
  building: 'building',
  lighthouse: 'man_made_lighthouse',
  antenna: 'man_made_antenna',
  mast: 'man_made_mast',
  water_tower: 'man_made_water_tower',
  windmill: 'man_made_windmill',
  chimney: 'man_made_chimney',
  // emergency
  police: 'amenity_police',
  fire_station: 'amenity_fire_station',
  danger: 'special_warning',
  // sports
  golf_course: 'leisure_golf_course',
  bowling_alley: 'leisure_bowling_alley',
  fishing: 'leisure_fishing',
  swimming: 'leisure_swimming_area',
  swimming_pool: 'leisure_swimming_pool',
  water_park: 'leisure_water_park',
  skiing: 'leisure_ski',
  fitness_centre: 'leisure_fitness_centre',
  // aviation/marine
  aerodrome: 'aeroway_aerodrome',
  helipad: 'aeroway_helipad',
  marina: 'leisure_marina',
  wreck: 'historic_wreck',
  // places
  city: 'place_city',
  town: 'place_town',
  village: 'place_village',
};

// Font Awesome solid `iconName` -> OsmAnd icon. We pick the closest semantic
// match from OsmAnd's catalog; many fa icons have no direct equivalent and
// are mapped to the `special_*` set or omitted.
const FA_TO_OSMAND: Record<string, string> = {
  anchor: 'special_anchor',
  bell: 'special_bell',
  bus: 'amenity_bus_station',
  campground: 'tourism_camp_site',
  car: 'shop_car',
  'car-side': 'shop_car',
  camera: 'tourism_viewpoint',
  church: 'amenity_place_of_worship',
  fish: 'leisure_fishing',
  flag: 'special_flag_red',
  'flag-checkered': 'special_flag_red',
  futbol: 'leisure_stadium',
  'gas-pump': 'amenity_fuel',
  gift: 'shop_gift',
  golf: 'leisure_golf_course',
  'graduation-cap': 'amenity_school',
  helicopter: 'aeroway_helipad',
  hospital: 'amenity_hospital',
  hotel: 'tourism_hotel',
  house: 'special_house',
  home: 'special_house',
  info: 'tourism_information',
  'info-circle': 'tourism_information',
  'map-pin': 'special_marker',
  mountain: 'natural_peak',
  'mug-hot': 'amenity_cafe',
  parking: 'amenity_parking',
  phone: 'amenity_telephone',
  plane: 'aeroway_aerodrome',
  'shopping-cart': 'shop_supermarket',
  shower: 'amenity_shower',
  skiing: 'leisure_ski',
  skull: 'special_skull',
  'skull-crossbones': 'special_skull',
  ship: 'leisure_marina',
  star: 'special_star',
  store: 'shop_convenience',
  swimmer: 'leisure_swimming_area',
  'swimming-pool': 'leisure_swimming_pool',
  tree: 'natural_tree',
  trees: 'natural_wood',
  truck: 'amenity_truck_stop',
  utensils: 'amenity_restaurant',
  warning: 'special_warning',
  'exclamation-triangle': 'special_warning',
};

// Reverse: OsmAnd icon -> our preferred icon spec. poi wins where both
// could apply (richer artwork). Names are matched case-insensitively.
const OSMAND_TO_SPEC: Map<string, string> = (() => {
  const m = new Map<string, string>();

  // fa first so poi can overwrite
  for (const [name, osmand] of Object.entries(FA_TO_OSMAND)) {
    m.set(osmand.toLowerCase(), faSpec(name));
  }

  for (const [name, osmand] of Object.entries(POI_TO_OSMAND)) {
    m.set(osmand.toLowerCase(), poiSpec(name));
  }

  return m;
})();

/**
 * Maps a drawing-point `icon` spec to an OsmAnd icon name, or undefined when
 * no curated mapping exists. Literal-text icon specs return nothing.
 */
export function iconSpecToOsmAndIcon(
  icon: string | undefined,
): string | undefined {
  if (!icon) {
    return undefined;
  }

  if (icon.startsWith('poi:')) {
    return POI_TO_OSMAND[icon.slice(4)];
  }

  if (icon.startsWith('fa:')) {
    return FA_TO_OSMAND[icon.slice(3)];
  }

  return undefined;
}

/**
 * Maps an OsmAnd icon name back to a drawing-point icon spec. Matching is
 * case-insensitive; returns undefined if unrecognised.
 */
export function osmAndIconToIconSpec(
  icon: string | undefined,
): string | undefined {
  if (!icon) {
    return undefined;
  }

  return OSMAND_TO_SPEC.get(icon.trim().toLowerCase());
}

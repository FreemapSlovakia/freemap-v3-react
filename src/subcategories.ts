interface Subcategory {
  id: number;
  categoryId: number;
  filename: string;
  union?: boolean;
  filter: {
    key: string;
    value?: string;
    operation?: string;
    keyOperation?: string;
  }[];
}

export const subcategories: Subcategory[] = [
  {
    id: 1,
    categoryId: 1,
    filename: 'cave_entrance',
    filter: [
      {
        key: 'natural',
        value: 'cave_entrance',
      },
    ],
  },
  {
    id: 2,
    categoryId: 1,
    filename: 'peak',
    filter: [
      {
        key: 'natural',
        value: 'peak',
      },
    ],
  },
  {
    id: 3,
    categoryId: 2,
    filename: 'fuel',
    filter: [
      {
        key: 'amenity',
        value: 'fuel',
      },
    ],
  },
  {
    id: 4,
    categoryId: 8,
    filename: 'restaurant',
    filter: [
      {
        key: 'amenity',
        value: 'restaurant',
      },
    ],
  },
  {
    id: 5,
    categoryId: 8,
    filename: 'hotel',
    filter: [
      {
        key: 'tourism',
        value: 'hotel',
      },
    ],
  },
  {
    id: 6,
    categoryId: 2,
    filename: 'parking',
    filter: [
      {
        key: 'amenity',
        value: 'parking',
      },
    ],
  },
  {
    id: 7,
    categoryId: 3,
    filename: 'airport',
    filter: [
      {
        key: 'aeroway',
        value: 'aerodrome',
      },
    ],
  },
  {
    id: 8,
    categoryId: 3,
    filename: 'train',
    filter: [
      {
        key: 'railway',
        value: 'station',
      },
    ],
  },
  {
    id: 9,
    categoryId: 3,
    filename: 'bus_station',
    filter: [
      {
        key: 'amenity',
        value: 'bus_station',
      },
    ],
  },
  {
    id: 10,
    categoryId: 3,
    filename: 'bus_stop',
    filter: [
      {
        keyOperation: '~',
        key: '^(highway|amenity)$',
        value: 'bus_stop',
      },
    ],
  },
  {
    id: 11,
    categoryId: 4,
    filename: 'castle',
    filter: [
      {
        key: 'historic',
        value: 'castle',
      },
      {
        key: 'ruins',
        operation: '!=',
        value: 'no',
      },
    ],
  },
  {
    id: 12,
    categoryId: 4,
    filename: 'chateau',
    filter: [
      {
        key: 'historic',
        value: 'chateau',
      },
      {
        key: 'ruins',
        operation: '!=',
        value: 'no',
      },
    ],
  },
  {
    id: 13,
    categoryId: 4,
    filename: 'ruins',
    filter: [
      {
        key: 'historic',
        value: '*',
      },
      {
        key: 'ruins',
        value: 'yes',
      },
    ],
  },
  {
    id: 14,
    categoryId: 4,
    filename: 'museum',
    filter: [
      {
        key: 'tourism',
        value: 'museum',
      },
    ],
  },
  {
    id: 15,
    categoryId: 4,
    filename: 'monument',
    filter: [
      {
        key: 'historic',
        value: 'monument',
      },
      {
        key: 'ruins',
        operation: '!=',
        value: 'no',
      },
    ],
  },
  {
    id: 16,
    categoryId: 4,
    filename: 'memorial',
    filter: [
      {
        key: 'historic',
        value: 'memorial',
      },
      {
        key: 'ruins',
        operation: '!=',
        value: 'no',
      },
    ],
  },
  {
    id: 17,
    categoryId: 5,
    filename: 'pharmacy',
    filter: [
      {
        key: 'amenity',
        value: 'pharmacy',
      },
    ],
  },
  {
    id: 18,
    categoryId: 5,
    filename: 'hospital',
    filter: [
      {
        key: 'amenity',
        value: 'hospital',
      },
    ],
  },
  {
    id: 19,
    categoryId: 5,
    filename: 'doctor',
    filter: [
      {
        key: 'amenity',
        value: 'doctors',
      },
    ],
  },
  {
    id: 20,
    categoryId: 2,
    filename: 'police',
    filter: [
      {
        key: 'amenity',
        value: 'police',
      },
    ],
  },
  {
    id: 21,
    categoryId: 5,
    filename: 'clinic',
    filter: [
      {
        key: 'amenity',
        value: 'clinic',
      },
    ],
  },
  {
    id: 22,
    categoryId: 3,
    filename: 'border_control',
    filter: [
      {
        key: 'amenity',
        value: 'border_control',
      },
    ],
  },
  {
    id: 23,
    categoryId: 5,
    filename: 'emergency',
    filter: [
      {
        key: 'amenity',
        value: 'hospital',
      },
      {
        key: 'emergency',
        value: 'yes',
      },
    ],
  },
  {
    id: 24,
    categoryId: 6,
    filename: 'supermarket',
    filter: [
      {
        key: 'shop',
        value: 'supermarket',
      },
    ],
  },
  {
    id: 26,
    categoryId: 7,
    filename: 'nuclear',
    filter: [
      {
        key: 'power',
        value: 'generator',
      },
      {
        key: 'generator:source',
        value: 'nuclear',
      },
    ],
  },
  {
    id: 27,
    categoryId: 7,
    filename: 'fossil',
    filter: [
      {
        key: 'power',
        value: 'generator',
      },
      {
        key: 'generator:source',
        value: 'coal',
      },
    ],
  },
  {
    id: 28,
    categoryId: 7,
    filename: 'hydro',
    filter: [
      {
        key: 'power',
        value: 'generator',
      },
      {
        key: 'generator:source',
        value: 'hydro',
      },
    ],
  },
  {
    id: 29,
    categoryId: 7,
    filename: 'wind',
    filter: [
      {
        key: 'power',
        value: 'generator',
      },
      {
        key: 'generator:source',
        value: 'wind',
      },
    ],
  },
  {
    id: 30,
    categoryId: 6,
    filename: 'convenience',
    filter: [
      {
        key: 'shop',
        value: 'convenience',
      },
    ],
  },
  {
    id: 31,
    categoryId: 2,
    filename: 'firestation',
    filter: [
      {
        key: 'amenity',
        value: 'fire_station',
      },
    ],
  },
  {
    id: 32,
    categoryId: 4,
    filename: 'place_of_worship',
    filter: [
      {
        key: 'amenity',
        value: 'place_of_worship',
      },
      {
        key: 'building',
        operation: '~',
        value: '^(church|cathedral)$',
      },
    ],
  },
  {
    id: 33,
    categoryId: 8,
    filename: 'pub',
    filter: [
      {
        key: 'amenity',
        value: 'pub',
      },
    ],
  },
  {
    id: 34,
    categoryId: 2,
    filename: 'bank',
    filter: [
      {
        key: 'amenity',
        value: 'bank',
      },
      {
        key: 'atm',
        operation: '!=',
        value: 'no',
      },
    ],
  },
  {
    id: 35,
    categoryId: 2,
    filename: 'atm',
    filter: [
      {
        key: 'amenity',
        value: 'atm',
      },
    ],
  },
  {
    id: 36,
    categoryId: 8,
    filename: 'fast_food',
    filter: [
      {
        key: 'amenity',
        value: 'fast_food',
      },
    ],
  },
  {
    id: 39,
    categoryId: 2,
    filename: 'bank',
    filter: [
      {
        key: 'amenity',
        value: 'bank',
      },
      {
        key: 'atm',
        value: 'yes',
      },
    ],
  },
  {
    id: 40,
    categoryId: 1,
    filename: 'viewpoint',
    filter: [
      {
        key: 'tourism',
        value: 'viewpoint',
      },
    ],
  },
  {
    id: 41,
    categoryId: 8,
    filename: 'camping',
    filter: [
      {
        key: 'tourism',
        value: 'camp_site',
      },
    ],
  },
  {
    id: 42,
    categoryId: 1,
    filename: 'protected_tree',
    filter: [
      {
        key: 'natural',
        value: 'tree',
      },
      {
        key: 'protected',
        value: 'yes',
      },
    ],
  },
  {
    id: 43,
    categoryId: 1,
    filename: 'spring',
    filter: [
      {
        key: 'natural',
        value: 'spring',
      },
    ],
  },
  {
    id: 44,
    categoryId: 9,
    filename: 'stand',
    filter: [
      {
        key: 'information',
        value: 'guidepost',
      },
      {
        key: 'hiking',
        value: 'yes',
      },
    ],
  },
  {
    id: 45,
    categoryId: 9,
    filename: 'map',
    filter: [
      {
        key: 'marked_trail',
        value: 'map',
      },
    ],
  },
  {
    id: 46,
    categoryId: 9,
    filename: 'wilderness_hut',
    filter: [
      {
        key: 'tourism',
        value: 'wilderness_hut',
      },
    ],
  },
  {
    id: 47,
    categoryId: 9,
    filename: 'shelter',
    filter: [
      {
        key: 'amenity',
        value: 'shelter',
      },
    ],
  },
  {
    id: 48,
    categoryId: 2,
    filename: 'post_office',
    filter: [
      {
        key: 'amenity',
        value: 'post_office',
      },
    ],
  },
  {
    id: 49,
    categoryId: 4,
    filename: 'battlefield',
    filter: [
      {
        key: 'historic',
        value: 'battlefield',
      },
    ],
  },
  {
    id: 50,
    categoryId: 9,
    filename: 'hunting_stand',
    filter: [
      {
        key: 'amenity',
        value: 'hunting_stand',
      },
    ],
  },
  {
    id: 51,
    categoryId: 11,
    filename: 'tower_communication',
    filter: [
      {
        key: 'man_made',
        value: 'tower',
      },
      {
        key: 'tower:type',
        value: 'communication',
      },
    ],
  },
  {
    id: 52,
    categoryId: 9,
    filename: 'tower_observation',
    filter: [
      {
        key: 'man_made',
        value: 'tower',
      },
      {
        key: 'tower:type',
        value: 'observation',
      },
    ],
  },
  {
    id: 53,
    categoryId: 8,
    filename: 'motel',
    filter: [
      {
        key: 'tourism',
        value: 'motel',
      },
    ],
  },
  {
    id: 54,
    categoryId: 8,
    filename: 'guest_house',
    filter: [
      {
        key: 'tourism',
        value: 'guest_house',
      },
    ],
  },
  {
    id: 55,
    categoryId: 8,
    filename: 'hostel',
    filter: [
      {
        key: 'tourism',
        value: 'hostel',
      },
    ],
  },
  {
    id: 56,
    categoryId: 10,
    filename: 'region',
    filter: [
      {
        key: 'place',
        value: 'city',
      },
      {
        key: 'city_type',
        value: 'region_city',
      },
    ],
  },
  {
    id: 57,
    categoryId: 10,
    filename: 'county',
    filter: [
      {
        key: 'place',
        value: 'town',
      },
      {
        key: 'city_type',
        value: 'county_city',
      },
    ],
  },
  {
    id: 58,
    categoryId: 10,
    filename: 'city',
    filter: [
      {
        key: 'place',
        value: 'city',
      },
      {
        keyOperation: '!',
        key: 'city_type',
      },
    ],
  },
  {
    id: 59,
    categoryId: 10,
    filename: 'town',
    filter: [
      {
        key: 'place',
        value: 'town',
      },
      {
        keyOperation: '!',
        key: 'city_type',
      },
    ],
  },
  {
    id: 60,
    categoryId: 10,
    filename: 'village',
    filter: [
      {
        key: 'place',
        value: 'village',
      },
    ],
  },
  {
    id: 61,
    categoryId: 10,
    filename: 'hamlet',
    filter: [
      {
        key: 'place',
        value: 'hamlet',
      },
    ],
  },
  {
    id: 62,
    categoryId: 10,
    filename: 'suburb',
    filter: [
      {
        key: 'place',
        value: 'suburb',
      },
    ],
  },
  {
    id: 63,
    categoryId: 9,
    filename: 'ranger_house',
    filter: [
      {
        key: 'amenity',
        value: 'ranger_house',
      },
    ],
  },
  {
    id: 64,
    categoryId: 5,
    filename: 'dentist',
    filter: [
      {
        key: 'amenity',
        value: 'dentist',
      },
    ],
  },
  {
    id: 65,
    categoryId: 15,
    filename: 'bicycle',
    filter: [
      {
        key: 'shop',
        value: 'bicycle',
      },
    ],
  },
  {
    id: 66,
    categoryId: 15,
    filename: 'bicycle_parking',
    filter: [
      {
        key: 'amenity',
        value: 'bicycle_parking',
      },
    ],
  },
  {
    id: 67,
    categoryId: 15,
    filename: 'bicycle_rental',
    filter: [
      {
        key: 'amenity',
        value: 'bicycle_rental',
      },
    ],
  },
  {
    id: 68,
    categoryId: 6,
    filename: 'alcohol',
    filter: [
      {
        key: 'shop',
        value: 'alcohol',
      },
    ],
  },
  {
    id: 69,
    categoryId: 6,
    filename: 'art',
    filter: [
      {
        key: 'shop',
        value: 'art',
      },
    ],
  },
  {
    id: 70,
    categoryId: 6,
    filename: 'bakery',
    filter: [
      {
        key: 'shop',
        value: 'bakery',
      },
    ],
  },
  {
    id: 71,
    categoryId: 6,
    filename: 'beauty',
    filter: [
      {
        key: 'shop',
        value: 'beauty',
      },
    ],
  },
  {
    id: 72,
    categoryId: 6,
    filename: 'bed',
    filter: [
      {
        key: 'shop',
        value: 'bed',
      },
    ],
  },
  {
    id: 73,
    categoryId: 6,
    filename: 'beverages',
    filter: [
      {
        key: 'shop',
        value: 'beverages',
      },
    ],
  },
  {
    id: 74,
    categoryId: 6,
    filename: 'books',
    filter: [
      {
        key: 'shop',
        value: 'books',
      },
    ],
  },
  {
    id: 75,
    categoryId: 6,
    filename: 'boutique',
    filter: [
      {
        key: 'shop',
        value: 'boutique',
      },
    ],
  },
  {
    id: 76,
    categoryId: 6,
    filename: 'butcher',
    filter: [
      {
        key: 'shop',
        value: 'butcher',
      },
    ],
  },
  {
    id: 77,
    categoryId: 6,
    filename: 'car',
    filter: [
      {
        key: 'shop',
        value: 'car',
      },
    ],
  },
  {
    id: 78,
    categoryId: 6,
    filename: 'car_repair',
    filter: [
      {
        key: 'shop',
        value: 'car_repair',
      },
    ],
  },
  {
    id: 79,
    categoryId: 6,
    filename: 'charity',
    filter: [
      {
        key: 'shop',
        value: 'charity',
      },
    ],
  },
  {
    id: 80,
    categoryId: 6,
    filename: 'chemist',
    filter: [
      {
        key: 'shop',
        value: 'chemist',
      },
    ],
  },
  {
    id: 81,
    categoryId: 6,
    filename: 'clothes',
    filter: [
      {
        key: 'shop',
        value: 'clothes',
      },
    ],
  },
  {
    id: 82,
    categoryId: 6,
    filename: 'computer',
    filter: [
      {
        key: 'shop',
        value: 'computer',
      },
    ],
  },
  {
    id: 83,
    categoryId: 6,
    filename: 'confectionery',
    filter: [
      {
        key: 'shop',
        value: 'confectionery',
      },
    ],
  },
  {
    id: 84,
    categoryId: 6,
    filename: 'copyshop',
    filter: [
      {
        key: 'shop',
        value: 'copyshop',
      },
    ],
  },
  {
    id: 85,
    categoryId: 6,
    filename: 'curtain',
    filter: [
      {
        key: 'shop',
        value: 'curtain',
      },
    ],
  },
  {
    id: 86,
    categoryId: 6,
    filename: 'deli',
    filter: [
      {
        key: 'shop',
        value: 'deli',
      },
    ],
  },
  {
    id: 87,
    categoryId: 6,
    filename: 'department_store',
    filter: [
      {
        key: 'shop',
        value: 'department_store',
      },
    ],
  },
  {
    id: 89,
    categoryId: 6,
    filename: 'dry_cleaning',
    filter: [
      {
        key: 'shop',
        value: 'dry_cleaning',
      },
    ],
  },
  {
    id: 90,
    categoryId: 6,
    filename: 'doityourself',
    filter: [
      {
        key: 'shop',
        value: 'doityourself',
      },
    ],
  },
  {
    id: 91,
    categoryId: 6,
    filename: 'electronics',
    filter: [
      {
        key: 'shop',
        value: 'electronics',
      },
    ],
  },
  {
    id: 92,
    categoryId: 6,
    filename: 'erotic',
    filter: [
      {
        key: 'shop',
        value: 'erotic',
      },
    ],
  },
  {
    id: 93,
    categoryId: 6,
    filename: 'fabric',
    filter: [
      {
        key: 'shop',
        value: 'fabric',
      },
    ],
  },
  {
    id: 94,
    categoryId: 6,
    filename: 'farm',
    filter: [
      {
        key: 'shop',
        value: 'farm',
      },
    ],
  },
  {
    id: 95,
    categoryId: 6,
    filename: 'florist',
    filter: [
      {
        key: 'shop',
        value: 'florist',
      },
    ],
  },
  {
    id: 96,
    categoryId: 6,
    filename: 'frame',
    filter: [
      {
        key: 'shop',
        value: 'frame',
      },
    ],
  },
  {
    id: 98,
    categoryId: 6,
    filename: 'funeral_directors',
    filter: [
      {
        key: 'shop',
        value: 'funeral_directors',
      },
    ],
  },
  {
    id: 99,
    categoryId: 6,
    filename: 'furniture',
    filter: [
      {
        key: 'shop',
        value: 'furniture',
      },
    ],
  },
  {
    id: 100,
    categoryId: 6,
    filename: 'garden_centre',
    filter: [
      {
        key: 'shop',
        value: 'garden_centre',
      },
    ],
  },
  {
    id: 101,
    categoryId: 6,
    filename: 'general',
    filter: [
      {
        key: 'shop',
        value: 'general',
      },
    ],
  },
  {
    id: 102,
    categoryId: 6,
    filename: 'gift',
    filter: [
      {
        key: 'shop',
        value: 'gift',
      },
    ],
  },
  {
    id: 103,
    categoryId: 6,
    filename: 'glaziery',
    filter: [
      {
        key: 'shop',
        value: 'glaziery',
      },
    ],
  },
  {
    id: 104,
    categoryId: 6,
    filename: 'greengrocer',
    filter: [
      {
        key: 'shop',
        value: 'greengrocer',
      },
    ],
  },
  {
    id: 105,
    categoryId: 6,
    filename: 'hairdresser',
    filter: [
      {
        key: 'shop',
        value: 'hairdresser',
      },
    ],
  },
  {
    id: 106,
    categoryId: 6,
    filename: 'hardware',
    filter: [
      {
        key: 'shop',
        value: 'hardware',
      },
    ],
  },
  {
    id: 107,
    categoryId: 6,
    filename: 'hearing_aids',
    filter: [
      {
        key: 'shop',
        value: 'hearing_aids',
      },
    ],
  },
  {
    id: 108,
    categoryId: 6,
    filename: 'hifi',
    filter: [
      {
        key: 'shop',
        value: 'hifi',
      },
    ],
  },
  {
    id: 109,
    categoryId: 6,
    filename: 'ice_cream',
    filter: [
      {
        key: 'amenity',
        value: 'ice_cream',
      },
    ],
  },
  {
    id: 110,
    categoryId: 6,
    filename: 'interior_decoration',
    filter: [
      {
        key: 'shop',
        value: 'interior_decoration',
      },
    ],
  },
  {
    id: 111,
    categoryId: 6,
    filename: 'jewelry',
    filter: [
      {
        key: 'shop',
        value: 'jewelry',
      },
    ],
  },
  {
    id: 112,
    categoryId: 6,
    filename: 'kiosk',
    filter: [
      {
        key: 'shop',
        value: 'kiosk',
      },
    ],
  },
  {
    id: 113,
    categoryId: 6,
    filename: 'kitchen',
    filter: [
      {
        key: 'shop',
        value: 'kitchen',
      },
    ],
  },
  {
    id: 114,
    categoryId: 6,
    filename: 'laundry',
    filter: [
      {
        key: 'shop',
        value: 'laundry',
      },
    ],
  },
  {
    id: 115,
    categoryId: 6,
    filename: 'mall',
    filter: [
      {
        key: 'shop',
        value: 'mall',
      },
    ],
  },
  {
    id: 116,
    categoryId: 6,
    filename: 'massage',
    filter: [
      {
        key: 'shop',
        value: 'massage',
      },
    ],
  },
  {
    id: 117,
    categoryId: 6,
    filename: 'mobile_phone',
    filter: [
      {
        key: 'shop',
        value: 'mobile_phone',
      },
    ],
  },
  {
    id: 118,
    categoryId: 6,
    filename: 'money_lender',
    filter: [
      {
        key: 'shop',
        value: 'money_lender',
      },
    ],
  },
  {
    id: 119,
    categoryId: 6,
    filename: 'motorcycle',
    filter: [
      {
        key: 'shop',
        value: 'motorcycle',
      },
    ],
  },
  {
    id: 120,
    categoryId: 6,
    filename: 'musical_instrument',
    filter: [
      {
        key: 'shop',
        value: 'musical_instrument',
      },
    ],
  },
  {
    id: 121,
    categoryId: 6,
    filename: 'newsagent',
    filter: [
      {
        key: 'shop',
        value: 'newsagent',
      },
    ],
  },
  {
    id: 122,
    categoryId: 6,
    filename: 'optician',
    filter: [
      {
        key: 'shop',
        value: 'optician',
      },
    ],
  },
  {
    id: 124,
    categoryId: 6,
    filename: 'outdoor',
    filter: [
      {
        key: 'shop',
        value: 'outdoor',
      },
    ],
  },
  {
    id: 125,
    categoryId: 6,
    filename: 'paint',
    filter: [
      {
        key: 'shop',
        value: 'paint',
      },
    ],
  },
  {
    id: 126,
    categoryId: 6,
    filename: 'pawnbroker',
    filter: [
      {
        key: 'shop',
        value: 'pawnbroker',
      },
    ],
  },
  {
    id: 127,
    categoryId: 6,
    filename: 'pet',
    filter: [
      {
        key: 'shop',
        value: 'pet',
      },
    ],
  },
  {
    id: 128,
    categoryId: 6,
    filename: 'seafood',
    filter: [
      {
        key: 'shop',
        value: 'seafood',
      },
    ],
  },
  {
    id: 129,
    categoryId: 6,
    filename: 'second_hand',
    filter: [
      {
        key: 'shop',
        value: 'second_hand',
      },
    ],
  },
  {
    id: 130,
    categoryId: 6,
    filename: 'shoes',
    filter: [
      {
        key: 'shop',
        value: 'shoes',
      },
    ],
  },
  {
    id: 131,
    categoryId: 6,
    filename: 'sports',
    filter: [
      {
        key: 'shop',
        value: 'sports',
      },
    ],
  },
  {
    id: 132,
    categoryId: 6,
    filename: 'stationery',
    filter: [
      {
        key: 'shop',
        value: 'stationery',
      },
    ],
  },
  {
    id: 133,
    categoryId: 6,
    filename: 'tattoo',
    filter: [
      {
        key: 'shop',
        value: 'tattoo',
      },
    ],
  },
  {
    id: 134,
    categoryId: 6,
    filename: 'toys',
    filter: [
      {
        key: 'shop',
        value: 'toys',
      },
    ],
  },
  {
    id: 135,
    categoryId: 6,
    filename: 'building_supplies',
    filter: [
      {
        key: 'shop',
        value: 'trade',
      },
      {
        key: 'trade',
        value: 'building_supplies',
      },
    ],
  },
  {
    id: 136,
    categoryId: 6,
    filename: 'vacant',
    filter: [
      {
        key: 'shop',
        value: 'vacant',
      },
    ],
  },
  {
    id: 137,
    categoryId: 6,
    filename: 'vacuum_cleaner',
    filter: [
      {
        key: 'shop',
        value: 'vacuum_cleaner',
      },
    ],
  },
  {
    id: 138,
    categoryId: 6,
    filename: 'variety_store',
    filter: [
      {
        key: 'shop',
        value: 'variety_store',
      },
    ],
  },
  {
    id: 139,
    categoryId: 6,
    filename: 'video',
    filter: [
      {
        key: 'shop',
        value: 'video',
      },
    ],
  },
  {
    id: 140,
    categoryId: 11,
    filename: 'zoo',
    filter: [
      {
        key: 'tourism',
        value: 'zoo',
      },
    ],
  },
  {
    id: 141,
    categoryId: 9,
    filename: 'alpine_hut',
    filter: [
      {
        key: 'tourism',
        value: 'alpine_hut',
      },
    ],
  },
  {
    id: 142,
    categoryId: 9,
    filename: 'attraction',
    filter: [
      {
        key: 'tourism',
        value: 'attraction',
      },
    ],
  },
  {
    id: 143,
    categoryId: 2,
    filename: 'toilets',
    filter: [
      {
        key: 'amenity',
        value: 'toilets',
      },
    ],
  },
  {
    id: 144,
    categoryId: 2,
    filename: 'telephone',
    filter: [
      {
        key: 'amenity',
        value: 'telephone',
      },
    ],
  },
  {
    id: 145,
    categoryId: 2,
    filename: 'townhall',
    filter: [
      {
        key: 'amenity',
        value: 'townhall',
      },
    ],
  },
  {
    id: 146,
    categoryId: 11,
    filename: 'prison',
    filter: [
      {
        key: 'amenity',
        value: 'prison',
      },
    ],
  },
  {
    id: 147,
    categoryId: 6,
    filename: 'marketplace',
    filter: [
      {
        key: 'amenity',
        value: 'marketplace',
      },
    ],
  },
  {
    id: 148,
    categoryId: 8,
    filename: 'bar',
    filter: [
      {
        key: 'amenity',
        value: 'bar',
      },
    ],
  },
  {
    id: 149,
    categoryId: 8,
    filename: 'cafe',
    filter: [
      {
        key: 'amenity',
        value: 'cafe',
      },
    ],
  },
  {
    id: 150,
    categoryId: 8,
    filename: 'bbq',
    filter: [
      {
        key: 'amenity',
        value: 'bbq',
      },
    ],
  },
  {
    id: 151,
    categoryId: 2,
    filename: 'drinking_water',
    union: true,
    filter: [
      {
        key: 'amenity',
        value: 'drinking_water',
      },
      {
        key: 'drinking_water:refill',
        value: 'yes',
      },
    ],
  },
  {
    id: 152,
    categoryId: 2,
    filename: 'taxi',
    filter: [
      {
        key: 'amenity',
        value: 'taxi',
      },
    ],
  },
  {
    id: 153,
    categoryId: 2,
    filename: 'library',
    filter: [
      {
        key: 'amenity',
        value: 'library',
      },
    ],
  },
  {
    id: 154,
    categoryId: 2,
    filename: 'car_wash',
    filter: [
      {
        key: 'amenity',
        value: 'car_wash',
      },
    ],
  },
  {
    id: 155,
    categoryId: 5,
    filename: 'veterinary',
    filter: [
      {
        key: 'amenity',
        value: 'veterinary',
      },
    ],
  },
  {
    id: 156,
    categoryId: 3,
    filename: 'traffic_signals',
    filter: [
      {
        key: 'highway',
        value: 'traffic_signals',
      },
    ],
  },
  {
    id: 157,
    categoryId: 3,
    filename: 'halt',
    filter: [
      {
        key: 'railway',
        value: 'halt',
      },
    ],
  },
  {
    id: 158,
    categoryId: 3,
    filename: 'level_crossing',
    filter: [
      {
        key: 'railway',
        value: 'level_crossing',
      },
    ],
  },
  {
    id: 159,
    categoryId: 3,
    filename: 'tram_stop',
    filter: [
      {
        key: 'railway',
        value: 'tram_stop',
      },
    ],
  },
  {
    id: 160,
    categoryId: 3,
    filename: 'helipad',
    filter: [
      {
        key: 'aeroway',
        value: 'helipad',
      },
    ],
  },
  {
    id: 161,
    categoryId: 11,
    filename: 'water_tower',
    filter: [
      {
        key: 'man_made',
        value: 'water_tower',
      },
    ],
  },
  {
    id: 162,
    categoryId: 11,
    filename: 'windmill',
    filter: [
      {
        key: 'man_made',
        value: 'windmill',
      },
    ],
  },
  {
    id: 163,
    categoryId: 2,
    filename: 'sauna',
    filter: [
      {
        key: 'amenity',
        value: 'sauna',
      },
    ],
  },
  {
    id: 164,
    categoryId: 2,
    filename: 'fuel',
    filter: [
      {
        key: 'amenity',
        value: 'fuel',
      },
      {
        key: 'fuel:lpg',
        value: 'yes',
      },
    ],
  },
  {
    id: 166,
    categoryId: 12,
    filename: 'dog_park',
    filter: [
      {
        key: 'leisure',
        value: 'dog_park',
      },
    ],
  },
  {
    id: 167,
    categoryId: 12,
    filename: 'sports_centre',
    filter: [
      {
        key: 'leisure',
        value: 'sports_centre',
      },
    ],
  },
  {
    id: 168,
    categoryId: 12,
    filename: 'golf_course',
    filter: [
      {
        key: 'leisure',
        value: 'golf_course',
      },
    ],
  },
  {
    id: 169,
    categoryId: 12,
    filename: 'stadium',
    filter: [
      {
        key: 'leisure',
        value: 'stadium',
      },
    ],
  },
  {
    id: 170,
    categoryId: 12,
    filename: 'pitch',
    filter: [
      {
        key: 'leisure',
        value: 'pitch',
      },
    ],
  },
  {
    id: 171,
    categoryId: 12,
    filename: 'water_park',
    filter: [
      {
        key: 'leisure',
        value: 'water_park',
      },
    ],
  },
  {
    id: 172,
    categoryId: 12,
    filename: 'slipway',
    filter: [
      {
        key: 'leisure',
        value: 'slipway',
      },
    ],
  },
  {
    id: 173,
    categoryId: 12,
    filename: 'fishing',
    filter: [
      {
        key: 'leisure',
        value: 'fishing',
      },
    ],
  },
  {
    id: 174,
    categoryId: 12,
    filename: 'park',
    filter: [
      {
        key: 'leisure',
        value: 'park',
      },
    ],
  },
  {
    id: 175,
    categoryId: 12,
    filename: 'playground',
    filter: [
      {
        key: 'leisure',
        value: 'playground',
      },
    ],
  },
  {
    id: 176,
    categoryId: 12,
    filename: 'garden',
    filter: [
      {
        key: 'leisure',
        value: 'garden',
      },
    ],
  },
  {
    id: 177,
    categoryId: 12,
    filename: 'common',
    filter: [
      {
        key: 'leisure',
        value: 'common',
      },
    ],
  },
  {
    id: 178,
    categoryId: 12,
    filename: 'ice_rink',
    filter: [
      {
        key: 'leisure',
        value: 'ice_rink',
      },
    ],
  },
  {
    id: 179,
    categoryId: 12,
    filename: 'miniature_golf',
    filter: [
      {
        key: 'leisure',
        value: 'miniature_golf',
      },
    ],
  },
  {
    id: 180,
    categoryId: 12,
    filename: 'dance',
    filter: [
      {
        key: 'leisure',
        value: 'dance',
      },
    ],
  },
  {
    id: 181,
    categoryId: 14,
    filename: 'school',
    filter: [
      {
        key: 'amenity',
        value: 'school',
      },
    ],
  },
  {
    id: 182,
    categoryId: 13,
    filename: '9pin',
    filter: [
      {
        key: 'sport',
        value: '9pin',
      },
    ],
  },
  {
    id: 183,
    categoryId: 13,
    filename: '10pin',
    filter: [
      {
        key: 'sport',
        value: '10pin',
      },
    ],
  },
  {
    id: 184,
    categoryId: 13,
    filename: 'american_football',
    filter: [
      {
        key: 'sport',
        value: 'american_football',
      },
    ],
  },
  {
    id: 185,
    categoryId: 13,
    filename: 'archery',
    filter: [
      {
        key: 'sport',
        value: 'archery',
      },
    ],
  },
  {
    id: 186,
    categoryId: 13,
    filename: 'athletics',
    filter: [
      {
        key: 'sport',
        value: 'athletics',
      },
    ],
  },
  {
    id: 187,
    categoryId: 13,
    filename: 'australian_football',
    filter: [
      {
        key: 'sport',
        value: 'australian_football',
      },
    ],
  },
  {
    id: 188,
    categoryId: 13,
    filename: 'baseball',
    filter: [
      {
        key: 'sport',
        value: 'baseball',
      },
    ],
  },
  {
    id: 189,
    categoryId: 13,
    filename: 'basketball',
    filter: [
      {
        key: 'sport',
        value: 'basketball',
      },
    ],
  },
  {
    id: 190,
    categoryId: 13,
    filename: 'beachvolleyball',
    filter: [
      {
        key: 'sport',
        value: 'beachvolleyball',
      },
    ],
  },
  {
    id: 191,
    categoryId: 13,
    filename: 'bmx',
    filter: [
      {
        key: 'sport',
        value: 'bmx',
      },
    ],
  },
  {
    id: 192,
    categoryId: 13,
    filename: 'boules',
    filter: [
      {
        key: 'sport',
        value: 'boules',
      },
    ],
  },
  {
    id: 193,
    categoryId: 13,
    filename: 'bowls',
    filter: [
      {
        key: 'sport',
        value: 'bowls',
      },
    ],
  },
  {
    id: 194,
    categoryId: 13,
    filename: 'canadian_football',
    filter: [
      {
        key: 'sport',
        value: 'canadian_football',
      },
    ],
  },
  {
    id: 195,
    categoryId: 13,
    filename: 'canoe',
    filter: [
      {
        key: 'sport',
        value: 'canoe',
      },
    ],
  },
  {
    id: 196,
    categoryId: 13,
    filename: 'chess',
    filter: [
      {
        key: 'sport',
        value: 'chess',
      },
    ],
  },
  {
    id: 197,
    categoryId: 13,
    filename: 'climbing',
    filter: [
      {
        key: 'sport',
        value: 'climbing',
      },
    ],
  },
  {
    id: 198,
    categoryId: 13,
    filename: 'cricket',
    filter: [
      {
        key: 'sport',
        value: 'cricket',
      },
    ],
  },
  {
    id: 199,
    categoryId: 13,
    filename: 'cricket_nets',
    filter: [
      {
        key: 'sport',
        value: 'cricket_nets',
      },
    ],
  },
  {
    id: 200,
    categoryId: 13,
    filename: 'croquet',
    filter: [
      {
        key: 'sport',
        value: 'croquet',
      },
    ],
  },
  {
    id: 201,
    categoryId: 13,
    filename: 'cycling',
    filter: [
      {
        key: 'sport',
        value: 'cycling',
      },
    ],
  },
  {
    id: 202,
    categoryId: 13,
    filename: 'diving',
    filter: [
      {
        key: 'sport',
        value: 'scuba_diving',
      },
    ],
  },
  {
    id: 203,
    categoryId: 13,
    filename: 'dog_racing',
    filter: [
      {
        key: 'sport',
        value: 'dog_racing',
      },
    ],
  },
  {
    id: 204,
    categoryId: 13,
    filename: 'equestrian',
    filter: [
      {
        key: 'sport',
        value: 'equestrian',
      },
    ],
  },
  {
    id: 205,
    categoryId: 13,
    filename: 'football',
    filter: [
      {
        key: 'sport',
        value: 'soccer',
      },
    ],
  },
  {
    id: 206,
    categoryId: 13,
    filename: 'gaelic_football',
    filter: [
      {
        key: 'sport',
        value: 'gaelic_football',
      },
    ],
  },
  {
    id: 207,
    categoryId: 13,
    filename: 'golf',
    filter: [
      {
        key: 'sport',
        value: 'golf',
      },
    ],
  },
  {
    id: 208,
    categoryId: 13,
    filename: 'gymnastics',
    filter: [
      {
        key: 'sport',
        value: 'gymnastics',
      },
    ],
  },
  {
    id: 209,
    categoryId: 13,
    filename: 'hockey',
    filter: [
      {
        key: 'sport',
        value: 'hockey',
      },
    ],
  },
  {
    id: 210,
    categoryId: 13,
    filename: 'horseshoes',
    filter: [
      {
        key: 'sport',
        value: 'horseshoes',
      },
    ],
  },
  {
    id: 211,
    categoryId: 13,
    filename: 'horse_racing',
    filter: [
      {
        key: 'sport',
        value: 'horse_racing',
      },
    ],
  },
  {
    id: 212,
    categoryId: 13,
    filename: 'ice_stock',
    filter: [
      {
        key: 'sport',
        value: 'ice_stock',
      },
    ],
  },
  {
    id: 213,
    categoryId: 13,
    filename: 'korfball',
    filter: [
      {
        key: 'sport',
        value: 'korfball',
      },
    ],
  },
  {
    id: 214,
    categoryId: 13,
    filename: 'motor',
    filter: [
      {
        key: 'sport',
        value: 'motor',
      },
    ],
  },
  {
    id: 215,
    categoryId: 13,
    filename: 'multi',
    filter: [
      {
        key: 'sport',
        value: 'multi',
      },
    ],
  },
  {
    id: 216,
    categoryId: 13,
    filename: 'orienteering',
    filter: [
      {
        key: 'sport',
        value: 'orienteering',
      },
    ],
  },
  {
    id: 217,
    categoryId: 13,
    filename: 'paddle_tennis',
    filter: [
      {
        key: 'sport',
        value: 'paddle_tennis',
      },
    ],
  },
  {
    id: 218,
    categoryId: 13,
    filename: 'paragliding',
    filter: [
      {
        key: 'sport',
        value: 'paragliding',
      },
    ],
  },
  {
    id: 219,
    categoryId: 13,
    filename: 'pelota',
    filter: [
      {
        key: 'sport',
        value: 'pelota',
      },
    ],
  },
  {
    id: 220,
    categoryId: 13,
    filename: 'racquet',
    filter: [
      {
        key: 'sport',
        value: 'racquet',
      },
    ],
  },
  {
    id: 221,
    categoryId: 13,
    filename: 'rowing',
    filter: [
      {
        key: 'sport',
        value: 'rowing',
      },
    ],
  },
  {
    id: 222,
    categoryId: 13,
    filename: 'rugby_league',
    filter: [
      {
        key: 'sport',
        value: 'rugby_league',
      },
    ],
  },
  {
    id: 223,
    categoryId: 13,
    filename: 'rugby_union',
    filter: [
      {
        key: 'sport',
        value: 'rugby_union',
      },
    ],
  },
  {
    id: 224,
    categoryId: 13,
    filename: 'shooting',
    filter: [
      {
        key: 'sport',
        value: 'shooting',
      },
    ],
  },
  {
    id: 225,
    categoryId: 13,
    filename: 'skating',
    filter: [
      {
        key: 'sport',
        value: 'skating',
      },
    ],
  },
  {
    id: 226,
    categoryId: 13,
    filename: 'skateboard',
    filter: [
      {
        key: 'sport',
        value: 'skateboard',
      },
    ],
  },
  {
    id: 227,
    categoryId: 13,
    filename: 'skiing',
    filter: [
      {
        key: 'sport',
        value: 'skiing',
      },
    ],
  },
  {
    id: 228,
    categoryId: 13,
    filename: 'soccer',
    filter: [
      {
        key: 'sport',
        value: 'soccer',
      },
    ],
  },
  {
    id: 229,
    categoryId: 13,
    filename: 'swimming',
    filter: [
      {
        key: 'sport',
        value: 'swimming',
      },
    ],
  },
  {
    id: 230,
    categoryId: 13,
    filename: 'table_tennis',
    filter: [
      {
        key: 'sport',
        value: 'table_tennis',
      },
    ],
  },
  {
    id: 231,
    categoryId: 13,
    filename: 'team_handball',
    filter: [
      {
        key: 'sport',
        value: 'team_handball',
      },
    ],
  },
  {
    id: 232,
    categoryId: 13,
    filename: 'tennis',
    filter: [
      {
        key: 'sport',
        value: 'tennis',
      },
    ],
  },
  {
    id: 233,
    categoryId: 13,
    filename: 'toboggan',
    filter: [
      {
        key: 'sport',
        value: 'toboggan',
      },
    ],
  },
  {
    id: 234,
    categoryId: 13,
    filename: 'volleyball',
    filter: [
      {
        key: 'sport',
        value: 'volleyball',
      },
    ],
  },
  {
    id: 235,
    categoryId: 13,
    filename: 'water_ski',
    filter: [
      {
        key: 'sport',
        value: 'water_ski',
      },
    ],
  },
  {
    id: 236,
    categoryId: 14,
    filename: 'university',
    filter: [
      {
        key: 'amenity',
        value: 'university',
      },
    ],
  },
  {
    id: 237,
    categoryId: 14,
    filename: 'kindergarten',
    filter: [
      {
        key: 'amenity',
        value: 'kindergarten',
      },
    ],
  },
  {
    id: 238,
    categoryId: 14,
    filename: 'college',
    filter: [
      {
        key: 'amenity',
        value: 'college',
      },
    ],
  },
  {
    id: 239,
    categoryId: 14,
    filename: 'driving_school',
    filter: [
      {
        key: 'amenity',
        value: 'driving_school',
      },
    ],
  },
  {
    id: 240,
    categoryId: 4,
    filename: 'chapel',
    filter: [
      {
        key: 'amenity',
        value: 'place_of_worship',
      },
      {
        key: 'building',
        value: 'chapel',
      },
    ],
  },
  {
    id: 241,
    categoryId: 9,
    filename: 'picnic_site',
    filter: [
      {
        key: 'tourism',
        value: 'picnic_site',
      },
    ],
  },
  {
    id: 242,
    categoryId: 9,
    filename: 'fireplace',
    filter: [
      {
        key: 'fireplace',
        value: 'yes',
      },
    ],
  },
  {
    id: 243,
    categoryId: 10,
    filename: 'locality',
    filter: [
      {
        key: 'place',
        value: 'locality',
      },
    ],
  },
  {
    id: 244,
    categoryId: 1,
    filename: 'waterfall',
    filter: [
      {
        key: 'waterway',
        value: 'waterfall',
      },
    ],
  },
  {
    id: 245,
    categoryId: 1,
    filename: 'lake',
    filter: [
      {
        key: 'natural',
        value: 'water',
      },
      {
        key: 'water',
        operation: '!=',
        value: 'reservoir',
      },
    ],
  },
  {
    id: 246,
    categoryId: 1,
    filename: 'riverbank',
    filter: [
      {
        key: 'natural',
        value: 'water',
      },
      {
        key: 'water',
        value: 'reservoir',
      },
    ],
  },
  {
    id: 248,
    categoryId: 1,
    filename: 'boundary_reserve',
    filter: [
      {
        key: 'boundary',
        value: 'protected_area',
      },
      {
        key: 'protect_class',
        value: '1',
      },
    ],
  },
  {
    id: 249,
    categoryId: 1,
    filename: 'boundary_monument',
    filter: [
      {
        key: 'boundary',
        value: 'protected_area',
      },
      {
        key: 'protect_class',
        value: '3',
      },
    ],
  },
  {
    id: 250,
    categoryId: 1,
    filename: 'boundary_protected_site',
    filter: [
      {
        key: 'boundary',
        value: 'protected_area',
      },
      {
        key: 'protect_class',
        value: '4',
      },
    ],
  },
  {
    id: 251,
    categoryId: 1,
    filename: 'boundary_protected_area',
    filter: [
      {
        key: 'boundary',
        value: 'protected_area',
      },
      {
        key: 'protect_class',
        value: '5',
      },
    ],
  },
  {
    id: 252,
    categoryId: 1,
    filename: 'boundary_national_park',
    filter: [
      {
        key: 'boundary',
        value: 'national_park',
      },
      {
        key: 'protect_class',
        value: '2',
      },
    ],
  },
  {
    id: 253,
    categoryId: 2,
    filename: 'vending_machine_milk',
    filter: [
      {
        key: 'amenity',
        value: 'vending_machine',
      },
      {
        key: 'vending',
        value: 'milk',
      },
    ],
  },
  {
    id: 254,
    categoryId: 1,
    filename: 'boundary_protected_area_ramsar',
    filter: [
      {
        key: 'boundary',
        value: 'protected_area',
      },
      {
        key: 'protection_id',
        value: '98',
      },
    ],
  },
  {
    id: 255,
    categoryId: 10,
    filename: 'addr',
    filter: [
      {
        key: 'addr:housenumber',
        value: '*',
      },
    ],
  },
  {
    id: 256,
    categoryId: 11,
    filename: 'mineshaft',
    filter: [
      {
        key: 'man_made',
        value: 'mineshaft',
      },
    ],
  },
  {
    id: 257,
    categoryId: 11,
    filename: 'adit',
    filter: [
      {
        key: 'man_made',
        value: 'adit',
      },
    ],
  },
  {
    id: 258,
    categoryId: 11,
    filename: 'water_well',
    filter: [
      {
        key: 'man_made',
        value: 'water_well',
      },
    ],
  },
  {
    id: 259,
    categoryId: 4,
    filename: 'wayside_cross',
    filter: [
      {
        key: 'historic',
        value: 'wayside_cross',
      },
    ],
  },
  {
    id: 260,
    categoryId: 4,
    filename: 'wayside_shrine',
    filter: [
      {
        key: 'historic',
        value: 'wayside_shrine',
      },
    ],
  },
  {
    id: 261,
    categoryId: 13,
    filename: 'gym',
    filter: [
      {
        key: 'amenity',
        value: 'gym',
      },
    ],
  },
  {
    id: 262,
    categoryId: 7,
    filename: 'generator_gas',
    filter: [
      {
        key: 'power',
        value: 'generator',
      },
      {
        key: 'generator:source',
        value: 'gas',
      },
    ],
  },
  {
    id: 263,
    categoryId: 4,
    filename: 'manor',
    filter: [
      {
        key: 'historic',
        value: 'manor',
      },
    ],
  },
  {
    id: 264,
    categoryId: 1,
    filename: 'geomorphological_unit',
    filter: [
      {
        key: 'boundary',
        value: 'geomorphological-unit',
      },
    ],
  },
  {
    id: 265,
    categoryId: 11,
    filename: 'bunker',
    filter: [
      {
        key: 'military',
        value: 'bunker',
      },
    ],
  },
  {
    id: 266,
    categoryId: 3,
    filename: 'motorway_junction',
    filter: [
      {
        key: 'highway',
        value: 'motorway_junction',
      },
    ],
  },
  {
    id: 267,
    categoryId: 4,
    filename: 'sculpture',
    filter: [
      {
        key: 'tourism',
        value: 'artwork',
      },
      {
        key: 'artwork_type',
        value: 'sculpture',
      },
    ],
  },
  {
    id: 268,
    categoryId: 11,
    filename: 'chimney',
    filter: [
      {
        key: 'man_made',
        value: 'chimney',
      },
    ],
  },
  {
    id: 269,
    categoryId: 13,
    filename: 'paragliding',
    filter: [
      {
        key: 'sport',
        value: 'free_flying',
      },
      {
        key: 'free_flying:paragliding',
        value: 'yes',
      },
    ],
  },
  {
    id: 270,
    categoryId: 13,
    filename: 'hanggliding',
    filter: [
      {
        key: 'sport',
        value: 'free_flying',
      },
      {
        key: 'free_flying:hanggliding',
        value: 'yes',
      },
    ],
  },
  {
    id: 271,
    categoryId: 9,
    filename: 'feeding',
    filter: [
      {
        key: 'amenity',
        operation: '~',
        value: '^(feeding_place|game_feeding)$',
      },
    ],
  },
  {
    id: 272,
    categoryId: 9,
    filename: 'fireplace',
    filter: [
      {
        key: 'leisure',
        value: 'firepit',
      },
    ],
  },
  {
    id: 273,
    categoryId: 13,
    filename: 'tennis',
    filter: [
      {
        key: 'sport',
        value: 'tennis',
      },
    ],
  },
  {
    id: 274,
    categoryId: 15,
    filename: 'stand',
    filter: [
      {
        key: 'information',
        value: 'guidepost',
      },
      {
        key: 'bicycle',
        value: 'yes',
      },
    ],
  },
  {
    id: 275,
    categoryId: 13,
    filename: 'ecycle_charging',
    filter: [
      {
        key: 'amenity',
        value: 'charging_station',
      },
      {
        key: 'bicycle',
        value: 'yes',
      },
    ],
  },
];

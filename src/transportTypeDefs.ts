export type TransportType =
  | 'car-free'
  | 'foot-stroller'
  | 'car'
  | 'bikesharing'
  | 'imhd'
  | 'bike'
  | 'bike-osm'
  | 'nordic'
  | 'ski'
  | 'foot-osm'
  | 'foot';

const FM_URL = 'https://routing.freemap.sk/';
const EPS_URL = 'https://routing.epsilon.sk/';

export const transportTypeDefs: {
  type: TransportType;
  icon: string;
  expert?: boolean;
  special?: boolean;
  url: string;
  exclude?: string;
  slovakiaOnly?: boolean;
  development?: boolean;
}[] = [
  { type: 'car', icon: 'car', url: `${FM_URL}$MODE/v1/car` },
  {
    type: 'car-free',
    icon: 'car',
    url: `${FM_URL}$MODE/v1/car`,
    exclude: 'toll',
  },
  {
    type: 'imhd',
    icon: 'bus',
    special: true,
    url: `${EPS_URL}$MODE/v1/imhd`,
    slovakiaOnly: true,
    development: true,
  },
  { type: 'bike', icon: 'bicycle', url: `${FM_URL}$MODE/v1/bike` },
  {
    type: 'bike-osm',
    icon: 'bicycle',
    url: 'https://routing.openstreetmap.de/routed-bike/$MODE/v1/driving',
  },
  {
    type: 'bikesharing',
    icon: 'bicycle',
    special: true,
    url: `${EPS_URL}$MODE/v1/bikesharing`,
    slovakiaOnly: true,
    development: true,
  },
  {
    type: 'foot-osm',
    icon: '!icon-hiking',
    url: 'https://routing.openstreetmap.de/routed-foot/$MODE/v1/driving',
  },
  {
    type: 'foot',
    icon: '!icon-hiking',
    url: `${EPS_URL}$MODE/v1/foot`,
    slovakiaOnly: true,
  },
  {
    type: 'foot-stroller',
    icon: 'wheelchair-alt',
    url: `${EPS_URL}$MODE/v1/foot`,
    exclude: 'stroller',
    slovakiaOnly: true,
    expert: true,
  },
  {
    type: 'nordic',
    icon: '!icon-skier-skiing',
    url: `${FM_URL}$MODE/v1/nordic`,
  },
  {
    type: 'ski',
    icon: '!icon-skiing',
    url: `${FM_URL}$MODE/v1/ski`,
    expert: true,
  },
];

const specials = transportTypeDefs
  .filter(def => def.special)
  .map(def => def.type);

export function isTransportType(candidate: string): candidate is TransportType {
  return !!transportTypeDefs.find(def => def.type === candidate);
}

export function isSpecial(transportType: TransportType | null) {
  return transportType !== null && specials.includes(transportType);
}

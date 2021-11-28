import { ReactElement } from 'react';
import {
  FaBicycle,
  FaCar,
  FaSkiing,
  FaSkiingNordic,
  FaWalking,
} from 'react-icons/fa';

export type TransportType =
  | 'car-free'
  // | 'foot-stroller'
  | 'car'
  | 'bikesharing'
  // | 'imhd'
  | 'bike'
  | 'bike-osm'
  | 'nordic'
  | 'ski'
  | 'foot-osm';
// | 'foot'

const FM_URL = 'https://routing.freemap.sk/';

const EPS_URL = 'https://routing.epsilon.sk/';

export const transportTypeDefs: {
  type: TransportType;
  icon: ReactElement;
  special?: boolean;
  url: string;
  exclude?: string;
  development?: boolean;
  hidden?: boolean;
  api: 'osrm' | 'gh';
}[] = [
  { type: 'car', api: 'osrm', icon: <FaCar />, url: `${FM_URL}$MODE/v1/car` },
  {
    type: 'car-free',
    api: 'osrm',
    icon: <FaCar />,
    url: `${FM_URL}$MODE/v1/car`,
    exclude: 'toll',
  },
  // {
  //   type: 'imhd',
  //   api: 'osrm',
  //   icon: <FaBus />,
  //   special: true,
  //   url: `${EPS_URL}$MODE/v1/imhd`,
  // },
  {
    type: 'bike',
    api: 'osrm',
    icon: <FaBicycle />,
    url: `${FM_URL}$MODE/v1/bike`,
  },
  {
    type: 'bike-osm',
    api: 'osrm',
    icon: <FaBicycle />,
    url: 'https://routing.openstreetmap.de/routed-bike/$MODE/v1/driving',
  },
  {
    type: 'bikesharing',
    api: 'osrm',
    icon: <FaBicycle />,
    special: true,
    url: `${EPS_URL}$MODE/v1/bikesharing`,
    development: true,
  },
  // {
  //   type: 'foot',
  //   api: 'osrm',
  //   icon: <FaHiking />,
  //   url: `${FM_URL}$MODE/v1/foot`,
  //   hidden: true,
  // },
  {
    type: 'foot-osm',
    api: 'osrm',
    icon: <FaWalking />,
    url: 'https://routing.openstreetmap.de/routed-foot/$MODE/v1/driving',
  },
  // {
  //   type: 'foot-stroller',
  //   api: 'osrm',
  //   icon: <FaWheelchair />,
  //   url: `${FM_URL}$MODE/v1/foot`,
  //   exclude: 'stroller',
  // },
  {
    type: 'nordic',
    api: 'osrm',
    icon: <FaSkiingNordic />,
    url: `${FM_URL}$MODE/v1/nordic`,
  },
  {
    type: 'ski',
    api: 'osrm',
    icon: <FaSkiing />,
    url: `${FM_URL}$MODE/v1/ski`,
  },
];

const specials = transportTypeDefs
  .filter((def) => def.special)
  .map((def) => def.type);

export function isTransportType(candidate: string): candidate is TransportType {
  return !!transportTypeDefs.find((def) => def.type === candidate);
}

export function isSpecial(transportType: TransportType): boolean {
  return specials.includes(transportType);
}

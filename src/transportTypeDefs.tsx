import { ReactElement } from 'react';
import {
  FaBicycle,
  FaCar,
  FaHiking,
  FaSkiing,
  FaSkiingNordic,
  FaWalking,
  FaWheelchair,
} from 'react-icons/fa';

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
  icon: ReactElement;
  expert?: boolean;
  special?: boolean;
  url: string;
  exclude?: string;
  development?: boolean;
  hidden?: boolean;
}[] = [
  { type: 'car', icon: <FaCar />, url: `${FM_URL}$MODE/v1/car` },
  {
    type: 'car-free',
    icon: <FaCar />,
    url: `${FM_URL}$MODE/v1/car`,
    exclude: 'toll',
  },
  // {
  //   type: 'imhd',
  //   icon: <FaBus />,
  //   special: true,
  //   url: `${EPS_URL}$MODE/v1/imhd`,
  // },
  { type: 'bike', icon: <FaBicycle />, url: `${FM_URL}$MODE/v1/bike` },
  {
    type: 'bike-osm',
    icon: <FaBicycle />,
    url: 'https://routing.openstreetmap.de/routed-bike/$MODE/v1/driving',
  },
  {
    type: 'bikesharing',
    icon: <FaBicycle />,
    special: true,
    url: `${EPS_URL}$MODE/v1/bikesharing`,
    development: true,
  },
  {
    type: 'foot',
    icon: <FaHiking />,
    url: `${FM_URL}$MODE/v1/foot`,
    hidden: true,
  },
  {
    type: 'foot-osm',
    icon: <FaWalking />,
    url: 'https://routing.openstreetmap.de/routed-foot/$MODE/v1/driving',
  },
  {
    type: 'foot-stroller',
    icon: <FaWheelchair />,
    url: `${FM_URL}$MODE/v1/foot`,
    exclude: 'stroller',
    expert: true,
  },
  {
    type: 'nordic',
    icon: <FaSkiingNordic />,
    url: `${FM_URL}$MODE/v1/nordic`,
  },
  {
    type: 'ski',
    icon: <FaSkiing />,
    url: `${FM_URL}$MODE/v1/ski`,
    expert: true,
  },
];

const specials = transportTypeDefs
  .filter((def) => def.special)
  .map((def) => def.type);

export function isTransportType(candidate: string): candidate is TransportType {
  return !!transportTypeDefs.find((def) => def.type === candidate);
}

export function isSpecial(transportType: TransportType | null): boolean {
  return transportType !== null && specials.includes(transportType);
}

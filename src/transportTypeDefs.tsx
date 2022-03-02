import { ReactElement } from 'react';
import {
  FaBicycle,
  FaCar,
  FaHiking,
  FaMotorcycle,
  FaWalking,
  FaWheelchair,
} from 'react-icons/fa';

export type TransportType =
  // | 'car-toll'
  // | 'car-free'
  | 'foot-stroller'
  | 'car'
  // | 'bikesharing'
  // | 'imhd'
  | 'bicycle_touring'
  // | 'nordic'
  // | 'ski'
  | 'foot'
  | 'hiking'
  | 'mtb'
  // | 'bike'
  | 'racingbike'
  | 'motorcycle'
  | 'car-osm'
  | 'bike-osm'
  | 'foot-osm';

export type TransportTypeMsgKey =
  | 'car'
  // | 'car-toll'
  // | 'car-free'
  | 'bicycle_touring'
  | 'bike'
  | 'foot'
  | 'hiking'
  | 'nordic'
  // | 'ski'
  | 'foot-stroller'
  | 'mtb'
  | 'bike'
  | 'racingbike'
  | 'motorcycle';

type TransportTypeDef = {
  key: TransportTypeMsgKey;
  icon: ReactElement;
  special?: boolean;
  exclude?: string;
  hidden?: boolean;
} & (
  | {
      url: string;
      api: 'osrm';
    }
  | {
      api: 'gh';
      // profile: string;
      vehicle:
        | 'car'
        | 'foot'
        | 'hike'
        | 'bike2'
        | 'mtb'
        | 'racingbike'
        | 'motorcycle'
        | 'car4wd'
        | 'wheelchair'
        | 'racingbike'
        | 'motorcycle';
    }
);

// const FM_URL = 'https://routing.freemap.sk/';

// const EPS_URL = 'https://routing.epsilon.sk/';

export const transportTypeDefs: Record<TransportType, TransportTypeDef> = {
  // 'car-toll': {
  //   key: 'car',
  //   api: 'osrm',
  //   icon: <FaCar />,
  //   url: `${FM_URL}$MODE/v1/car`,
  // },
  // 'car-free': {
  //   key: 'car-free',
  //   api: 'osrm',
  //   icon: <FaCar />,
  //   url: `${FM_URL}$MODE/v1/car`,
  //   exclude: 'toll',
  // },
  // imhd: { // not working
  //   api: 'osrm',
  //   icon: <FaBus />,
  //   special: true,
  //   url: `${EPS_URL}$MODE/v1/imhd`,
  // },
  'car-osm': {
    key: 'car',
    api: 'osrm',
    icon: <FaCar />,
    url: 'https://routing.openstreetmap.de/routed-car/$MODE/v1/driving',
  },
  'bike-osm': {
    key: 'bike',
    api: 'osrm',
    icon: <FaBicycle />,
    url: 'https://routing.openstreetmap.de/routed-bike/$MODE/v1/driving',
  },
  // bike: {
  //   key: 'bicycle_touring',
  //   api: 'osrm',
  //   icon: <FaBicycle />,
  //   url: `${FM_URL}$MODE/v1/bike`,
  // },
  'foot-osm': {
    key: 'foot',
    api: 'osrm',
    icon: <FaWalking />,
    url: 'https://routing.openstreetmap.de/routed-foot/$MODE/v1/driving',
  },
  // { // not working
  //   type: 'bikesharing',
  //   api: 'osrm',
  //   icon: <FaBicycle />,
  //   special: true,
  //   url: `${EPS_URL}$MODE/v1/bikesharing`,
  //   development: true,
  // },
  // 'foot-stroller': {
  //   api: 'osrm',
  //   icon: <FaWheelchair />,
  //   url: `${FM_URL}$MODE/v1/foot`,
  //   exclude: 'stroller',
  // },
  // nordic: {
  //   key: 'nordic',
  //   api: 'osrm',
  //   icon: <FaSkiingNordic />,
  //   url: `${FM_URL}$MODE/v1/nordic`,
  // },
  // ski: {
  //   key: 'ski',
  //   api: 'osrm',
  //   icon: <FaSkiing />,
  //   url: `${FM_URL}$MODE/v1/ski`,
  // },
  car: {
    key: 'car',
    api: 'gh',
    icon: <FaCar />,
    vehicle: 'car',
  },
  motorcycle: {
    key: 'motorcycle',
    api: 'gh',
    icon: <FaMotorcycle />,
    vehicle: 'motorcycle',
  },
  racingbike: {
    key: 'racingbike',
    api: 'gh',
    icon: <FaBicycle />,
    vehicle: 'racingbike',
  },
  bicycle_touring: {
    key: 'bicycle_touring',
    api: 'gh',
    icon: <FaBicycle />,
    vehicle: 'bike2',
  },
  mtb: {
    key: 'mtb',
    api: 'gh',
    icon: <FaBicycle />,
    vehicle: 'mtb',
  },
  foot: {
    key: 'foot',
    api: 'gh',
    icon: <FaWalking />,
    vehicle: 'foot',
  },
  hiking: {
    key: 'hiking',
    api: 'gh',
    icon: <FaHiking />,
    vehicle: 'hike',
  },
  'foot-stroller': {
    key: 'foot-stroller',
    api: 'gh',
    icon: <FaWheelchair />,
    vehicle: 'wheelchair', // wheelchair_fastest doesn't work
  },
};

// const specials = transportTypeDefs
//   .filter((def) => def.special)
//   .map((def) => def.type);

// export function isTransportType(candidate: string): candidate is TransportType {
//   return !!transportTypeDefs.find((def) => def.type === candidate);
// }

export function isSpecial(transportType: TransportType): boolean {
  return !transportType; // specials.includes(transportType);
}

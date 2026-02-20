import type { ReactElement } from 'react';
import {
  FaBicycle,
  FaCar,
  FaHiking,
  FaPen,
  FaMotorcycle,
  FaWalking,
} from 'react-icons/fa';
import { is } from 'typia';

export type TransportType =
  | 'bike-osrm'
  | 'car-osrm'
  | 'foot-osrm'
  | 'car'
  | 'car4wd'
  | 'foot'
  | 'hiking'
  | 'motorcycle'
  | 'mtb'
  | 'racingbike'
  | 'manual';

export function migrateTransportType(transportType: unknown): TransportType {
  return is<TransportType>(transportType)
    ? transportType
    : typeof transportType === 'string'
      ? (({
          'car-toll': 'car',
          'car-free': 'car',
          'foot-stroller': 'foot',
          bikesharing: 'bike-osrm',
          imhd: 'car',
          bicycle_touring: 'racingbike',
          nordic: 'hiking',
          ski: 'hiking',
          bike: 'bike-osrm',
          'car-osm': 'car-osrm',
          'bike-osm': 'bike-osrm',
          'foot-osm': 'foot-osrm',
        }[transportType] ?? 'hiking') as TransportType)
      : 'hiking';
}

export type TransportTypeMsgKey =
  | 'bike'
  | 'car'
  | 'car4wd'
  | 'foot'
  | 'hiking'
  | 'motorcycle'
  | 'mtb'
  | 'racingbike'
  | 'manual';

type TransportTypeDef = {
  msgKey: TransportTypeMsgKey;
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
      profile:
        | 'car'
        | 'car4wd'
        | 'foot'
        | 'hike'
        | 'bike'
        | 'motorcycle'
        | 'mtb'
        | 'racingbike';
    }
  | {
      api: 'manual';
    }
);

export const transportTypeDefs: Record<TransportType, TransportTypeDef> = {
  manual: {
    msgKey: 'manual',
    api: 'manual',
    icon: <FaPen />,
  },
  'car-osrm': {
    msgKey: 'car',
    api: 'osrm',
    icon: <FaCar />,
    url: 'https://routing.openstreetmap.de/routed-car/$MODE/v1/driving',
  },
  'bike-osrm': {
    msgKey: 'bike',
    api: 'osrm',
    icon: <FaBicycle />,
    url: 'https://routing.openstreetmap.de/routed-bike/$MODE/v1/driving',
  },
  'foot-osrm': {
    msgKey: 'foot',
    api: 'osrm',
    icon: <FaWalking />,
    url: 'https://routing.openstreetmap.de/routed-foot/$MODE/v1/driving',
  },
  car: {
    msgKey: 'car',
    api: 'gh',
    icon: <FaCar />,
    profile: 'car',
  },
  car4wd: {
    msgKey: 'car4wd',
    api: 'gh',
    icon: <FaCar />,
    profile: 'car4wd',
  },
  motorcycle: {
    msgKey: 'motorcycle',
    api: 'gh',
    icon: <FaMotorcycle />,
    profile: 'motorcycle',
  },
  racingbike: {
    msgKey: 'racingbike',
    api: 'gh',
    icon: <FaBicycle />,
    profile: 'racingbike',
  },
  mtb: {
    msgKey: 'mtb',
    api: 'gh',
    icon: <FaBicycle />,
    profile: 'mtb',
  },
  foot: {
    msgKey: 'foot',
    api: 'gh',
    icon: <FaWalking />,
    profile: 'foot',
  },
  hiking: {
    msgKey: 'hiking',
    api: 'gh',
    icon: <FaHiking />,
    profile: 'hike',
  },
};

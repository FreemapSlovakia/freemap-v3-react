import type { ReactElement } from 'react';
import {
  FaBabyCarriage,
  FaBicycle,
  FaBiking,
  FaBolt,
  FaCar,
  FaHiking,
  FaMotorcycle,
  FaPen,
  FaWalking,
} from 'react-icons/fa';
import z from 'zod';

export const TransportTypeSchema = z.enum([
  'bike-osrm',
  'car-osrm',
  'foot-osrm',
  'bike',
  'car',
  'car4wd',
  'carnotoll',
  'easyhike',
  'ebike',
  'foot',
  'gravelbike',
  'hiking',
  'motorcycle',
  'mtb',
  'racingbike',
  'stroller',
  'manual',
]);

export type TransportType = z.infer<typeof TransportTypeSchema>;

export const TransportTypeCompatSchema = z
  .preprocess(
    (v) =>
      (typeof v === 'string' &&
        {
          // Both of these were folded into the nearest profile that existed at
          // the time. The router has the real ones now, so the old links
          // resolve to what they always meant.
          'car-toll': 'car',
          'car-free': 'carnotoll',
          'foot-stroller': 'stroller',
          bikesharing: 'bike-osrm',
          imhd: 'car',
          bicycle_touring: 'racingbike',
          nordic: 'hiking',
          ski: 'hiking',
          'car-osm': 'car-osrm',
          'bike-osm': 'bike-osrm',
          'foot-osm': 'foot-osrm',
        }[v]) ||
      v,
    TransportTypeSchema,
  )
  .catch('hiking');

export type TransportTypeMsgKey =
  | 'bike'
  | 'car'
  | 'car4wd'
  | 'carnotoll'
  | 'easyhike'
  | 'ebike'
  | 'foot'
  | 'gravelbike'
  | 'hiking'
  | 'motorcycle'
  | 'mtb'
  | 'racingbike'
  | 'stroller'
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
        | 'carnotoll'
        | 'foot'
        | 'hike'
        | 'bike'
        | 'motorcycle'
        | 'mtb'
        | 'racingbike'
        | 'ebike'
        | 'gravelbike'
        | 'stroller'
        | 'easyhike';
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
  carnotoll: {
    msgKey: 'carnotoll',
    api: 'gh',
    icon: <FaCar />,
    profile: 'carnotoll',
  },
  motorcycle: {
    msgKey: 'motorcycle',
    api: 'gh',
    icon: <FaMotorcycle />,
    profile: 'motorcycle',
  },
  bike: {
    msgKey: 'bike',
    api: 'gh',
    icon: <FaBicycle />,
    profile: 'bike',
  },
  ebike: {
    msgKey: 'ebike',
    api: 'gh',
    icon: <FaBolt />,
    profile: 'ebike',
  },
  gravelbike: {
    msgKey: 'gravelbike',
    api: 'gh',
    icon: <FaBiking />,
    profile: 'gravelbike',
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
  stroller: {
    msgKey: 'stroller',
    api: 'gh',
    icon: <FaBabyCarriage />,
    profile: 'stroller',
  },
  hiking: {
    msgKey: 'hiking',
    api: 'gh',
    icon: <FaHiking />,
    profile: 'hike',
  },
  easyhike: {
    msgKey: 'easyhike',
    api: 'gh',
    icon: <FaHiking />,
    profile: 'easyhike',
  },
};

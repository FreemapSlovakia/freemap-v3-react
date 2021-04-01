/* eslint-disable react/jsx-key */

import {
  FaCamera,
  FaCertificate,
  FaExternalLinkAlt,
  FaLock,
  FaMapSigns,
  FaPercent,
  FaRegKeyboard,
  FaRoad,
  FaShareAlt,
  FaUsers,
} from 'react-icons/fa';
import { SiOpenstreetmap } from 'react-icons/si';

export type TipKey =
  | 'freemap'
  | 'osm'
  | 'attribution'
  | 'shortcuts'
  | 'exports'
  | 'sharing'
  | 'galleryUpload'
  | 'gpxViewer'
  | 'planner'
  | 'dvePercenta'
  | 'privacyPolicy';

export type Tip = [
  key: TipKey,
  title: string,
  icon: React.ReactElement,
  hide?: boolean,
];

export const tips: Tip[] = [
  ['freemap', 'O združení Freemap', <FaUsers />],
  ['osm', 'O OpenStreetMap', <SiOpenstreetmap />],
  ['attribution', 'Licencia máp', <FaCertificate />],
  ['shortcuts', 'Klávesové skratky', <FaRegKeyboard />],
  ['exports', 'Exporty máp', <FaExternalLinkAlt />],
  ['sharing', 'Zdieľanie a vkladanie mapy', <FaShareAlt />],
  ['galleryUpload', 'Galéria fotografií', <FaCamera />],
  ['gpxViewer', 'Prehliadač trás GPX', <FaRoad />],
  ['planner', 'Vyhľadávač trás', <FaMapSigns />],
  ['dvePercenta', 'Dve percentá', <FaPercent />],
  ['privacyPolicy', 'Privacy policy', <FaLock />, true],
];

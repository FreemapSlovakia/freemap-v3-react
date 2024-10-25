import {
  FaCertificate,
  FaExternalLinkAlt,
  FaLock,
  FaPercent,
  FaRegKeyboard,
  FaUsers,
} from 'react-icons/fa';
import { SiGarmin, SiOpenstreetmap } from 'react-icons/si';

export type DocumentKey =
  | 'garmin'
  | 'freemap'
  | 'osm'
  | 'attribution'
  | 'shortcuts'
  | 'exports'
  | 'dvePercenta'
  | 'privacyPolicy'
  | 'outdoorShadingAttribution';

export type Document = [
  key: DocumentKey,
  title: string,
  icon: React.ReactElement,
  hide?: boolean,
];

export const documents: Document[] = [
  ['freemap', 'O združení Freemap', <FaUsers />],
  ['osm', 'O OpenStreetMap', <SiOpenstreetmap />],
  ['attribution', 'Licencia máp', <FaCertificate />],
  ['shortcuts', 'Klávesové skratky', <FaRegKeyboard />],
  ['exports', 'Exporty máp', <FaExternalLinkAlt />, true],
  ['dvePercenta', 'Dve percentá', <FaPercent />],
  ['privacyPolicy', 'Privacy policy', <FaLock />, true],
  ['outdoorShadingAttribution', 'Attribution', <FaCertificate />, true],
  ['garmin', 'Garmin', <SiGarmin />],
];

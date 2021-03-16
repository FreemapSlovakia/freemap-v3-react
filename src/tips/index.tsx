/* eslint-disable react/jsx-key */

import {
  FaCamera,
  FaCertificate,
  FaExternalLinkAlt,
  FaMapSigns,
  FaRegKeyboard,
  FaRoad,
  FaShareAlt,
  FaUsers,
} from 'react-icons/fa';
import { SiOpenstreetmap } from 'react-icons/si';

export const tips = [
  ['freemap', 'O združení Freemap', <FaUsers />],
  ['osm', 'O OpenStreetMap', <SiOpenstreetmap />],
  ['attribution', 'Licencia máp', <FaCertificate />],
  ['shortcuts', 'Klávesové skratky', <FaRegKeyboard />],
  ['exports', 'Exporty máp', <FaExternalLinkAlt />],
  ['sharing', 'Zdieľanie a vkladanie mapy', <FaShareAlt />],
  ['galleryUpload', 'Galéria fotografií', <FaCamera />],
  ['gpxViewer', 'Prehliadač trás GPX', <FaRoad />],
  ['planner', 'Vyhľadávač trás', <FaMapSigns />],
] as const;

import { Tool } from '@app/store/actions.js';
import type { ReactElement } from 'react';
import {
  FaDrawPolygon,
  FaFileImport,
  FaInfo,
  FaMapMarkerAlt,
  FaMapSigns,
  FaPencilAlt,
} from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { TbMapPins } from 'react-icons/tb';
import type { Messages } from '../translations/messagesInterface.js';

export interface ToolDefinition {
  tool: Tool;
  icon: ReactElement;
  msgKey: keyof Messages['tools'];
  kbd?: string;
  draw?: true;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    tool: 'route-planner',
    icon: <FaMapSigns />,
    msgKey: 'routePlanner',
    kbd: 'KeyR',
  },
  {
    tool: 'objects',
    icon: <TbMapPins />,
    msgKey: 'objects',
    kbd: 'KeyO',
  },
  {
    tool: 'draw-points',
    icon: <FaMapMarkerAlt />,
    msgKey: 'drawPoints',
    kbd: 'KeyP',
    draw: true,
  },
  {
    tool: 'draw-lines',
    icon: <MdPolyline />,
    msgKey: 'drawLines',
    kbd: 'KeyL',
    draw: true,
  },
  {
    tool: 'draw-polygons',
    icon: <FaDrawPolygon />,
    msgKey: 'drawPolygons',
    kbd: 'KeyN',
    draw: true,
  },
  {
    tool: 'import-file',
    icon: <FaFileImport />,
    msgKey: 'trackViewer',
    kbd: 'KeyG',
  },
  {
    tool: 'map-details',
    icon: <FaInfo />,
    msgKey: 'mapDetails',
    kbd: 'KeyI',
  },
  {
    tool: 'changesets',
    icon: <FaPencilAlt />,
    msgKey: 'changesets',
    kbd: 'KeyX',
  },
];

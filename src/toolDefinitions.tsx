import type { ReactElement } from 'react';
import {
  FaDrawPolygon,
  FaInfo,
  FaMapMarkerAlt,
  FaMapSigns,
  FaPencilAlt,
  FaRoad,
} from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { Tool } from './actions/mainActions.js';
import type { Messages } from './translations/messagesInterface.js';

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
    icon: <FaMapMarkerAlt />,
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
    tool: 'track-viewer',
    icon: <FaRoad />,
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

import { ReactElement } from 'react';
import {
  FaDrawPolygon,
  FaInfo,
  FaMapMarkerAlt,
  FaMapSigns,
  FaPencilAlt,
  FaRoad,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { Tool } from './actions/mainActions';
import { Messages } from './translations/messagesInterface';

export interface ToolDefinition {
  tool: Tool;
  icon: ReactElement;
  msgKey: keyof Messages['tools'];
  kbd?: string;
  expertOnly?: boolean;
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
    tool: 'draw-lines',
    icon: <MdTimeline />,
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
    tool: 'draw-points',
    icon: <FaMapMarkerAlt />,
    msgKey: 'drawPoints',
    kbd: 'KeyP',
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
    expertOnly: true,
  },
];

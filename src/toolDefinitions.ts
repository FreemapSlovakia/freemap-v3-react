import { Tool } from './actions/mainActions';
import { Messages } from './translations/messagesInterface';

export interface ToolDefinition {
  tool: Tool;
  icon: string;
  msgKey: keyof Messages['tools'];
  kbd?: string;
  expertOnly?: boolean;
}

export const toolDefinitions: ToolDefinition[] = [
  { tool: 'maps', icon: 'map', msgKey: 'maps', kbd: 'KeyM' },
  {
    tool: 'route-planner',
    icon: 'map-signs',
    msgKey: 'routePlanner',
    kbd: 'KeyR',
  },
  { tool: 'objects', icon: 'map-marker', msgKey: 'objects', kbd: 'KeyO' },
  {
    tool: 'draw-lines',
    icon: 'arrows-h',
    msgKey: 'drawLines',
    kbd: 'KeyL',
  },
  {
    tool: 'draw-polygons',
    icon: 'square-o',
    msgKey: 'drawPolygons',
    kbd: 'KeyN',
  },
  {
    tool: 'draw-points',
    icon: 'map-marker',
    msgKey: 'drawPoints',
    kbd: 'KeyP',
  },
  { tool: 'track-viewer', icon: 'road', msgKey: 'trackViewer', kbd: 'KeyG' },
  { tool: 'map-details', icon: 'info', msgKey: 'mapDetails', kbd: 'KeyI' },
  {
    tool: 'changesets',
    icon: 'pencil',
    msgKey: 'changesets',
    kbd: 'KeyX',
    expertOnly: true,
  },
];

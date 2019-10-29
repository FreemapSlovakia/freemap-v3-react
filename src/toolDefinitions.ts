import { Tool } from './actions/mainActions';

export type ToolDefinition = {
  tool: Tool;
  icon: string;
  msgKey: string;
  kbd?: string;
  expertOnly?: boolean;
};

export const toolDefinitions: ToolDefinition[] = [
  {
    tool: 'route-planner',
    icon: 'map-signs',
    msgKey: 'routePlanner',
    kbd: 'r',
  },
  { tool: 'objects', icon: 'map-marker', msgKey: 'objects', kbd: 'o' },
  { tool: 'gallery', icon: 'picture-o', msgKey: 'gallery', kbd: 'g' },
  {
    tool: 'measure-dist',
    icon: '!icon-ruler',
    msgKey: 'measurement',
    kbd: 'm',
  },
  { tool: 'track-viewer', icon: 'road', msgKey: 'trackViewer', kbd: 't' },
  { tool: 'info-point', icon: 'thumb-tack', msgKey: 'infoPoint', kbd: 'p' },
  { tool: 'map-details', icon: 'info', msgKey: 'mapDetails', kbd: 'd' },
  { tool: 'tracking', icon: 'bullseye', msgKey: 'tracking', kbd: 'l' },
  {
    tool: 'changesets',
    icon: 'pencil',
    msgKey: 'changesets',
    kbd: 'x',
    expertOnly: true,
  },
];

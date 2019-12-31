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
  { tool: 'photos', icon: 'picture-o', msgKey: 'photos', kbd: 'p' },
  {
    tool: 'draw-lines',
    icon: 'object-ungroup',
    msgKey: 'measurement',
    kbd: 'd',
  },
  { tool: 'track-viewer', icon: 'road', msgKey: 'trackViewer', kbd: 'g' },
  { tool: 'map-details', icon: 'info', msgKey: 'mapDetails', kbd: 'i' },
  { tool: 'tracking', icon: 'bullseye', msgKey: 'tracking', kbd: 'l' },
  {
    tool: 'changesets',
    icon: 'pencil',
    msgKey: 'changesets',
    kbd: 'x',
    expertOnly: true,
  },
];

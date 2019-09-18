import { Tool } from './actions/mainActions';

export type ToolDefinition = {
  tool: Tool;
  icon: string;
  msgKey: string;
  expertOnly?: boolean;
};

export const toolDefinitions: ToolDefinition[] = [
  { tool: 'route-planner', icon: 'map-signs', msgKey: 'routePlanner' },
  { tool: 'objects', icon: 'map-marker', msgKey: 'objects' },
  { tool: 'gallery', icon: 'picture-o', msgKey: 'gallery' },
  { tool: 'measure-dist', icon: '!icon-ruler', msgKey: 'measurement' },
  { tool: 'track-viewer', icon: 'road', msgKey: 'trackViewer' },
  { tool: 'info-point', icon: 'thumb-tack', msgKey: 'infoPoint' },
  { tool: 'map-details', icon: 'info', msgKey: 'mapDetails' },
  { tool: 'tracking', icon: 'bullseye', msgKey: 'tracking' },
  {
    tool: 'changesets',
    icon: 'pencil',
    msgKey: 'changesets',
    expertOnly: true,
  },
];

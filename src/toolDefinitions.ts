import { Tool } from './actions/mainActions';

export interface ToolDefinition {
  tool: Tool;
  icon: string;
  msgKey:
    | 'maps'
    | 'routePlanner'
    | 'objects'
    | 'photos'
    | 'measurement'
    | 'trackViewer'
    | 'mapDetails'
    | 'tracking'
    | 'changesets';
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
  { tool: 'photos', icon: 'picture-o', msgKey: 'photos', kbd: 'KeyP' },
  {
    tool: 'draw-lines',
    icon: 'object-ungroup',
    msgKey: 'measurement',
    kbd: 'KeyD',
  },
  { tool: 'track-viewer', icon: 'road', msgKey: 'trackViewer', kbd: 'KeyG' },
  { tool: 'map-details', icon: 'info', msgKey: 'mapDetails', kbd: 'KeyI' },
  { tool: 'tracking', icon: 'bullseye', msgKey: 'tracking', kbd: 'KeyL' },
  {
    tool: 'changesets',
    icon: 'pencil',
    msgKey: 'changesets',
    kbd: 'KeyX',
    expertOnly: true,
  },
];

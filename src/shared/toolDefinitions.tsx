import type { Tool } from '@app/store/actions.js';
import type { ReactElement } from 'react';
import {
  FaBullseye,
  FaDrawPolygon,
  FaFileImport,
  FaInfo,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaRoute,
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

/**
 * Tools that react to clicking on the map. Only one of them can be open at a
 * time (otherwise a map click would be ambiguous); the remaining tools are
 * overlays that may be open simultaneously with each other and with one of
 * these.
 */
export const MAP_CLICK_TOOLS: Tool[] = [
  'draw-points',
  'draw-lines',
  'draw-polygons',
  'map-details',
  'route-planner',
];

export function isMapClickTool(tool: Tool | null | undefined): boolean {
  return tool != null && MAP_CLICK_TOOLS.includes(tool);
}

/** The three draw-* tools share one menu, so at most one is ever open. */
export function isDrawTool(tool: Tool | null | undefined): boolean {
  return tool != null && tool.startsWith('draw-');
}

/** Drops duplicates and keeps at most one draw-* tool (they share one menu). */
export function dedupeOpenTools(tools: Tool[]): Tool[] {
  const result: Tool[] = [];

  for (const tool of tools) {
    if (
      result.includes(tool) ||
      (isDrawTool(tool) && result.some(isDrawTool))
    ) {
      continue;
    }

    result.push(tool);
  }

  return result;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    tool: 'route-planner',
    icon: <FaRoute />,
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
  {
    tool: 'tracking',
    icon: <FaBullseye />,
    msgKey: 'tracking',
    kbd: 'KeyT',
  },
];

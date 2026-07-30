import type { Tool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { gpsRecorderAvailableSelector } from '@features/gpsRecorder/support.js';
import type { ReactElement } from 'react';
import {
  FaBullseye,
  FaCircle,
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
  /**
   * Hides the tool when it returns false — for platform support and per-account
   * gates. Absent means always available.
   */
  available?: (state: RootState) => boolean;
  /**
   * Marks the tool as not finished yet: the menu item and the tool's own title
   * carry `ExperimentalFunction`'s flask, so the user knows what they are using
   * before something surprises them.
   */
  experimental?: true;
}

/**
 * Tools hidden for this device/account, as the `|a|b|`-delimited string the
 * menus use: a stable string keeps `useAppSelector` from re-rendering on every
 * action the way a fresh array would.
 */
export function unavailableToolsSelector(state: RootState): string {
  return `|${toolDefinitions
    .filter((td) => td.available && !td.available(state))
    .map((td) => `${td.tool}|`)
    .join('')}`;
}

export function isToolAvailable(tools: string, tool: Tool): boolean {
  return !tools.includes(`|${tool}|`);
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
  return tool?.startsWith('draw-') ?? false;
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
  {
    tool: 'gps-recorder',
    icon: <FaCircle />,
    msgKey: 'gpsRecorder',
    available: gpsRecorderAvailableSelector,
    experimental: true,
  },
];

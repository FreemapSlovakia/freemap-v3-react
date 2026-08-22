import type { Tool } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { gpsRecorderAvailableSelector } from '@features/gpsRecorder/support.js';
import type { ReactElement } from 'react';
import {
  FaBullseye,
  FaCircle,
  FaDrawPolygon,
  FaInfo,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaRoute,
} from 'react-icons/fa';
import { MdPolyline, MdShapeLine } from 'react-icons/md';
import { PiCompassRoseBold, PiMountains } from 'react-icons/pi';
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
  /**
   * The tool asks the server for what it shows, so offline its toolbar carries
   * the offline mark. Nothing about opening it is blocked — the panel is local,
   * a selection toolbar opens the same tool without the menu at all, and what
   * it already holds stays usable; only the controls that fetch go dead.
   */
  requiresOnline?: true;
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
 * Tools that take clicks on the map, so while one of them is open a click no
 * longer selects a feature. The remaining tools only bring a toolbar.
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

/** The three draw-* tools share one menu, which switches between them. */
export function isDrawTool(tool: Tool | null | undefined): boolean {
  return tool?.startsWith('draw-') ?? false;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    tool: 'route-planner',
    icon: <FaRoute />,
    msgKey: 'routePlanner',
    kbd: 'KeyR',
    requiresOnline: true,
  },
  {
    tool: 'objects',
    icon: <TbMapPins />,
    msgKey: 'objects',
    kbd: 'KeyO',
    requiresOnline: true,
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
    icon: <MdShapeLine />,
    msgKey: 'dataViewer',
    kbd: 'KeyG',
  },
  {
    tool: 'map-details',
    icon: <FaInfo />,
    msgKey: 'mapDetails',
    kbd: 'KeyI',
    requiresOnline: true,
  },
  {
    tool: 'changesets',
    icon: <FaPencilAlt />,
    msgKey: 'changesets',
    kbd: 'KeyX',
    requiresOnline: true,
  },
  {
    tool: 'tracking',
    icon: <FaBullseye />,
    msgKey: 'tracking',
    kbd: 'KeyT',
    requiresOnline: true,
  },
  {
    tool: 'toposcope',
    icon: <PiCompassRoseBold />,
    msgKey: 'toposcope',
    kbd: 'KeyS',
  },
  {
    tool: 'panorama',
    icon: <PiMountains />,
    msgKey: 'panorama',
    requiresOnline: true,
    experimental: true,
  },
  {
    tool: 'gps-recorder',
    icon: <FaCircle />,
    msgKey: 'gpsRecorder',
    available: gpsRecorderAvailableSelector,
    experimental: true,
  },
];

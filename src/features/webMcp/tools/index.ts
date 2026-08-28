import type { WebMcpTool } from '../tool.js';
import { appTools } from './appTools.js';
import { dataTools } from './dataTools.js';
import { drawingTools } from './drawingTools.js';
import { guideTools } from './guideTools.js';
import { mapTools } from './mapTools.js';
import { objectTools } from './objectTools.js';
import { routeTools } from './routeTools.js';
import { searchTools } from './searchTools.js';

export const webMcpTools: WebMcpTool[] = [
  ...guideTools,
  ...mapTools,
  ...searchTools,
  ...objectTools,
  ...routeTools,
  ...drawingTools,
  ...dataTools,
  ...appTools,
];

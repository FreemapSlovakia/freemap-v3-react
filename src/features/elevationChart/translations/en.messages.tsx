import type { ElevationChartMessages } from './ElevationChartMessages.js';

const en: ElevationChartMessages = {
  uphill: 'Total climb',
  downhill: 'Total descend',
  downloadAsSvg: 'Download as SVG',
  showWaypoints: 'Show waypoints',
  elevationSource: 'Elevation data',
  fetchError: 'Elevation could not be read',
  rangeHint: () => (
    <>
      Scroll to zoom the chart; once zoomed, drag to move along it. To measure a
      part of the line, hold <kbd>Shift</kbd> and drag.
    </>
  ),
  rangeHintTouch:
    'Pinch to zoom the chart; once zoomed, drag to move along it. To measure a part of the line, press and hold, then drag.',
};

export default en;

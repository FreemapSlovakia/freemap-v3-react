/**
 * The look the app's charts share, the elevation chart's and the forecast's.
 * Presentation attributes rather than CSS classes: `downloadSvg` keeps only
 * attributes. Labels are 13px in `CHART_LABEL`.
 */

export const CHART_LABEL = 'var(--bs-secondary-color)';

export const CHART_AXIS = {
  stroke: 'var(--bs-secondary-color)',
  strokeWidth: 1,
};

// The text colour, translucent: the border colour vanishes on a shaded band.
export const CHART_GRID = {
  stroke: 'var(--bs-secondary-color)',
  strokeOpacity: 0.2,
  strokeWidth: 1,
};

export const CHART_GRID_DASHED = {
  stroke: 'var(--bs-secondary-color)',
  strokeOpacity: 0.35,
  strokeWidth: 1,
  strokeDasharray: '3 3',
};

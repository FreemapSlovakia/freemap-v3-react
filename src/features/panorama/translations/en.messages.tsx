import type { PanoramaMessages } from './PanoramaMessages.js';

const en: PanoramaMessages = {
  pickHint: 'Click the map to see the view from there.',
  rendering: 'Rendering the panorama…',
  slow: 'Taking longer than usual.',
  busy: 'The renderer is busy, so this may take a while.',
  cancel: 'Cancel',
  update: 'Update',
  outdated: 'The picture is of the previous viewpoint.',
  preview: 'Preview',
  eyeElevation: 'Viewpoint',
  quality: {
    label: 'Quality / speed',
    superfast: 'Lowest / fastest',
    fast: 'Low / fast',
    standard: 'Standard',
    detailed: 'Detailed / slow',
    finest: 'Finest / slowest',
    premiumHint:
      'A finer panorama is rendered at up to six times the resolution and nine times the sampling, which shows the ridges as they really are instead of as steps. Each tier costs proportionally more on a server that renders one panorama at a time, so the finer ones belong to premium.',
  },
  tilt: {
    label: 'Vertical view',
    standard: 'Standard',
    wide: 'Tall',
    flat: 'Short',
  },
  labels: {
    title: 'Peak names',
    density: 'Number of names',
    none: 'None',
    few: 'Fewer',
    normal: 'Normal',
    many: 'More',
  },
  dominance: {
    label: 'Minimum dominance',
    all: 'Any',
  },
  autoPan: 'Turn with the device, or by itself',
  fullscreen: 'Full screen',
  peak: {
    elevation: 'Elevation',
    distance: 'Distance',
    azimuth: 'Azimuth',
    showOnMap: 'Show on map',
  },
  errors: {
    offline:
      'A panorama has to be rendered on the server, and you are offline.',
    unreachable:
      'The rendering service could not be reached. It may be down, or something between you and it is blocking the request.',
    busy: 'The rendering service is unavailable right now. Try again shortly.',
    tooMany:
      'Too many panoramas rendered lately. Try again later, or go premium.',
    noData:
      'There is no terrain data for this viewpoint. Try clicking somewhere else.',
    failed: 'The panorama could not be rendered.',
  },
  caveats: {
    title: 'What the picture does and does not show',
    bareEarth:
      'The terrain model is bare earth: forests and buildings are invisible, so a view a forest would block is drawn as if it were clear. This is by far the largest source of error.',
    coverage:
      'Detail varies by country. Where a national laser-scanned model exists the near field is sharp; elsewhere a global 30 m model answers.',
    viewpoint:
      'The eye is put on the highest point within a few metres of where you clicked, so a summit view is not spoiled by the rock beside it.',
  },
  terrainSource: 'Terrain',
};

export default en;

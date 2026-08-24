import type { ViewshedMessages } from './ViewshedMessages.js';

const en: ViewshedMessages = {
  pickViewpoint: 'Pick on the map',
  locate: 'Viewshed from my position',
  pickViewpointPrompt: 'Click the map where you want to look from',
  detail: 'Quality / speed',
  details: {
    superfast: 'Lowest / fastest',
    fast: 'Low / fast',
    standard: 'Standard',
    detailed: 'Detailed / slow',
    finest: 'Finest / slowest',
  },
  settings: 'Viewshed settings',
  targetHeight: 'Target height',
  targetHeightHint:
    'How tall the thing you are looking at is — raise it to see where a mast or a ridge-top walker would be visible from.',
  color: 'Colour',
  strength: 'Strength',
  strengthMeasured: 'As measured',
  strengthHint:
    'How much of the ground you see is what the overlay is shaded by, so ground seen edge-on comes out very faint. Raising this lifts the faint end without flattening the rest.',
  minOpacity: 'Minimum opacity',
  minOpacityHint:
    'What visible ground shows at, however edge-on it is. At 100% the overlay is a plain stencil: visible or not, nothing in between.',
  update: 'Update',
  outdated: 'The overlay is of the previous viewpoint.',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Waiting for the renderer…'
      : ahead === 1
        ? 'Waiting — one render ahead.'
        : `Waiting — ${ahead} renders ahead.`,
  errors: {
    offline:
      'A viewshed has to be computed on the server, and you are offline.',
    unreachable:
      'The rendering service could not be reached. It may be down, or something between you and it is blocking the request.',
    busy: 'The rendering service is unavailable right now. Try again shortly.',
    tooMany: 'Too many renders lately. Try again later, or go premium.',
    noData:
      'There is no terrain data for this viewpoint. Try clicking somewhere else.',
    failed: 'The viewshed could not be computed.',
  },
};

export default en;

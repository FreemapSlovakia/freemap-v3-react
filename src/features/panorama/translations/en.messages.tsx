import type { PanoramaMessages } from './PanoramaMessages.js';

const en: PanoramaMessages = {
  // The space after the icon is explicit: the locale generator drops a plain
  // one, leaving the fallback languages reading "the 👁button below".
  pickHint: ({ icon }) => (
    <>
      Pick where to look from with the {icon}
      {' button below.'}
    </>
  ),
  rendering: 'Rendering the panorama…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Waiting for the renderer…'
      : ahead === 1
        ? 'Waiting — one panorama ahead.'
        : `Waiting — ${ahead} panoramas ahead.`,
  cancel: 'Cancel',
  update: 'Update',
  outdated: 'The picture is of the previous viewpoint.',
  locate: 'View from my position',
  pickViewpoint: 'Pick on the map',
  pickViewpointPrompt: 'Click the map where you want to look from',
  createToposcope: 'Create toposcope from this view',
  toposcopeMergeModal: {
    title: 'Map is not empty',
    message:
      "Some points are already drawn on the map. Append the summits from this view to them, or replace them? The dial's centre moves to this viewpoint either way.",
    append: 'Append',
    replace: 'Replace',
  },
  settings: {
    title: 'Panorama settings',
    eye: 'Eye height',
    eyeHint:
      'How high above the ground you are standing — a tower or a drone, not the elevation itself.',
    tiltHint:
      'How much sky and ground the picture holds, as the angles above and below the horizon.',
    custom: 'Exact angles',
    depthLift: 'Unfold distance',
    depthLiftOff: 'True view',
    depthLiftHint:
      'Raises distant terrain so that far ranges separate from the ridges in front of them, the way a hand-drawn panorama does. It also brings into view summits you could not actually see from here; their names are marked.',
    range: 'Maximum visible distance',
    rangeHint:
      'Terrain past 300 km is premium’s. Every extra kilometre is walked along every ray of the picture, so a farther view costs the renderer proportionally more.',
    look: 'Look',
    looks: {
      natural: 'Natural',
      relief: 'Shaded relief',
      drawn: 'Drawn',
      engraved: 'Engraved',
      custom: 'Custom',
    },
    ridgeStrength: 'Ridge line strength',
    ridgeWidth: 'Ridge line thickness',
    ridgeColor: 'Ridge colour',
    groundColor: 'Ground colour',
  },
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
    weight: 'Rank peaks by',
    weightHint:
      'Size names the great mountains however far off; nearness names whatever fills the view.',
    weights: [
      'Size',
      'Mostly size',
      'Size and nearness',
      'Mostly nearness',
      'Nearness',
      'Strong nearness',
      'Nearness above all',
    ],
    haze: 'How far names carry',
    hazeOff: 'Clear air',
    hazeHint:
      'How far a summit must be before haze counts for more than the summit does. Past three times that, nothing is named at all.',
    showRevealed: 'Name revealed peaks',
    showRevealedHint:
      'Summits that unfolding lifted out from behind a nearer ridge: drawn, but not actually visible from here. Their names are drawn faded, and rank below the ones that can be seen where there is no room for both.',
  },
  dominance: {
    label: 'Minimum dominance',
    all: 'Any',
  },
  autoPan: 'Turn with the device, or by itself',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    // The dot is bound to the distance, so a tooltip narrow enough to wrap
    // breaks after it rather than starting a line with it.
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
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
    depthLift:
      'Distance is unfolded, so this picture is a drawing rather than a photograph: faded peak names stand behind a ridge that really hides them, and a distance read off the picture no longer means a clear line of sight.',
  },
  terrainSource: 'Terrain',
};

export default en;

import type { TerrainModelMessages } from './TerrainModelMessages.js';

const en: TerrainModelMessages = {
  area: 'Area',
  texture: 'Map on the preview',
  texturePlain: 'Plain',
  textureFailed: 'The map could not be loaded for this area.',
  previewUnavailable: 'The 3D preview is not available here.',
  viewArea:
    'A smoothed preview of the area. Once created, the model is shown as the file holds it, simplification included.',
  viewModel: 'A faithful preview of the created model.',
  build: 'Create model',
  sizeAndShape: 'Size and shape',
  dimensions: 'Model dimensions',
  scale: 'Scale',
  detail: ({ detail }) => `Horizontal resolution: ${detail} m`,
  premiumFiner: (premiumLink, { detail, premiumDetail }) => (
    <>
      With {premiumLink('premium access')}, the horizontal resolution goes down
      to {premiumDetail} m where national terrain models are that fine, instead
      of {detail} m.
    </>
  ),
  progressTiles: ({ done, total }) =>
    `Downloading elevation data (${done} / ${total})`,
  progressMesh: 'Building the model',
  progressFile: 'Writing the 3MF',
  exaggeration: 'Height exaggeration',
  exaggerationHint:
    'Heights are multiplied by it: above 1 the relief comes out steeper than it is.',
  base: 'Base thickness',
  simplification: 'Model simplification – maximum vertical deviation',
  simplificationOff: 'Off',
  areaTooLarge:
    'The area is too large for a model. Zoom in, or select a smaller area.',
  acrossAntimeridian:
    'The area crosses the 180th meridian. Select an area on one side of it.',
  download: 'Download STL',
  result: ({ height, triangles, size }) =>
    `Model height ${height} mm, ${triangles} triangles, ${size}.`,
  colourFeatures: 'Map features in colour',
  colourFeaturesHint:
    'The chosen features are coloured on the model in their map colours, and the model downloads as 3MF for a multi-colour print: each colour a filament. An area is filled where its fill on the map is at least half opaque, else only outlined.',
  lineWidth: 'Line width',
  pointSize: 'Point size',
  landcover: 'Landcover',
  landcoverFailed: 'The landcover could not be loaded.',
  landcoverDetail: 'Smallest landcover detail',
  landcoverClasses: {
    farmland: 'Farmland',
    meadow: 'Meadows and grass',
    builtUp: 'Built-up areas',
    forest: 'Forest',
    rock: 'Rock and scree',
    glacier: 'Glaciers',
    water: 'Water',
  },
  colours: 'Filament colours',
  ground: 'Ground',
  download3mf: 'Download 3MF',
  premiumRefused: ({ m }) =>
    `The premium elevation data was refused, so the model is built from data at ${m} m. Sign in again with a premium account for finer detail.`,
  partialData: ({ percent }) =>
    `${percent} of the area has no elevation data; it is flattened to the lowest point.`,
  noData: 'There is no elevation data in this area.',
  error: ({ err }) => `Error generating the model: ${err}`,
  shareCredits:
    'When you publish or share this model, accompany it with the following attribution:',
  creditsNone: 'The elevation data did not report which sources it comes from.',
  unknownSources: 'Sources that could not be named:',
  mentionFreemap: 'If you share the model, we would appreciate a mention of:',
  discardModelTitle: 'Discard the model',
  discardModelQuestion:
    'The model has not been downloaded yet. Do you want to discard it?',
};

export default en;

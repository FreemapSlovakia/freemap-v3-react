import type { TerrainModelMessages } from './TerrainModelMessages.js';

const en: TerrainModelMessages = {
  area: 'Area',
  width: 'Model width',
  size: ({ scale, width, depth }) =>
    `Scale 1 : ${scale}, ${width} × ${depth} mm`,
  grid: ({ step, cols, rows }) => `Grid ${step} mm (${cols} × ${rows} points)`,
  elevation: ({ m }) => `Elevation data read at ${m} m`,
  limitedBySamples: 'Detail is limited by the size of the model.',
  premiumFiner: (premiumLink, { step, data, premiumStep, premiumData }) => (
    <>
      With {premiumLink('premium access')}, the grid goes down to {premiumStep}{' '}
      mm, from data at {premiumData} m where national terrain models are that
      fine, instead of {step} mm from data at {data} m.
    </>
  ),
  limitedByData: 'The elevation data is no finer than this.',
  progressTiles: ({ done, total }) =>
    `Downloading elevation data (${done} / ${total})`,
  progressMesh: 'Building the model',
  exaggeration: 'Vertical exaggeration',
  base: 'Base thickness',
  simplification: 'Mesh simplification: maximum deviation',
  simplificationOff: 'Off',
  simplificationTooLarge:
    'This model has too many points to simplify in the browser; it is built in full.',
  simplificationHint:
    'Merges triangles while the surface stays within this height of the data, for a smaller file. On a gentle slope the printed outlines move sideways by several times as much — 0.02 mm is about 0.1 mm on a 10° slope — and merged triangles show as flat facets.',
  printer: 'Printer',
  bed: 'Build volume',
  layerHeight: 'Layer height',
  tooLarge: 'The model is larger than the build volume.',
  areaTooLarge:
    'The area is too large for a model. Zoom in, or select a smaller area.',
  acrossAntimeridian:
    'The area crosses the 180th meridian. Select an area on one side of it.',
  download: 'Download STL',
  result: ({ height, layers, triangles, size }) =>
    `Model height ${height} mm (${layers} layers), ${triangles} triangles, ${size}.`,
  tooTall: 'The model is taller than the build volume.',
  premiumRefused: ({ m }) =>
    `The premium elevation data was refused, so the model is built from data at ${m} m. Sign in again with a premium account for finer detail.`,
  partialData: ({ percent }) =>
    `${percent} of the area has no elevation data; it is flattened to the lowest point.`,
  noData: 'There is no elevation data in this area.',
  error: ({ err }) => `Error generating the model: ${err}`,
  credits: 'Elevation data',
};

export default en;

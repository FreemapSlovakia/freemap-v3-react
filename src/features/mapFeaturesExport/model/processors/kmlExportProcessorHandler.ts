import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { exportMapFeatures } from '../actions.js';
import { buildFilledFeatureCollection } from './buildFilledFeatureCollection.js';
import { geojsonToKml } from './geojsonToKml.js';
import { exportBlob, upload } from './upload.js';

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  // Visual export: bake each point into a raster marker (KML viewers render
  // only raster `<Icon>` hrefs), keeping the lightweight props as a fallback
  // tint when no canvas is available to rasterize.
  const fc = await buildFilledFeatureCollection(
    getState,
    action,
    { props: true, pngMarker: true },
    { route: 'all', trackingPoints: true },
  );

  const { kml, files } = geojsonToKml(fc, {
    documentName: action.payload.name,
  });

  const { target } = action.payload;

  // Marker images present → pack a self-contained KMZ (zipped KML + `files/`);
  // otherwise a plain `.kml` is enough and stays human-readable.
  let type: 'kml' | 'kmz';

  let blob: Blob;

  if (files.size > 0) {
    const { zipSync } = await import('fflate');

    // PNGs are already DEFLATE-compressed, so store them (level 0) rather than
    // burning CPU re-compressing; only the verbose doc.kml benefits from deflate.
    const entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
      'doc.kml': new TextEncoder().encode(kml),
    };

    for (const [name, bytes] of files) {
      entries[name] = [bytes, { level: 0 }];
    }

    type = 'kmz';

    blob = exportBlob(
      [zipSync(entries)],
      'application/vnd.google-earth.kmz',
      target,
    );
  } else {
    type = 'kml';

    blob = exportBlob([kml], 'application/vnd.google-earth.kml+xml', target);
  }

  if (await upload(type, blob, target, getState, dispatch)) {
    dispatch(setActiveModal(null));
  }
};

export default handle;

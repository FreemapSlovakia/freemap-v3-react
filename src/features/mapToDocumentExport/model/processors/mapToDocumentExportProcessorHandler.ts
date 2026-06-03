import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { buildExportFeatureCollection } from '@features/mapFeaturesExport/model/buildExportFeatureCollection.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { COLORS } from '@shared/colors.js';
import z from 'zod';
import { exportMapToDocument } from '../actions.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

const handle: ProcessorHandler<typeof exportMapToDocument> = async ({
  dispatch,
  getState,
  action,
}) => {
  const {
    scale,
    area,
    format,
    layers: exportLayers,
    exportables,
    customLayerOrder,
    decorations,
  } = action.payload;

  const bbox =
    area === 'visible' ? getState().map.bounds : getState().mapArea.bbox;

  if (!bbox) {
    return;
  }

  const exportableSet = new Set(exportables);

  // Raster map: bake each point's marker into a self-contained `marker-svg`
  // (icon + shape + color), emit only the active route alternative, the
  // tracking line without per-sample markers, and convert imported track
  // waypoints the same way (so their icons render too).
  const fc = await buildExportFeatureCollection({
    getState,
    include: {
      pictures: exportableSet.has('pictures'),
      drawingLines: exportableSet.has('drawingLines'),
      drawingAreas: exportableSet.has('drawingAreas'),
      drawingPoints: exportableSet.has('drawingPoints'),
      objects: exportableSet.has('objects'),
      plannedRoute: exportableSet.has('plannedRoute'),
      plannedRouteWithStops: exportableSet.has('plannedRouteWithStops'),
      tracking: exportableSet.has('tracking'),
      import: exportableSet.has('import'),
      search: exportableSet.has('search'),
    },
    pointMode: { svgMarker: true },
    options: {
      route: 'active',
      trackingPoints: false,
      lineColorFallback: COLORS.normal,
      lineWidthFallback: 4,
    },
  });

  window._paq.push(['trackEvent', 'MapExport', 'export', format]);

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: `${fmMapserverUrl}/export`,
    data: {
      bbox,
      zoom: getState().map.zoom,
      format,
      scale,
      decorations: {
        scaleBar: decorations.scaleBar, // bottom-left, metric, cos(lat)-corrected
        northArrow: decorations.northArrow, // top-right, static up-arrow + localized letter
        attribution: decorations.attribution, // bottom-right, right-aligned
      },
      features: {
        shading: exportLayers.includes('shading'),
        contours: exportLayers.includes('contours'),
        hikingTrails: exportLayers.includes('hikingTrails'),
        bicycleTrails: exportLayers.includes('bicycleTrails'),
        skiTrails: exportLayers.includes('skiTrails'),
        horseTrails: exportLayers.includes('horseTrails'),
        featureCollection: fc.features.length ? fc : undefined,
        featureCollectionOrder: customLayerOrder,
      },
    },
    expectedStatus: 200,
  });

  const data = z.object({ token: z.string() }).parse(await res.json());

  dispatch(setActiveModal(null));

  dispatch(
    toastsAdd({
      id: 'mapToDocumentExport.export',
      messageKey: 'mapToDocumentExport.exporting',
      style: 'info',
    }),
  );

  for (let i = 0; ; i++) {
    const t = Date.now();

    try {
      await httpRequest({
        getState,
        method: 'HEAD',
        url: `${fmMapserverUrl}/export?token=${encodeURIComponent(data.token)}`,
      });

      break;
    } catch (err) {
      if (i > 10 || Date.now() - t < 15000) {
        throw err;
      }
    }
  }

  dispatch(
    toastsAdd({
      id: 'mapToDocumentExport.export',
      messageKey: 'mapToDocumentExport.exported',
      messageParams: {
        url: `${fmMapserverUrl}/export?token=${data.token}`,
      },
      style: 'info',
    }),
  );
};

export default handle;

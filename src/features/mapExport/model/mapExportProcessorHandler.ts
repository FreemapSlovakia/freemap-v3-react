import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { buildMarkerSvg, resolveMarkerGlyph } from '@shared/markerSvg.js';
import { featureCollection, lineString, point, polygon } from '@turf/helpers';
import { Feature } from 'geojson';
import z from 'zod';
import { exportMap } from './actions.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

const handle: ProcessorHandler<typeof exportMap> = async ({
  dispatch,
  getState,
  action,
}) => {
  const {
    scale,
    area,
    format,
    layers: exportLayers,
    customLayerOrder,
    decorations,
  } = action.payload;

  const {
    drawingLines: { lines },
  } = getState();

  const bbox =
    area === 'visible' ? getState().map.bounds : getState().mapArea.bbox;

  if (!bbox) {
    return;
  }

  const features: Feature[] = [];

  if (exportLayers.includes('drawing')) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const stroke = splitColorAlpha(line.color ?? COLORS.normal);
      const fill = line.fillColor ? splitColorAlpha(line.fillColor) : undefined;

      const props = {
        title: line.label || '',
        stroke: stroke.color,
        'stroke-opacity': stroke.opacity < 1 ? stroke.opacity : undefined,
        fill: fill?.color,
        'fill-opacity': fill && fill.opacity < 1 ? fill.opacity : undefined,
        'stroke-width': line.width ?? 4,
        'stroke-linejoin': line.lineJoin,
        'stroke-linecap': line.lineCap,
        'stroke-dasharray': line.dashArray,
      };

      features.push(
        line.type === 'line'
          ? lineString(
              line.points.map((point) => [point.lon, point.lat]),
              props,
            )
          : polygon(
              [
                [
                  ...line.points.map((point) => [point.lon, point.lat]),
                  [line.points[0].lon, line.points[0].lat],
                ],
              ],
              props,
            ),
      );
    }

    // Caches shared across all points so identical fa/poi icons resolve (and
    // poi SVGs are fetched) only once.
    const faCache = new Map<string, IconDefinition | undefined>();
    const poiDataUrlCache = new Map<string, Promise<string | undefined>>();

    for (const p of getState().drawingPoints.points) {
      // Self-contained SVG of the whole marker (shape + fill color + icon/text),
      // mirroring the in-app RichMarker, so the server renders it as-is. The
      // color (incl. alpha) is baked into the SVG, so no separate marker-color
      // / markerType / icon properties are needed.
      const glyph = await resolveMarkerGlyph({
        icon: p.icon,
        label: p.label,
        faCache,
        poiDataUrlCache,
      });

      const { svg } = buildMarkerSvg({
        markerType: p.markerType,
        color: p.color ?? COLORS.normal,
        hasContent: glyph.hasContent,
        text: glyph.text,
        faSvg: glyph.faSvg,
        poiDataUrl: glyph.poiDataUrl,
        // Center the anchor in the viewBox so the server can place every
        // marker by centering it on the coordinate, with no shape knowledge.
        anchorAtCenter: true,
      });

      features.push(
        point([p.coords.lon, p.coords.lat], {
          title: p.label || '',
          'marker-svg': svg,
        }),
      );
    }
  }

  if (exportLayers.includes('plannedRoute')) {
    const { alternatives, activeAlternativeIndex } = getState().routePlanner;

    const alt = alternatives[activeAlternativeIndex];

    if (alt) {
      const coords: number[][] = [];

      for (const leg of alt.legs) {
        for (const step of leg.steps) {
          coords.push(...step.geometry.coordinates);
        }
      }

      features.push(lineString(coords, {}));
    }
  }

  if (exportLayers.includes('track')) {
    const { trackGeojson } = getState().trackViewer;

    if (trackGeojson && trackGeojson.type === 'FeatureCollection') {
      features.push(...trackGeojson.features);
    }
  }

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
        featureCollection: features.length
          ? featureCollection(features)
          : undefined,
        featureCollectionOrder: customLayerOrder,
      },
    },
    expectedStatus: 200,
  });

  const data = z.object({ token: z.string() }).parse(await res.json());

  dispatch(setActiveModal(null));

  dispatch(
    toastsAdd({
      id: 'mapExport.export',
      messageKey: 'mapExport.exporting',
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
      id: 'mapExport.export',
      messageKey: 'mapExport.exported',
      messageParams: {
        url: `${fmMapserverUrl}/export?token=${data.token}`,
      },
      style: 'info',
    }),
  );
};

export default handle;

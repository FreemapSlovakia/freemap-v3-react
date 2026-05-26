import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
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
  } = action.payload;

  const {
    main: { selection },
    drawingLines: { lines },
  } = getState();

  let bbox;

  if (area === 'visible') {
    bbox = getState().map.bounds;
  } else if (
    selection?.type === 'draw-line-poly' &&
    lines[selection.id]?.type === 'polygon'
  ) {
    // selected polygon

    bbox = lines[selection.id].points.reduce(
      (a, c) => [
        Math.min(a[0], c.lon),
        Math.min(a[1], c.lat),
        Math.max(a[2], c.lon),
        Math.max(a[3], c.lat),
      ],
      [Infinity, Infinity, -Infinity, -Infinity],
    );
  }

  if (!bbox) {
    return;
  }

  const features: Feature[] = [];

  if (exportLayers.includes('drawing')) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (
        area === 'selected' &&
        selection?.type === 'draw-line-poly' &&
        lines[selection.id]?.type === 'polygon' &&
        selection.id === i
      ) {
        // excluding bounding polygon
        continue;
      }

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

    for (const p of getState().drawingPoints.points) {
      const marker = splitColorAlpha(p.color ?? COLORS.normal);

      features.push(
        point([p.coords.lon, p.coords.lat], {
          title: p.label || '',
          'marker-color': marker.color,
          'marker-color-opacity':
            marker.opacity < 1 ? marker.opacity : undefined,
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

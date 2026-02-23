import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { exportMap } from '@features/export/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { featureCollection, lineString, point, polygon } from '@turf/helpers';
import { Feature } from 'geojson';
import { assert } from 'typia';
import { httpRequest } from '../../../app/httpRequest.js';
import { colors } from '../../../constants.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

const handle: ProcessorHandler<typeof exportMap> = async ({
  dispatch,
  getState,
  action,
}) => {
  const { scale, area, format, layers: exportLayers } = action.payload;

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

      features.push(
        line.type === 'line'
          ? lineString(
              line.points.map((point) => [point.lon, point.lat]),
              {
                name: line.label || '',
                color: line.color ?? colors.normal,
                width: line.width ?? 4,
              },
            )
          : polygon(
              [
                [
                  ...line.points.map((point) => [point.lon, point.lat]),
                  [line.points[0].lon, line.points[0].lat],
                ],
              ],
              {
                name: line.label || '',
                color: line.color ?? colors.normal,
                width: line.width ?? 4,
              },
            ),
      );
    }

    for (const p of getState().drawingPoints.points) {
      features.push(
        point([p.coords.lon, p.coords.lat], {
          name: p.label || '',
          color: p.color ?? colors.normal,
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
      },
    },
    expectedStatus: 200,
  });

  const data = assert<{ token: string }>(await res.json());

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

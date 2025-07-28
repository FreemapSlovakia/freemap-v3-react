import { lineString, point, polygon } from '@turf/helpers';
import { Feature, FeatureCollection } from 'geojson';
import { assert } from 'typia';
import { exportMap, setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { colors } from '../constants.js';
import { httpRequest } from '../httpRequest.js';
import { mapPromise } from '../leafletElementHolder.js';
import type { ProcessorHandler } from '../middlewares/processorMiddleware.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

const geometryTypeMapping = {
  Polygon: 'polygon',
  MultiPolygon: 'polygon',
  LineString: 'polyline',
  MultiLineString: 'polyline',
  Point: 'point',
  MultiPoint: 'point',
  GeometryCollection: 'geometrycollection',
} as const;

const handle: ProcessorHandler<typeof exportMap> = async ({
  dispatch,
  getState,
  action,
}) => {
  const { scale, area, format, layers: exportLayers, style } = action.payload;

  const {
    main: { selection },
    drawingLines: { lines },
  } = getState();

  let w: number | undefined = undefined;

  let n: number | undefined = undefined;

  let e: number | undefined = undefined;

  let s: number | undefined = undefined;

  if (area === 'visible') {
    const bounds = (await mapPromise).getBounds();

    w = bounds.getWest();

    n = bounds.getNorth();

    e = bounds.getEast();

    s = bounds.getSouth();
  } else if (
    selection?.type === 'draw-line-poly' &&
    lines[selection.id]?.type === 'polygon'
  ) {
    // selected polygon

    for (const { lat, lon } of lines[selection.id].points) {
      w = Math.min(w === undefined ? 1000 : w, lon);

      n = Math.max(n === undefined ? -1000 : n, lat);

      e = Math.max(e === undefined ? -1000 : e, lon);

      s = Math.min(s === undefined ? 1000 : s, lat);
    }
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
        point([p.lon, p.lat], {
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

  const f: Record<
    'polygon' | 'polyline' | 'point' | 'geometrycollection',
    Feature[]
  > = {
    polygon: [],
    polyline: [],
    point: [],
    geometrycollection: [],
  };

  for (const feature of features) {
    const type = geometryTypeMapping[feature.geometry.type];

    if (type) {
      f[type].push(feature);
    }
  }

  const layers: { styles: string[]; geojson: FeatureCollection }[] = [];

  for (const type of ['polygon', 'polyline', 'point'] as const) {
    if (f[type].length) {
      layers.push({
        styles: [`custom-${type}s`],
        geojson: {
          type: 'FeatureCollection',
          features: f[type],
        },
      });
    }
  }

  window._paq.push(['trackEvent', 'MapExport', 'export', format]);

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: `${fmMapserverUrl}/export`,
    data: {
      bbox: [w, s, e, n],
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
      },
      custom: layers.length
        ? { layers, styles: [{ Style: { '@name': '_new_' }, style }] } // TODO ugly hacked to support XML styles
        : undefined,
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

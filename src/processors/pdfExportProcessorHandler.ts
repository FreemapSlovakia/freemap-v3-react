import {
  Feature,
  FeatureCollection,
  Geometries,
  GeometryCollection,
  lineString,
  point,
  polygon,
} from '@turf/helpers';
import { exportPdf, setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';
import { assertType } from 'typescript-is';

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

const handle: ProcessorHandler<typeof exportPdf> = async ({
  dispatch,
  getState,
  action,
}) => {
  const le = getMapLeafletElement();

  if (!le) {
    return;
  }

  const {
    scale,
    area,
    format,
    shadedRelief,
    contours,
    hikingTrails,
    bicycleTrails,
    skiTrails,
    horseTrails,
    drawing,
    plannedRoute,
    track,
    style,
  } = action.payload;

  const {
    main: { selection },
    drawingLines: { lines },
  } = getState();

  let w: number | undefined = undefined;
  let n: number | undefined = undefined;
  let e: number | undefined = undefined;
  let s: number | undefined = undefined;

  if (area === 'visible') {
    const bounds = le.getBounds();
    w = bounds.getWest();
    n = bounds.getNorth();
    e = bounds.getEast();
    s = bounds.getSouth();
  } else {
    if (
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
  }

  const features: Feature<Geometries | GeometryCollection>[] = [];

  if (drawing) {
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
              { name: line.label || '' },
            )
          : polygon(
              [
                [
                  ...line.points.map((point) => [point.lon, point.lat]),
                  [line.points[0].lon, line.points[0].lat],
                ],
              ],
              { name: line.label || '' },
            ),
      );
    }

    for (const p of getState().drawingPoints.points) {
      features.push(point([p.lon, p.lat], { name: p.label || '' }));
    }
  }

  if (plannedRoute) {
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

  if (track) {
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

  const { data } = await httpRequest({
    getState,
    method: 'POST',
    url: `${fmMapserverUrl}/export`,
    data: {
      bbox: [w, s, e, n],
      zoom: getState().map.zoom,
      format,
      scale,
      features: {
        shading: shadedRelief,
        contours,
        hikingTrails,
        bicycleTrails,
        skiTrails,
        horseTrails,
      },
      custom: layers.length ? { layers, styles: JSON.parse(style) } : undefined,
    },
    expectedStatus: 200,
  });

  const okData = assertType<{ token: string }>(data);

  dispatch(setActiveModal(null));

  dispatch(
    toastsAdd({
      id: 'pdfExport.export',
      messageKey: 'pdfExport.exporting',
      style: 'info',
    }),
  );

  for (let i = 0; ; i++) {
    try {
      await httpRequest({
        getState,
        method: 'HEAD',
        url: `${fmMapserverUrl}/export`,
        params: {
          token: okData.token,
        },
        expectedStatus: 200,
      });

      break;
    } catch (err) {
      if (err.response || i > 10) {
        throw err;
      }
    }
  }

  dispatch(
    toastsAdd({
      id: 'pdfExport.export',
      messageKey: 'pdfExport.exported',
      messageParams: {
        url: `${fmMapserverUrl}/export?token=${okData.token}`,
      },
      style: 'info',
    }),
  );
};

export default handle;

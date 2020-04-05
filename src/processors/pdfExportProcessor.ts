import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest } from 'fm3/authAxios';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  lineString,
  point,
  polygon,
  featureCollection,
  Feature,
  Geometry,
} from '@turf/helpers';

const mapExportUrl =
  process.env.MAP_EXPORT_URL || 'https://outdoor.tiles.freemap.sk';

export const exportPdfProcessor: Processor<typeof exportPdf> = {
  actionCreator: exportPdf,
  errorKey: 'pdfExport.exportError',
  collapseKey: 'pdfExport.export',
  handle: async ({ dispatch, getState, action }) => {
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
    } = action.payload;

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
      const { selection } = getState().main;

      if (selection?.type === 'draw-polygons' && selection.id !== undefined) {
        // selected polygon

        for (const { lat, lon } of getState().drawingLines.lines[selection.id]
          .points) {
          w = Math.min(w === undefined ? 1000 : w, lon);
          n = Math.max(n === undefined ? -1000 : n, lat);
          e = Math.max(e === undefined ? -1000 : e, lon);
          s = Math.min(s === undefined ? 1000 : s, lat);
        }
      }
    }

    const features: Feature<Geometry>[] = getState().drawingLines.lines.map(
      (line) =>
        line.type === 'line'
          ? lineString(
              line.points.map((point) => [point.lon, point.lat]),
              { name: line.label },
            )
          : polygon(
              [
                [
                  ...line.points.map((point) => [point.lon, point.lat]),
                  [line.points[0].lon, line.points[0].lat],
                ],
              ],
              { name: line.label },
            ),
    );

    for (const p of getState().drawingPoints.points) {
      features.push(point([p.lon, p.lat], { name: p.label }));
    }

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: `${mapExportUrl}/export`,
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
        geojson: features.length ? featureCollection(features) : undefined,
      },
      expectedStatus: 200,
    });

    dispatch(setActiveModal(null));

    dispatch(
      toastsAdd({
        collapseKey: 'pdfExport.export',
        messageKey: 'pdfExport.exporting',
        style: 'info',
      }),
    );

    for (let i = 0; ; i++) {
      try {
        await httpRequest({
          getState,
          method: 'HEAD',
          url: `${mapExportUrl}/export`,
          params: {
            token: data.token,
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
        collapseKey: 'pdfExport.export',
        messageKey: 'pdfExport.exported',
        messageParams: {
          url: `${mapExportUrl}/export?token=${data.token}`,
        },
        style: 'info',
      }),
    );
  },
};

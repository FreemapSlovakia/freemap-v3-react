import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapToggleLayer } from '@features/map/model/actions.js';
import { cancelRegister } from '@shared/cancelRegister.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import area from '@turf/area';
import { bboxPolygon } from '@turf/bbox-polygon';
import { CRS, Point } from 'leaflet';
import RBush, { BBox } from 'rbush';
import { assert } from 'typia';
import { WikiPoint, wikiSetPoints } from '../actions.js';

interface WikiResponse {
  entities?: {
    [key: string]: {
      type: 'item';
      id: string;
      sitelinks: { [key: string]: { site: string; title: string } };
    };
  };
}

type WikiPoi = [
  wikipedia: string | null,
  wikidata: string | null,
  lon: number,
  lat: number,
  id: string,
  name: string | null,
];

let initial = true;

export const wikiLayerProcessor: Processor = {
  errorKey: 'general.loadError',
  async handle({ getState, dispatch, prevState }) {
    const {
      map: { layers, lat, lon, zoom },
      wiki: { points },
    } = getState();

    const prevMap = prevState.map;

    const ok0 = layers.includes('w');

    const ok = ok0 && zoom >= 8;

    const prevOk0 = prevMap.layers.includes('w');

    const prevOk = prevOk0 && prevMap.zoom >= 8;

    if (
      !initial &&
      `${lat},${lon},${ok}` === `${prevMap.lat},${prevMap.lon},${prevOk}`
    ) {
      return;
    }

    initial = false;

    if (!ok) {
      if (prevOk) {
        if (points.length) {
          dispatch(wikiSetPoints([]));
        }
      }

      return;
    }

    // debouncing
    try {
      await new Promise<void>((resolve, reject) => {
        const to = window.setTimeout(
          () => {
            cancelRegister.delete(cancelItem);

            resolve();
          },
          prevOk0 === ok0 ? 1000 : 0,
        );

        const cancelItem = {
          cancelActions: [mapRefocus, mapToggleLayer], // TODO use state
          cancel: () => {
            cancelRegister.delete(cancelItem);

            window.clearTimeout(to);

            reject();
          },
        };

        cancelRegister.add(cancelItem);
      });
    } catch {
      return;
    }

    let bb = (await mapPromise).getBounds();

    const areaSize = area(
      bboxPolygon([bb.getWest(), bb.getSouth(), bb.getEast(), bb.getNorth()]),
    );

    const scale = areaSize / (window.innerHeight * window.innerWidth);

    const res = await httpRequest({
      getState,
      method: 'GET',
      // url: `http://localhost:8040?bbox=${bb.getWest()},${bb.getSouth()},${bb.getEast()},${bb.getNorth()}&scale=${scale}`,
      url: `https://wiki-pois.freemap.sk/?bbox=${bb.getWest()},${bb.getSouth()},${bb.getEast()},${bb.getNorth()}&scale=${scale}`,
      expectedStatus: 200,
      cancelActions: [mapRefocus, mapToggleLayer],
    });

    const wikipedia2item = new Map<string, WikiPoi>();

    const wikidatas: string[] = [];

    const data = assert<WikiPoi[]>(await res.json());

    for (const item of data) {
      let wikipedia = item[0];

      const wikidata = item[1];

      if (wikipedia) {
        wikipedia = decodeURIComponent(wikipedia.replace(/_/g, ' '));
      }

      if (wikipedia) {
        wikipedia2item.set(wikipedia, item);
      } else if (wikidata) {
        wikidatas.push(wikidata);
      }
    }

    // NOTE we don't dispatch partial data yet as it would close popup of wikidata-only item

    const { language } = getState().l10n;

    const res1 = await httpRequest({
      getState,
      url:
        'https://www.wikidata.org/w/api.php?' +
        objectToURLSearchParams({
          origin: '*',
          action: 'wbgetentities',
          props: 'sitelinks',
          format: 'json',
          ids: wikidatas.slice(0, 50).join('|'), // API limit is 50
          sitefilter: `${language}wiki|enwiki`,
        }),
      expectedStatus: 200,
      cancelActions: [mapRefocus, mapToggleLayer],
    });

    const data1 = assert<WikiResponse>(await res1.json());

    for (const item of data) {
      if (item[0]) {
        continue;
      }

      const sitelinks = data1.entities?.[item[1] ?? '']?.sitelinks;

      if (!sitelinks) {
        continue;
      }

      const title = (sitelinks[language + 'wiki'] || sitelinks['enwiki'])
        ?.title;

      if (title == null) {
        continue;
      }

      const wikipedia =
        (language + 'wiki' in sitelinks ? language : 'en') + ':' + title;

      if (!wikipedia2item.has(wikipedia)) {
        item[0] = wikipedia;

        wikipedia2item.set(wikipedia, item);
      }
    }

    const MIN_DISTANCE = 40;

    const PLACEMENTS = [-1, 0, 3, 1, 4, 2, 5, 0, 3, 1, 4, 2, 5];

    type IndexType = BBox & { wikiPoint: WikiPoint; mapPoint: Point };

    const tree = new RBush<IndexType>();

    const items = [...wikipedia2item.values()]
      .map((e) => ({
        id: e[4],
        lat: e[3],
        lon: e[2],
        name: e[5] ?? e[0] ?? '???',
        wikipedia: e[0] ?? '',
      }))
      .map((wikiPoint) => ({
        wikiPoint,
        mapPoint: CRS.EPSG3857.latLngToPoint(
          { lat: wikiPoint.lat, lng: wikiPoint.lon },
          zoom,
        ),
      }));

    const sparsePoints: WikiPoint[] = [];

    for (const item of items) {
      const { mapPoint, wikiPoint } = item;

      attempts: for (let i = -1; i < 12; i++) {
        const r = i < 6 ? MIN_DISTANCE + 0.1 : 2 * MIN_DISTANCE + 0.2;

        const x =
          mapPoint.x +
          (i < 0 ? 0 : r * Math.sin((PLACEMENTS[i] * Math.PI) / 3));

        const y =
          mapPoint.y +
          (i < 0 ? 0 : r * Math.cos((PLACEMENTS[i] * Math.PI) / 3));

        const offsetPoint = new Point(x, y);

        const bbox: IndexType = {
          minX: x - MIN_DISTANCE,
          minY: y - MIN_DISTANCE,
          maxX: x + MIN_DISTANCE,
          maxY: y + MIN_DISTANCE,
          wikiPoint,
          mapPoint: offsetPoint,
        };

        for (const a of tree.search(bbox)) {
          if (
            Math.sqrt((x - a.mapPoint.x) ** 2 + (y - a.mapPoint.y) ** 2) <
            MIN_DISTANCE
          ) {
            continue attempts;
          }
        }

        const latLng = CRS.EPSG3857.pointToLatLng(offsetPoint, zoom);

        sparsePoints.push({ ...wikiPoint, lat: latLng.lat, lon: latLng.lng });

        tree.insert(bbox);

        break;
      }
    }

    bb = (await mapPromise).getBounds();

    const pointMap = new Map(
      getState()
        .wiki.points.filter((point) =>
          bb.contains({ lat: point.lat, lng: point.lon }),
        )
        .map((point) => [point.id, point]),
    );

    dispatch(
      wikiSetPoints(
        sparsePoints.map((point) => pointMap.get(point.id) ?? point),
      ),
    );
  },
};

import area from '@turf/area';
import bboxPolygon from '@turf/bbox-polygon';
import { mapRefocus } from 'fm3/actions/mapActions';
import { wikiSetPoints } from 'fm3/actions/wikiActions';
import { cancelRegister } from 'fm3/cancelRegister';
import { httpRequest } from 'fm3/httpRequest';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { assertType } from 'typescript-is';

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
      map: { overlays, lat, lon, zoom },
      wiki: { points },
    } = getState();

    const prevMap = prevState.map;

    const ok0 = overlays.includes('w');

    const ok = ok0 && zoom >= 8;

    const prevOk0 = prevMap.overlays.includes('w');

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
          cancelActions: [mapRefocus],
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

    const bb = (await mapPromise).getBounds();

    const areaSize = area(
      bboxPolygon([bb.getWest(), bb.getSouth(), bb.getEast(), bb.getNorth()]),
    );

    const scale = areaSize / (window.innerHeight * window.innerWidth);

    const res = await httpRequest({
      getState,
      method: 'GET',
      // url: `http://localhost:8040?bbox=${bb.getWest()},${bb.getSouth()},${bb.getEast()},${bb.getNorth()}&scale=${scale}`,
      url: `https://backend.freemap.sk/wiki-pois?bbox=${bb.getWest()},${bb.getSouth()},${bb.getEast()},${bb.getNorth()}&scale=${scale}`,
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    const wikipedia2item = new Map<string, WikiPoi>();

    const wikidatas: string[] = [];

    const data = assertType<WikiPoi[]>(await res.json());

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
    // dispatch(
    //   wikiSetPoints(
    //     [...m.values()].map((e: any) => ({
    //       id: e.id,
    //       lat: e.center?.lat ?? e.lat,
    //       lon: e.center?.lon ?? e.lon,
    //       name: e.tags?.name,
    //       wikipedia: e.tags.wikipedia,
    //     })),
    //   ),
    // );

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
      cancelActions: [mapRefocus],
    });

    const data1 = assertType<WikiResponse>(await res1.json());

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

    dispatch(
      wikiSetPoints(
        [...wikipedia2item.values()].map((e) => ({
          id: e[4],
          lat: e[3],
          lon: e[2],
          name: e[5] ?? e[0] ?? '???',
          wikipedia: e[0] ?? '',
        })),
      ),
    );
  },
};

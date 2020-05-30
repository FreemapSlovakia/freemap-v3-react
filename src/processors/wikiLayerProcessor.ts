import { Processor } from 'fm3/middlewares/processorMiddleware';
import { httpRequest, cancelRegister } from 'fm3/authAxios';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { mapRefocus } from 'fm3/actions/mapActions';
import { wikiSetPoints } from 'fm3/actions/wikiActions';
import { enableUpdatingUrl } from 'fm3/actions/mainActions';
import { isActionOf } from 'typesafe-actions';

let prev = false;

export const wikiLayerProcessor: Processor = {
  actionCreator: [mapRefocus, enableUpdatingUrl /* for initial */],
  errorKey: 'tracking.loadError', // TODO
  handle: async ({ getState, dispatch, action }) => {
    const moved =
      isActionOf(mapRefocus, action) &&
      ['lat', 'lon', 'zoom'].some((prop) => prop in action.payload);

    const {
      map: { overlays, zoom },
      wiki: { points },
    } = getState();

    const curr = overlays.includes('w');
    const changed = prev != curr;
    prev = curr;

    if (!changed && !moved) {
      return;
    }

    if (!curr || zoom < 12) {
      if (points.length) {
        dispatch(wikiSetPoints([]));
      }

      return;
    }

    // debouncing
    try {
      await new Promise((resolve, reject) => {
        const to = window.setTimeout(
          () => {
            cancelRegister.delete(cancelItem);
            resolve();
          },
          changed ? 0 : 3000,
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

    const le = getMapLeafletElement();

    if (!le) {
      return;
    }

    const b = le.getBounds();

    const { data } = await httpRequest({
      getState,
      method: 'POST',
      url: '//overpass-api.de/api/interpreter',
      data:
        `[out:json][bbox:${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}];(` +
        `node[~"^wikipedia$|^wikidata$"~"."];` +
        `way[~"^wikipedia$|^wikidata$"~"."];` +
        `relation[~"^wikipedia$|^wikidata$"~"."];` +
        ');out tags center;',
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    const m = new Map<string, any>();

    const wikidatas: string[] = [];

    for (const e of data.elements) {
      if (e.tags.wikipedia) {
        e.tags.wikipedia = decodeURIComponent(
          e.tags.wikipedia.replace(/_/g, ' '),
        );
      }

      const { wikipedia } = e.tags;

      if (wikipedia) {
        const e1 = m.get(wikipedia);

        if (
          !e1 ||
          e1.type === 'relation' ||
          (e1.type === 'way' && e.type === 'relation')
        ) {
          m.set(wikipedia, e);
        }
      } else {
        wikidatas.push(e.tags.wikidata);
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

    const { data: data1 } = await httpRequest({
      getState,
      method: 'GET',
      url: 'https://www.wikidata.org/w/api.php',
      params: {
        origin: '*',
        action: 'wbgetentities',
        props: 'sitelinks',
        format: 'json',
        ids: wikidatas.join('|'),
        sitefilter: `${language}wiki|enwiki`,
      },
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    for (const e of data.elements) {
      if (e.tags.wikipedia) {
        continue;
      }

      const sitelinks = data1.entities[e.tags.wikidata]?.sitelinks;

      if (!sitelinks) {
        continue;
      }

      const title = (sitelinks[`${language}wiki`] || sitelinks['enwiki'])
        ?.title;

      if (title == null) {
        continue;
      }

      const wikipedia = `${
        `${language}wiki` in sitelinks ? language : 'en'
      }:${title}`;

      const e1 = m.get(wikipedia);

      if (
        !e1 ||
        e1.type === 'relation' ||
        (e1.type === 'way' && e.type === 'relation')
      ) {
        e.tags.wikipedia = wikipedia;
        m.set(wikipedia, e);
      }
    }

    dispatch(
      wikiSetPoints(
        [...m.values()].map((e: any) => ({
          id: e.id,
          lat: e.center?.lat ?? e.lat,
          lon: e.center?.lon ?? e.lon,
          name: e.tags?.name,
          wikipedia: e.tags.wikipedia,
        })),
      ),
    );
  },
};

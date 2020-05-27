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

    // debouncing; TODO don't debounce enableUpdatingUrl
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
        `node["wikipedia"];` +
        `way["wikipedia"];` +
        `relation["wikipedia"];` +
        ');out tags center;',
      expectedStatus: 200,
      cancelActions: [mapRefocus],
    });

    const m = new Map<string, any>();

    for (const e of data.elements) {
      m.set(e.tags.wikipedia, e);
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

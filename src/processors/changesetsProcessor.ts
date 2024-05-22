import {
  Changeset,
  changesetsSet,
  changesetsSetParams,
} from 'fm3/actions/changesetsActions';
import {
  clearMapFeatures,
  selectFeature,
  setTool,
} from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd, toastsRemove } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/httpRequest';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { objectToURLSearchParams } from 'fm3/stringUtils';
import { getType } from 'typesafe-actions';

export const changesetsTrackProcessor: Processor = {
  stateChangePredicate: (state) =>
    [state.changesets.days, state.changesets.authorName].join(','),
  handle: ({ getState }) => {
    const { changesets } = getState();

    const sp = new URLSearchParams();

    if (changesets.days) {
      sp.append('days', String(changesets.days));
    }

    if (changesets.authorName) {
      sp.append('authorName', changesets.authorName);
    }

    window._paq.push(['trackEvent', 'Changesets', 'set', sp.toString()]);
  },
};

export const changesetsProcessor: Processor = {
  id: 'changeset.detail',
  actionCreator: [changesetsSetParams, mapRefocus, setTool],
  errorKey: 'changesets.fetchError',
  handle: async ({ dispatch, getState }) => {
    const state = getState();

    if (state.main.tool !== 'changesets') {
      return;
    }

    const { zoom } = state.map;

    const { days, authorName } = state.changesets;

    const days2 = days ?? 3;

    if (
      !authorName &&
      ((days2 > 2 && zoom < 10) ||
        (days2 > 6 && zoom < 11) ||
        (days2 > 13 && zoom < 12) ||
        (days2 > 29 && zoom < 13))
    ) {
      dispatch(changesetsSet([]));

      dispatch(
        toastsAdd({
          id: 'changeset.detail',
          messageKey: 'changesets.tooBig',
          cancelType: [
            getType(selectFeature),
            getType(changesetsSetParams),
            getType(setTool),
            getType(clearMapFeatures),
          ],
          timeout: 5000,
          style: 'warning',
        }),
      );

      return;
    }

    dispatch(toastsRemove('changeset.detail'));

    const t = new Date();

    t.setDate(t.getDate() - (state.changesets.days ?? 3));

    const fromTime = `${t.getFullYear()}/${
      t.getMonth() + 1
    }/${t.getDate()}T00:00:00+00:00`;

    const bbox = (await mapPromise).getBounds().toBBoxString();

    await loadChangesets(null, []);

    async function loadChangesets(
      toTime0: string | null,
      changesetsFromPreviousRequest: Changeset[],
    ): Promise<void> {
      const res = await httpRequest({
        getState,
        url:
          '//api.openstreetmap.org/api/0.6/changesets?' +
          objectToURLSearchParams({
            bbox,
            time: fromTime + (toTime0 ? `,${toTime0}` : ''),
            // eslint-disable-next-line
            display_name: state.changesets.authorName ?? undefined,
          }),
        expectedStatus: [200, 404],
        cancelActions: [
          changesetsSetParams,
          mapRefocus,
          selectFeature,
          clearMapFeatures,
          setTool,
        ],
      });

      const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');

      const rawChangesets = xml.getElementsByTagName('changeset');

      const arrayOfrawChangesets = Array.from(rawChangesets);

      const changesetsFromThisRequest = arrayOfrawChangesets
        .map((rawChangeset) => {
          const minLat = parseFloat(rawChangeset.getAttribute('min_lat') ?? '');

          const maxLat = parseFloat(rawChangeset.getAttribute('max_lat') ?? '');

          const minLon = parseFloat(rawChangeset.getAttribute('min_lon') ?? '');

          const maxLon = parseFloat(rawChangeset.getAttribute('max_lon') ?? '');

          const descriptionTag = Array.from(
            rawChangeset.getElementsByTagName('tag'),
          ).find((tag) => tag.getAttribute('k') === 'comment');

          const changeset: Changeset = {
            userName: rawChangeset.getAttribute('user') ?? '???',
            id: Number(rawChangeset.getAttribute('id') ?? '???'),
            centerLat: (minLat + maxLat) / 2.0,
            centerLon: (minLon + maxLon) / 2.0,
            closedAt: new Date(rawChangeset.getAttribute('closed_at') ?? '???'),
            description: descriptionTag?.getAttribute('v') ?? '???',
          };

          return changeset;
        })
        .filter(
          (changeset) =>
            changeset.centerLat > 47.63617 &&
            changeset.centerLat < 49.66746 &&
            changeset.centerLon > 16.69965 &&
            changeset.centerLon < 22.67475,
        );

      const allChangesetsSoFar = [...changesetsFromPreviousRequest];

      const allChangesetSoFarIDs = allChangesetsSoFar.map((ch) => ch.id);

      for (const ch of changesetsFromThisRequest) {
        if (allChangesetSoFarIDs.indexOf(ch.id) < 0) {
          // occasionally the changeset may already be here from previous ajax request
          allChangesetsSoFar.push(ch);
        }
      }

      dispatch(changesetsSet(allChangesetsSoFar));

      if (arrayOfrawChangesets.length === 100) {
        const toTimeOfOldestChangeset =
          arrayOfrawChangesets[arrayOfrawChangesets.length - 1].getAttribute(
            'closed_at',
          );

        await loadChangesets(toTimeOfOldestChangeset, allChangesetsSoFar);

        return;
      }

      if (allChangesetsSoFar.length === 0) {
        dispatch(
          toastsAdd({
            id: 'changeset.detail',
            messageKey: 'changesets.notFound',
            cancelType: [
              getType(selectFeature),
              getType(changesetsSetParams),
              getType(setTool),
              getType(clearMapFeatures),
              getType(mapRefocus),
            ],
            timeout: 5000,
            style: 'info',
          }),
        );
      }
    }
  },
};

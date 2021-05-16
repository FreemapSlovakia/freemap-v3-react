import {
  Changeset,
  changesetsSet,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { clearMap, selectFeature } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { httpRequest } from 'fm3/authAxios';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { getType } from 'typesafe-actions';
import { assertType } from 'typescript-is';

// interface Changeset {
//   userName: string | null;
//   id: string | null;
//   centerLat: number;
//   centerLon: number;
//   closedAt: Date;
//   description: string | null | undefined;
// }

export const changesetsProcessor: Processor = {
  actionCreator: changesetsSetAuthorName,
  errorKey: 'changesets.fetchError',
  handle: async ({ dispatch, getState }) => {
    const le = getMapLeafletElement();

    const state = getState();

    if (!le || state.changesets.days === null) {
      return;
    }

    const t = new Date();

    t.setDate(t.getDate() - state.changesets.days);

    const fromTime = `${t.getFullYear()}/${
      t.getMonth() + 1
    }/${t.getDate()}T00:00:00+00:00`;

    const bbox = le.getBounds().toBBoxString();

    await loadChangesets(null, []);

    async function loadChangesets(
      toTime0: string | null,
      changesetsFromPreviousRequest: Changeset[],
    ): Promise<void> {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: '//api.openstreetmap.org/api/0.6/changesets',
        expectedStatus: [200, 404],
        params: {
          bbox,
          time: fromTime + (toTime0 ? `,${toTime0}` : ''),
          // eslint-disable-next-line
          display_name: state.changesets.authorName,
        },
        cancelActions: [changesetsSetAuthorName, selectFeature, clearMap],
      });

      const xml = new DOMParser().parseFromString(
        assertType<string>(data),
        'text/xml',
      );

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

      changesetsFromThisRequest.forEach((ch) => {
        if (allChangesetSoFarIDs.indexOf(ch.id) < 0) {
          // occasionally the changeset may already be here from previous ajax request
          allChangesetsSoFar.push(ch);
        }
      });

      dispatch(changesetsSet(allChangesetsSoFar));

      if (arrayOfrawChangesets.length === 100) {
        const toTimeOfOldestChangeset =
          arrayOfrawChangesets[arrayOfrawChangesets.length - 1].getAttribute(
            'closed_at',
          );

        return loadChangesets(toTimeOfOldestChangeset, allChangesetsSoFar);
      }

      if (allChangesetsSoFar.length === 0) {
        dispatch(
          toastsAdd({
            id: 'changeset.detail',
            messageKey: 'changesets.notFound',
            cancelType: [
              getType(selectFeature),
              getType(changesetsSetAuthorName),
            ],
            timeout: 5000,
            style: 'info',
          }),
        );
      }
    }
  },
};

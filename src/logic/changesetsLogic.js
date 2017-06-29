import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { changesetsAdd } from 'fm3/actions/changesetsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { toastsAdd } from 'fm3/actions/toastsActions';

const DOMParser = require('xmldom').DOMParser; // TODO browsers have native DOM implementation - use that

export const changesetsLogic = createLogic({
  type: ['CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH'],
  cancelType: ['CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH', 'SET_TOOL'],
  process({ getState, cancelled$ }, dispatch, done) {
    const state = getState();

    const t = new Date();
    t.setDate(t.getDate() - state.changesets.days);
    const fromTime = `${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()}T00:00:00+00:00`;
    const toTime = null;
    const bbox = getMapLeafletElement().getBounds().toBBoxString();

    let stop = false;

    const pid = Math.random();
    dispatch(startProgress(pid));
    cancelled$.subscribe(() => {
      stop = true;
      dispatch(stopProgress(pid));
    });

    loadChangesets(toTime, [])
      .catch(() => {})
      .then(() => {
        dispatch(stopProgress(pid));
        done();
      });

    function loadChangesets(toTime0, changesetsFromPreviousRequest) {
      if (stop) {
        return Promise.resolve();
      }

      let time = fromTime;
      if (toTime0) {
        time += `,${toTime0}`;
      }

      let url = `//api.openstreetmap.org/api/0.6/changesets?bbox=${bbox}&time=${time}`;
      if (state.changesets.authorName) {
        url += `&display_name=${encodeURIComponent(state.changesets.authorName)}`;
      }

      return fetch(url)
        .then(response => response.text())
        .then((data) => {
          const xml = new DOMParser().parseFromString(data);
          const rawChangesets = xml.getElementsByTagName('changeset');
          const arrayOfrawChangesets = Array.from(rawChangesets);
          const changesetsFromThisRequest = arrayOfrawChangesets.map((rawChangeset) => {
            const minLat = parseFloat(rawChangeset.getAttribute('min_lat'));
            const maxLat = parseFloat(rawChangeset.getAttribute('max_lat'));
            const minLon = parseFloat(rawChangeset.getAttribute('min_lon'));
            const maxLon = parseFloat(rawChangeset.getAttribute('max_lon'));

            const descriptionTag = Array.from(rawChangeset.getElementsByTagName('tag')).find(tag => tag.getAttribute('k') === 'comment');

            const changeset = {
              userName: rawChangeset.getAttribute('user'),
              id: rawChangeset.getAttribute('id'),
              centerLat: (minLat + maxLat) / 2.0,
              centerLon: (minLon + maxLon) / 2.0,
              closedAt: new Date(rawChangeset.getAttribute('closed_at')),
              description: descriptionTag && descriptionTag.getAttribute('v'),
            };

            return changeset;
          })
          .filter(changeset => changeset.centerLat > 47.63617
            && changeset.centerLat < 49.66746
            && changeset.centerLon > 16.69965
            && changeset.centerLon < 22.67475);

          const allChangesetsSoFar = [...changesetsFromPreviousRequest];
          const allChangesetSoFarIDs = allChangesetsSoFar.map(ch => ch.id);
          changesetsFromThisRequest.forEach((ch) => {
            if (allChangesetSoFarIDs.indexOf(ch.id) < 0) { // occasionally the changeset may already be here from previous ajax request
              allChangesetsSoFar.push(ch);
            }
          });
          dispatch(changesetsAdd(allChangesetsSoFar));
          if (arrayOfrawChangesets.length === 100) {
            const toTimeOfOldestChangeset = arrayOfrawChangesets[arrayOfrawChangesets.length - 1].getAttribute('closed_at');
            return loadChangesets(toTimeOfOldestChangeset, allChangesetsSoFar);
          } else if (allChangesetsSoFar.length === 0) {
            dispatch(toastsAdd({
              collapseKey: 'changeset.detail',
              message: 'Neboli nájdené žiadne zmeny',
              cancelType: ['SET_TOOL', 'CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH'],
              timeout: 3000,
              style: 'info',
            }));
          }
          return Promise.resolve();
        });
    }
  },
});

export default changesetsLogic;

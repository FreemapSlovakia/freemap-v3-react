import { createLogic } from 'redux-logic';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { changesetsAdd } from 'fm3/actions/changesetsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { toastsAdd } from 'fm3/actions/toastsActions';

const DOMParser = require('xmldom').DOMParser; // TODO browsers have native DOM implementation - use that

export const changesetsLogic = createLogic({
  type: ['SET_TOOL', 'CHANGESETS_REFRESH'],
  cancelType: ['SET_TOOL', 'CHANGESETS_REFRESH'],
  process({ getState }, dispatch, done) {
    const state = getState();
    const tool = state.main.tool;
    if (tool === 'changesets') {
      const t = new Date();
      t.setDate(t.getDate() - state.changesets.days);
      const fromTime = `${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()}T00:00:00+00:00`;
      const toTime = null;
      const bbox = getMapLeafletElement().getBounds().toBBoxString();

      dispatch(startProgress());
      loadChangesets(dispatch, done, bbox, fromTime, toTime, []);
    } else {
      done();
    }
  },
});

export default changesetsLogic;

function loadChangesets(dispatch, done, bbox, fromTime, toTime, changesetsFromPreviousRequest) {
  let time = fromTime;
  if (toTime) {
    time += `,${toTime}`;
  }
  fetch(`//api.openstreetmap.org/api/0.6/changesets?bbox=${bbox}&time=${time}`)
    .then(response => response.text())
    .then((data) => {
      const xml = new DOMParser().parseFromString(data);
      const rawChangesets = xml.getElementsByTagName('changeset');
      const changesetsFromThisRequest = [];
      const arrayOfrawChangesets = Array.from(rawChangesets);
      arrayOfrawChangesets.forEach((rawChangeset) => {
        const changeset = {};
        changeset.userName = rawChangeset.getAttribute('user');
        changeset.id = rawChangeset.getAttribute('id');
        const minLat = parseFloat(rawChangeset.getAttribute('min_lat'));
        const maxLat = parseFloat(rawChangeset.getAttribute('max_lat'));
        const minLon = parseFloat(rawChangeset.getAttribute('min_lon'));
        const maxLon = parseFloat(rawChangeset.getAttribute('max_lon'));
        changeset.centerLat = (minLat + maxLat) / 2.0;
        changeset.centerLon = (minLon + maxLon) / 2.0;
        changeset.closedAt = new Date(rawChangeset.getAttribute('closed_at'));
        Array.from(rawChangeset.getElementsByTagName('tag')).forEach((tag) => {
          if (tag.getAttribute('k') === 'comment') {
            changeset.description = tag.getAttribute('v');
          }
        });

        const centerIsInSlovakia = 47.63617 < changeset.centerLat && changeset.centerLat< 49.66746 && 16.69965 < changeset.centerLon && changeset.centerLon < 22.67475; // eslint-disable-line
        if (centerIsInSlovakia) {
          changesetsFromThisRequest.push(changeset);
        }
      });

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
        loadChangesets(dispatch, done, bbox, fromTime, toTimeOfOldestChangeset, allChangesetsSoFar);
      } else {
        if (allChangesetsSoFar.length === 0) {
          dispatch(toastsAdd({
            collapseKey: 'changeset.detail',
            message: 'Neboli nájdené žiadne zmeny',
            cancelType: ['SET_TOOL', 'CHANGESETS_REFRESH'],
            timeout: 3000,
            style: 'info',
          }));
        }
        dispatch(stopProgress());
        done();
      }
    });
}

import { createLogic } from 'redux-logic';
import strftime from 'strftime';

import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { changesetsAdd } from 'fm3/actions/changesetsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

const DOMParser = require('xmldom').DOMParser; // TODO browsers have native DOM implementation - use that

export const changesetsLogic = createLogic({
  type: ['SET_TOOL', 'CHANGESETS_REFRESH'],
  cancelType: ['SET_TOOL', 'CHANGESETS_REFRESH'],
  process({ getState }, dispatch, done) {
    const state = getState();
    const tool = state.main.tool;
    if (tool === 'changesets') {
      const fromTime = new Date();
      fromTime.setDate(fromTime.getDate() - state.changesets.days);
      const timestamp = strftime('%y/%m/%d', fromTime);
      const bounds = getMapLeafletElement().getBounds();
      dispatch(startProgress());
      fetch(`//api.openstreetmap.org/api/0.6/changesets?bbox=${bounds.toBBoxString()}&time=${timestamp}T00:00:00+00:00`)
        .then(response => response.text())
        .then((data) => {
          const xml = new DOMParser().parseFromString(data);
          const rawChangesets = xml.getElementsByTagName('changeset');
          const changesets = [];
          Array.from(rawChangesets).forEach((rawChangeset) => {
            const changeset = {};
            changeset.userName = rawChangeset.getAttribute('user');
            changeset.id = rawChangeset.getAttribute('id');
            const minLat = parseFloat(rawChangeset.getAttribute('min_lat'));
            const maxLat = parseFloat(rawChangeset.getAttribute('max_lat'));
            const minLon = parseFloat(rawChangeset.getAttribute('min_lon'));
            const maxLon = parseFloat(rawChangeset.getAttribute('max_lon'));
            changeset.centerLat = (minLat + maxLat) / 2.0;
            changeset.centerLon = (minLon + maxLon) / 2.0;
            // changeset.commentCount = rawChangeset.getAttribute('comments_count');
            changeset.closedAt = new Date(rawChangeset.getAttribute('closed_at'));
            Array.from(rawChangeset.getElementsByTagName('tag')).forEach((tag) => {
              if (tag.getAttribute('k') === 'comment') {
                changeset.description = tag.getAttribute('v');
              }
            });
            changesets.push(changeset);
          });
          dispatch(changesetsAdd(changesets));
        }).then(() => {
          dispatch(stopProgress());
          done();
        });
    } else {
      done();
    }
  },
});

export default changesetsLogic;

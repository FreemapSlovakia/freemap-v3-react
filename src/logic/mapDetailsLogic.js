import axios from 'axios';
import { createLogic } from 'redux-logic';
import React from 'react';

import * as at from 'fm3/actionTypes';
import { mapDetailsSetTrackInfoPoints } from 'fm3/actions/mapDetailsActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import { resolveTrackSurface, resolveTrackClass, resolveBicycleTypeSuitableForTrack, translate } from 'fm3/osmOntologyTools';

const dateFormat = new Intl.DateTimeFormat(
  'sk',
  { day: '2-digit', month: '2-digit', year: 'numeric' },
);

export default createLogic({
  type: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
  cancelType: [at.SET_TOOL, at.CLEAR_MAP],
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    let way;
    let bbox;
    const state = getState();
    const { subtool, userSelectedLat, userSelectedLon } = state.mapDetails;
    if (subtool === 'track-info') {
      const pid = Math.random();
      dispatch(startProgress(pid));

      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      bbox = [userSelectedLat - 0.0004, userSelectedLon - 0.0005, userSelectedLat + 0.0004, userSelectedLon + 0.0005];
      const body = `[out:json][bbox:${bbox.join(',')}];way['highway'];out 1 geom meta;`; // definitely the worst query language syntax ever
      axios.post('//overpass-api.de/api/interpreter', body, {
        validateStatus: status => status === 200,
        cancelToken: source.token,
      })
        .then(({ data }) => {
          if (data.elements && data.elements.length === 1) {
            [way] = data.elements;
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              message: toToastMessage(),
              cancelType: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
              style: 'info',
            }));
            dispatch(mapDetailsSetTrackInfoPoints(way.geometry));
          } else {
            dispatch(toastsAdd({
              collapseKey: 'mapDetails.trackInfo.detail',
              messageKey: 'mapDetails.notFound',
              cancelType: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
              timeout: 5000,
              style: 'info',
            }));
            dispatch(mapDetailsSetTrackInfoPoints(null));
          }
        })
        .catch((e) => {
          dispatch(toastsAddError(`Nastala chyba pri získavaní detailov o ceste: ${e}`));
        })
        .then(() => {
          storeDispatch(stopProgress(pid));
          done();
        });
    } else {
      done();
    }

    function handleJosmClick() {
      axios.get(`${window.location.protocol}//localhost:${window.location.protocol === 'http:' ? 8111 : 8112}/load_and_zoom`, {
        params: {
          select: `way${way.id}`,
          left: bbox[1],
          right: bbox[3],
          top: bbox[2],
          bottom: bbox[0],
        },
      });
    }

    function toToastMessage() {
      const trackClass = resolveTrackClass(way.tags);
      const surface = resolveTrackSurface(way.tags);
      const bicycleType = resolveBicycleTypeSuitableForTrack(way.tags);
      const isBicycleMap = state.map.mapType === 'C';
      const lastEditAt = dateFormat.format(new Date(way.timestamp));
      return (
        <div>
          <dl className="dl-horizontal">
            <dt>Typ cesty:</dt>
            <dd style={{ whiteSpace: 'nowrap' }}>{translate('track-class', trackClass)}</dd>
            <dt>Povrch:</dt>
            <dd>{translate('surface', surface)}</dd>
            {isBicycleMap && <dt>Vhodný typ bicykla:</dt>}
            {isBicycleMap && <dd style={{ whiteSpace: 'nowrap' }}>{translate('bicycle-type', bicycleType)}</dd>}
            <dt>Posledná zmena:</dt>
            <dd>{lastEditAt}</dd>
          </dl>
          <p>
            Upraviť v editore{' '}
            <a
              href={`https://www.openstreetmap.org/edit?editor=id&way=${way.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              iD
            </a>
            {', alebo '}
            <a
              onClick={handleJosmClick}
              role="button"
              tabIndex={0}
            >
              JOSM
            </a>
          </p>
        </div>
      );
    }
  },
});


import axios from 'axios';
import React from 'react';
import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';
import { mapDetailsSetTrackInfoPoints } from 'fm3/actions/mapDetailsActions';
import { toastsAdd, toastsAddError } from 'fm3/actions/toastsActions';
import { startProgress, stopProgress } from 'fm3/actions/mainActions';
import RoadDetails from 'fm3/components/RoadDetails';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';

export default createLogic({
  type: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
  cancelType: [at.SET_TOOL, at.CLEAR_MAP],
  process({ getState, cancelled$, storeDispatch }, dispatch, done) {
    const { subtool, userSelectedLat, userSelectedLon } = getState().mapDetails;
    if (subtool === 'track-info') {
      const pid = Math.random();
      dispatch(startProgress(pid));

      const source = axios.CancelToken.source();
      cancelled$.subscribe(() => {
        source.cancel();
      });

      axios.post(
        '//overpass-api.de/api/interpreter',
        '[out:json];('
          // + `node(around:33,${userSelectedLat},${userSelectedLon})['natural'];`
          + `way(around:33,${userSelectedLat},${userSelectedLon})['highway'];`
          // + `relation(around:33,${userSelectedLat},${userSelectedLon})["type"="route"]["route"="hiking"];`
          + ');out geom meta;',
        {
          validateStatus: status => status === 200,
          cancelToken: source.token,
        },
      )
        .then(({ data }) => {
          if (data.elements && data.elements.length > 0) {
            const geojson = {
              type: 'FeatureCollection',
              features: data.elements.map(element => (
                element.type === 'way' ? {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: element.geometry.map(({ lat, lon }) => [lon, lat]),
                  },
                } : element.type === 'node' ? {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [element.lon, element.lat],
                  },
                } : { // relation
                  type: 'Feature',
                  geometry: {
                    type: 'GeometryCollection',
                    geometries: element.members.filter(({ type }) => ['way', 'node'/* TODO , 'relation' */].includes(type)).map(member => (
                      member.type === 'way' ? {
                        type: 'LineString',
                        coordinates: member.geometry.map(({ lat, lon }) => [lon, lat]),
                      } : { // node
                        type: 'Point',
                        coordinates: [member.lon, member.lat],
                      }
                    )),
                  },
                }
              )),
            };

            data.elements.forEach((element) => {
              dispatch(toastsAdd({
                // collapseKey: 'mapDetails.trackInfo.detail',
                message: <RoadDetails way={element} />,
                cancelType: at.MAP_DETAILS_SET_USER_SELECTED_POSITION,
                style: 'info',
              }));
            });

            // dispatch(mapDetailsSetTrackInfoPoints(geojson));

            dispatch(trackViewerSetData({
              trackGeojson: geojson,
              startPoints: [],
              finishPoints: [],
            }));
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
        .catch((err) => {
          dispatch(toastsAddError('mapDetails.fetchingError', err));
        })
        .then(() => {
          storeDispatch(stopProgress(pid));
          done();
        });
    } else {
      done();
    }
  },
});

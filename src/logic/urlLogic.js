import { createLogic } from 'redux-logic';
import history from 'fm3/history';

export const urlLogic = createLogic({
  type: ['MAP_REFOCUS', /^ROUTE_PLANNER_/, 'SET_TOOL', 'SET_EMBEDDED_MODE',
    'MAP_RESET', 'TRACK_VIEWER_SET_TRACK_UID',
    'GALLERY_SET_ACTIVE_IMAGE_ID', 'GALLERY_SET_IMAGES',
    'CHANGESETS_SET_DAYS', 'CHANGESETS_SET_AUTHOR_NAME',
    /^INFO_POINT_.*/],
  process({ getState, action }, dispatch, done) {
    const {
      map: { mapType, overlays, zoom, lat, lon },
      main: { embeddedMode, tool },
      routePlanner: { start, finish, midpoints, transportType },
      trackViewer: { trackUID },
      gallery: { activeImageId },
      infoPoint,
      changesets: { days, authorName },
    } = getState();

    const queryParts = [
      `map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`,
      `layers=${mapType}${overlays.join('')}`,
    ];

    if (start && finish) {
      queryParts.push(
        `transport=${transportType}`,
        `points=${[start, ...midpoints, finish].map(point => `${point.lat.toFixed(5)}/${point.lon.toFixed(5)}`).join(',')}`,
      );
    }

    if (trackUID) {
      queryParts.push(`track-uid=${trackUID}`);
    }

    if (activeImageId) {
      queryParts.push(`image=${activeImageId}`);
    }

    if (embeddedMode) {
      queryParts.push('embed=true');
    }

    if (tool === 'changesets' && days) {
      queryParts.push(`changesets-days=${days}`);
      if (authorName) {
        queryParts.push(`changesets-author=${authorName}`);
      }
    }

    if (infoPoint.lat && infoPoint.lon) {
      queryParts.push(
        `info-point-lat=${infoPoint.lat.toFixed(5)}`,
        `info-point-lon=${infoPoint.lon.toFixed(5)}`,
      );
      if (infoPoint.label) {
        queryParts.push(`info-point-label=${encodeURIComponent(infoPoint.label)}`);
      }
    }

    const search = `?${queryParts.join('&')}`;

    if (location.search !== search) {
      history[action.type === 'MAP_REFOCUS' ? 'replace' : 'push']({ search });
    }

    done();
  },
});

export default urlLogic;

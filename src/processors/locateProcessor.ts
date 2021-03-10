import { setLocation, toggleLocate } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { LatLng } from 'leaflet';

let watch: number | undefined;

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState, dispatch }) => {
    if (getState().main.locate) {
      dispatch(mapRefocus({ gpsTracked: true }));

      watch = navigator.geolocation?.watchPosition(
        ({ coords: { latitude, longitude, accuracy } }) => {
          if (watch) {
            navigator.geolocation.clearWatch(watch);
          }

          dispatch(
            setLocation({
              lat: latitude,
              lon: longitude,
              accuracy,
            }),
          );

          const map = getMapLeafletElement();

          if (!map) {
            return;
          }

          const { zoom, gpsTracked } = getState().map;

          // adjust coordinates to prevent additional map micromovement
          const latLng = map.unproject(
            map.project(new LatLng(latitude, longitude), zoom).round(),
            zoom,
          );

          if (gpsTracked) {
            dispatch(
              mapRefocus({
                lat: latLng.lat,
                lon: latLng.lng,
                gpsTracked: true,
              }),
            );
          }
        },
        () => {
          dispatch(
            toastsAdd({
              id: 'main.locationError',
              messageKey: 'main.locationError',
              style: 'danger',
              timeout: 5000,
            }),
          );
        },
        { enableHighAccuracy: true, maximumAge: 0 },
      );
    } else if (navigator.geolocation && typeof watch === 'number') {
      dispatch(mapRefocus({ gpsTracked: false }));

      navigator.geolocation.clearWatch(watch);

      watch = undefined;
    }
  },
};

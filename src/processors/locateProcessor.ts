import { setLocation, toggleLocate } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { mapPromise } from 'fm3/leafletElementHolder';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { LatLng } from 'leaflet';

let watch: number | undefined;

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState, dispatch }) => {
    if (getState().main.locate) {
      dispatch(mapRefocus({ gpsTracked: true }));

      const map = await mapPromise;

      watch = window.navigator.geolocation?.watchPosition(
        ({ coords: { latitude, longitude, accuracy } }) => {
          dispatch(
            setLocation({
              lat: latitude,
              lon: longitude,
              accuracy,
            }),
          );

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
          dispatch(toggleLocate(false));

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
    } else if (window.navigator.geolocation && typeof watch === 'number') {
      dispatch(mapRefocus({ gpsTracked: false }));

      window.navigator.geolocation.clearWatch(watch);

      watch = undefined;
    }
  },
};

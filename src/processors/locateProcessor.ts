import { toggleLocate, setLocation } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { mapRefocus } from 'fm3/actions/mapActions';
import { LatLng } from 'leaflet';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

let watch: number;

export const locateProcessor: Processor = {
  actionCreator: toggleLocate,
  handle: async ({ getState, dispatch }) => {
    if (getState().main.locate) {
      dispatch(mapRefocus({ gpsTracked: true }));

      watch =
        navigator.geolocation &&
        navigator.geolocation.watchPosition(
          (p: Position) => {
            if (watch) {
              navigator.geolocation.clearWatch(watch);
            }

            const { latitude, longitude, accuracy } = p.coords;

            dispatch(
              setLocation({
                lat: latitude,
                lon: longitude,
                accuracy: accuracy,
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
            // TODO toast with error
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

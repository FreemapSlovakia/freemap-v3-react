import { selectFeature } from '@app/store/actions.js';
import type { LatLon } from '@shared/types/common.js';
import { useMapEvent } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { weatherPointId } from '../model/pointId.js';

/** One answer: the forecast for that place, which ends the picking. */
export const pickWeatherAt = (at: LatLon, label?: string) =>
  selectFeature({ type: 'weather', id: weatherPointId(at), label });

/** Takes the map's click while the forecast's place is picked. */
export default function WeatherPicking(): null {
  const dispatch = useDispatch();

  useMapEvent('click', ({ latlng }) => {
    dispatch(pickWeatherAt({ lat: latlng.lat, lon: latlng.lng }));
  });

  return null;
}

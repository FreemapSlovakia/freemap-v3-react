import { RichMarker } from '@shared/components/RichMarker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaCloudSun } from 'react-icons/fa';
import { parseWeatherPointId } from '../model/pointId.js';

/** The point whose forecast the panel shows. */
export default function WeatherResult(): ReactElement | null {
  const id = useAppSelector((state) =>
    state.main.selection?.type === 'weather' ? state.main.selection.id : null,
  );

  const point = id === null ? undefined : parseWeatherPointId(id);

  return point ? (
    <RichMarker
      position={[point.lat, point.lon]}
      interactive={false}
      faIcon={<FaCloudSun />}
    />
  ) : null;
}

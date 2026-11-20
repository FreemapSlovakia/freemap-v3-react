import { PickingMenu } from '@shared/components/PickingMenu.js';
import type { ReactElement } from 'react';
import { FaCloudSun } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { weatherForecastSetPicking } from '../model/actions.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { pickWeatherAt } from './WeatherPicking.js';

/** The prompt while the forecast's place is picked; a found place answers too. */
export default function WeatherPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useWeatherForecastMessages();

  return (
    <PickingMenu
      icon={<FaCloudSun />}
      prompt={m?.pickPrompt}
      onCancel={() => dispatch(weatherForecastSetPicking(false))}
      cancelKbd="Esc"
      onPlace={(at, name) => dispatch(pickWeatherAt(at, name))}
    />
  );
}

import { selectFeature, type WeatherSelection } from '@app/store/actions.js';
import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { LatLon } from '@shared/types/common.js';
import { type ReactElement, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaCloudSun, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { weatherForecastSetPicking } from '../model/actions.js';
import { useForecast } from '../model/forecast.js';
import { parseWeatherPointId } from '../model/pointId.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { ForecastView } from './ForecastView.js';

/** The forecast for the point the `weather` selection names. */
export default function WeatherPanel(): ReactElement {
  const dispatch = useDispatch();

  const m = useWeatherForecastMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const online = useOnline();

  const selection = useAppSelector((state) =>
    state.main.selection?.type === 'weather' ? state.main.selection : null,
  );

  // Kept for the panel to slide out with.
  const [shown, setShown] = useState(selection);

  if (selection && selection !== shown) {
    setShown(selection);
  }

  const shownPoint = shown ? parseWeatherPointId(shown.id) : undefined;

  // Asked only when whoever opened the forecast had no name for the place.
  const placeName = usePlaceName(shown?.label ? null : shownPoint, true);

  const coords = (item: WeatherSelection) => {
    const point = parseWeatherPointId(item.id);

    return point ? latLonToString(point, language) : item.id;
  };

  const name = (item: WeatherSelection) =>
    item.label ?? (item === shown ? placeName : null);

  return (
    <DockPanel
      item={shown}
      show={selection !== null}
      icon={<FaCloudSun />}
      label={m?.title}
      title={(item) => name(item) ?? coords(item)}
      keepVisible={(item) => parseWeatherPointId(item.id)}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(item) => {
        const point = parseWeatherPointId(item.id);

        const named = name(item);

        return (
          <>
            <p
              className={
                named ? 'lead fw-semibold mb-0' : 'lead fw-semibold mb-2'
              }
            >
              {named ?? coords(item)}
            </p>

            {named && <p className="small text-muted mb-2">{coords(item)}</p>}

            <Button
              variant="secondary"
              size="sm"
              className="mb-3"
              disabled={!online}
              onClick={() => {
                dispatch(weatherForecastSetPicking(true));
              }}
            >
              <FaMapMarkerAlt /> {m?.otherPlace}
            </Button>

            {point && <PanelForecast key={item.id} point={point} />}
          </>
        );
      }}
    </DockPanel>
  );
}

function PanelForecast({ point }: { point: LatLon }): ReactElement | null {
  const m = useWeatherForecastMessages();

  const loaded = useForecast(point);

  switch (loaded.state) {
    case 'done':
      return <ForecastView forecast={loaded.data} />;

    case 'error':
      return <Alert variant="warning">{m?.failed}</Alert>;

    default:
      return <p>{m?.loading}</p>;
  }
}

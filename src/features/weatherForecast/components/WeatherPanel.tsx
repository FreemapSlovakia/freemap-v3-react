import { selectFeature, type WeatherSelection } from '@app/store/actions.js';
import { usePlaceName } from '@features/search/hooks/usePlaceName.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FitToggleButtonGroup } from '@shared/components/FitButtonGroup.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { type ReactElement, useState } from 'react';
import { Button, ToggleButton } from 'react-bootstrap';
import {
  FaChartLine,
  FaCloudSun,
  FaListUl,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { weatherForecastSetPicking } from '../model/actions.js';
import { useForecast } from '../model/forecast.js';
import { parseWeatherPointId } from '../model/pointId.js';
import { useWeatherForecastMessages } from '../translations/useWeatherForecastMessages.js';
import { ForecastCharts } from './ForecastCharts.js';
import { ForecastFailed } from './ForecastFailed.js';
import { ForecastFooter } from './ForecastFooter.js';
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

  // Here rather than per place, so another place opens in the same view.
  const [view, setView] = useState<View>('days');

  return (
    <DockPanel
      item={shown}
      show={selection !== null}
      wide={view === 'charts'}
      icon={<FaCloudSun />}
      label={m?.title}
      manual="weather-forecast"
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

            {point && (
              <PanelForecast
                key={item.id}
                point={point}
                view={view}
                setView={setView}
              />
            )}
          </>
        );
      }}
    </DockPanel>
  );
}

type View = 'days' | 'charts';

function PanelForecast({
  point,
  view,
  setView,
}: {
  point: LatLon;
  view: View;
  setView: (view: View) => void;
}): ReactElement | null {
  const m = useWeatherForecastMessages();

  const loaded = useForecast(point);

  switch (loaded.state) {
    case 'done':
      return (
        <>
          {loaded.data.steps.length > 0 && (
            <FitToggleButtonGroup
              type="radio"
              name="weatherView"
              className="w-100 mb-3"
              value={view}
              onChange={(next: View) => {
                if (next === 'charts') {
                  trackMatomo(['trackEvent', 'Weather', 'charts']);
                }

                setView(next);
              }}
            >
              <ToggleButton
                id="weatherView-days"
                value="days"
                variant="outline-primary"
              >
                <FaListUl /> {m?.views.days}
              </ToggleButton>

              <ToggleButton
                id="weatherView-charts"
                value="charts"
                variant="outline-primary"
              >
                <FaChartLine /> {m?.views.charts}
              </ToggleButton>
            </FitToggleButtonGroup>
          )}

          {/* Nothing to chart beyond the models' reach: the list says so. */}
          {view === 'charts' && loaded.data.steps.length > 0 ? (
            <>
              <ForecastCharts forecast={loaded.data} />

              <ForecastFooter forecast={loaded.data} />
            </>
          ) : (
            <ForecastView forecast={loaded.data} />
          )}
        </>
      );

    case 'error':
      return <ForecastFailed retry={loaded.retry} />;

    default:
      return <p>{m?.loading}</p>;
  }
}

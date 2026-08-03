import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaCloudShowersHeavy,
  FaCog,
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaTimes,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { RADAR_LAYER } from '../api.js';
import {
  weatherRadarSetPlaying,
  weatherRadarSetSettings,
  weatherRadarSetTime,
} from '../model/actions.js';
import { radarFramesSelector, radarIndexSelector } from '../model/selectors.js';
import { useWeatherRadarMessages } from '../translations/useWeatherRadarMessages.js';
import { RadarTimeline } from './RadarTimeline.js';

export default function WeatherRadarMenu() {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const wm = useWeatherRadarMessages();

  const dispatch = useDispatch();

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  const playing = useAppSelector((state) => state.weatherRadar.playing);

  const colorSchemes = useAppSelector(
    (state) => state.weatherRadar.colorSchemes,
  );

  const settings = useAppSelector((state) => state.weatherRadarSettings);

  const [hidden, setHidden] = usePersistentBoolean(
    'fm.weatherRadarMenu.collapsed',
  );

  function step(delta: number) {
    const next = frames[(index + delta + frames.length) % frames.length];

    if (next) {
      dispatch(weatherRadarSetPlaying(false));

      dispatch(weatherRadarSetTime(next.time));
    }
  }

  function handleSettingsSelect(eventKey: string | null) {
    if (eventKey?.startsWith('cs:')) {
      dispatch(
        weatherRadarSetSettings({ colorScheme: Number(eventKey.slice(3)) }),
      );
    } else if (eventKey === 'smooth') {
      dispatch(weatherRadarSetSettings({ smooth: !settings.smooth }));
    } else if (eventKey === 'snow') {
      dispatch(weatherRadarSetSettings({ snow: !settings.snow }));
    } else if (eventKey === 'nowcast') {
      dispatch(weatherRadarSetSettings({ showNowcast: !settings.showNowcast }));
    }
  }

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip
            label={m?.mapLayers.letters[RADAR_LAYER]}
            breakpoint="sm"
          >
            {({ props, label, labelClassName }) => (
              <span className="align-self-center ms-1 me-1" {...props}>
                <FaCloudShowersHeavy />{' '}
                <span className={labelClassName}>{label}</span>
              </span>
            )}
          </LongPressTooltip>

          {!hidden && (
            <>
              <ButtonGroup className="ms-1">
                <LongPressTooltip label={wm?.previousFrame}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      disabled={frames.length < 2}
                      onClick={() => step(-1)}
                      {...props}
                    >
                      <FaStepBackward />
                    </Button>
                  )}
                </LongPressTooltip>

                <LongPressTooltip label={playing ? wm?.pause : wm?.play}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      disabled={frames.length < 2}
                      onClick={() => dispatch(weatherRadarSetPlaying(!playing))}
                      {...props}
                    >
                      {playing ? <FaPause /> : <FaPlay />}
                    </Button>
                  )}
                </LongPressTooltip>

                <LongPressTooltip label={wm?.nextFrame}>
                  {({ props }) => (
                    <Button
                      variant="secondary"
                      disabled={frames.length < 2}
                      onClick={() => step(1)}
                      {...props}
                    >
                      <FaStepForward />
                    </Button>
                  )}
                </LongPressTooltip>
              </ButtonGroup>

              <RadarTimeline />

              <Dropdown
                className="ms-1"
                onSelect={handleSettingsSelect}
                autoClose="outside"
              >
                <LongPressTooltip label={wm?.settings} breakpoint="xxl">
                  {({ props, label, labelClassName }) => (
                    <Dropdown.Toggle variant="secondary" {...props}>
                      <FaCog /> <span className={labelClassName}>{label}</span>
                    </Dropdown.Toggle>
                  )}
                </LongPressTooltip>

                <FmDropdownMenu>
                  <Dropdown.Item as="button" eventKey="nowcast">
                    <Checkbox value={settings.showNowcast} />{' '}
                    {wm?.showNowcast ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item as="button" eventKey="smooth">
                    <Checkbox value={settings.smooth} /> {wm?.smooth ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item as="button" eventKey="snow">
                    <Checkbox value={settings.snow} /> {wm?.snow ?? '…'}
                  </Dropdown.Item>

                  {colorSchemes.length > 0 && (
                    <>
                      <Dropdown.Divider />

                      <Dropdown.Header>{wm?.colorScheme}</Dropdown.Header>

                      {/* The scheme names are the products they reproduce
                          (NEXRAD, Dark Sky, …), so they aren't translated. */}
                      {colorSchemes.map(({ id, name }) => (
                        <Dropdown.Item
                          as="button"
                          eventKey={`cs:${id}`}
                          key={id}
                          active={settings.colorScheme === id}
                        >
                          {name}
                        </Dropdown.Item>
                      ))}
                    </>
                  )}
                </FmDropdownMenu>
              </Dropdown>
            </>
          )}

          <ButtonGroup className="ms-1">
            <LongPressTooltip
              label={hidden ? m?.general.expand : m?.general.collapse}
            >
              {({ props }) => (
                <Button
                  variant="dark"
                  onClick={() => setHidden((hidden) => !hidden)}
                  {...props}
                >
                  {hidden ? <FaAngleRight /> : <FaAngleLeft />}
                </Button>
              )}
            </LongPressTooltip>

            {!hidden && (
              <LongPressTooltip label={m?.general.close}>
                {({ props }) => (
                  <Button
                    variant="dark"
                    onClick={() =>
                      dispatch(
                        mapToggleLayer({ type: RADAR_LAYER, enable: false }),
                      )
                    }
                    {...props}
                  >
                    <FaTimes />
                  </Button>
                )}
              </LongPressTooltip>
            )}
          </ButtonGroup>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}

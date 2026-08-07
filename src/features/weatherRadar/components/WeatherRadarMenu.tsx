import { setActiveModal } from '@app/store/actions.js';
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
  FaGem,
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
import {
  radarAllowedSelector,
  radarFramesSelector,
  radarIndexSelector,
  radarPremiumSelector,
} from '../model/selectors.js';
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

  const { from, to } = useAppSelector(radarAllowedSelector);

  const settings = useAppSelector((state) => state.weatherRadarSettings);

  const premium = useAppSelector(radarPremiumSelector);

  const [hidden, setHidden] = usePersistentBoolean(
    'fm.weatherRadarMenu.collapsed',
  );

  function step(delta: number) {
    // Wraps within the stretch this user may open, matching playback. Wrapping
    // over the whole track would step onto a locked frame, which the index
    // selector clamps straight back — a button that silently does nothing.
    const span = to - from + 1;

    const next =
      span > 0
        ? frames[from + ((((index - from + delta) % span) + span) % span)]
        : undefined;

    if (next) {
      dispatch(weatherRadarSetPlaying(false));

      dispatch(weatherRadarSetTime(next.time));
    }
  }

  function handleSettingsSelect(eventKey: string | null) {
    if (eventKey !== 'nowcast') {
      return;
    }

    // Without premium the item is an offer rather than a toggle, so it opens
    // the pitch instead of flipping a setting that would do nothing.
    if (premium) {
      dispatch(weatherRadarSetSettings({ showNowcast: !settings.showNowcast }));
    } else {
      dispatch(setActiveModal({ type: 'premium' }));
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
                      disabled={to - from < 1}
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
                      disabled={to - from < 1}
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
                      disabled={to - from < 1}
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
                    {premium ? (
                      <Checkbox value={settings.showNowcast} />
                    ) : (
                      <FaGem className="text-warning" />
                    )}{' '}
                    {wm?.showNowcast ?? '…'}
                  </Dropdown.Item>
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

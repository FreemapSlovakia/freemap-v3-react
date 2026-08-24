import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { SliderDropdown } from '@shared/components/SliderDropdown.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useTerrainProgress } from '@shared/hooks/useTerrainProgress.js';
import { type ReactElement, useMemo } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Form,
  ProgressBar,
} from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaBinoculars,
  FaCog,
  FaEye,
  FaSync,
  FaTimes,
} from 'react-icons/fa';
import { TbGridDots, TbRulerMeasure } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { VIEWSHED_LAYER } from '../api.js';
import {
  viewshedCancel,
  viewshedRender,
  viewshedSetPickingViewpoint,
  viewshedSetSettings,
} from '../model/actions.js';
import {
  viewshedGrantsSelector,
  viewshedOutdatedSelector,
} from '../model/selectors.js';
import {
  GAMMA_MAX,
  VIEWSHED_DETAIL_ORDER,
  VIEWSHED_DETAILS,
  VIEWSHED_RADIUS_STEPS_KM,
  type ViewshedDetail,
} from '../model/settingsReducer.js';
import { grantedDetail, grantedRadiusKm, viewshedScale } from '../request.js';
import { useViewshedMessages } from '../translations/useViewshedMessages.js';

/** Highest a target may be raised, metres — a mast, not a mountain. */
const TARGET_HEIGHT_MAX = 100;

/** Eye heights worth offering: a child on the ground up to a tower. */
const EYE_MAX = 50;

/**
 * Everything the viewshed is driven by. A layer rather than a tool, so its
 * controls ride in a toolbar of their own — collapsible, since the overlay is
 * worth looking at without them.
 */
export default function ViewshedMenu(): ReactElement {
  const sc = useScrollClasses('horizontal');

  const m = useViewshedMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const { viewpoint, rendering, progress } = useAppSelector(
    (state) => state.viewshed,
  );

  const settings = useAppSelector((state) => state.viewshedSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const becomePremium = useBecomePremium();

  const grants = useAppSelector(viewshedGrantsSelector);

  const [hidden, setHidden] = usePersistentBoolean('fm.viewshedMenu.collapsed');

  const nfKm = useNumberFormat({
    style: 'unit',
    unit: 'kilometer',
    maximumFractionDigits: 0,
  });

  const nfM = useNumberFormat({
    style: 'unit',
    unit: 'meter',
    maximumFractionDigits: 1,
  });

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  const nfGamma = useNumberFormat({ maximumFractionDigits: 2 });

  const bar = useTerrainProgress(
    rendering,
    progress,
    VIEWSHED_DETAILS[grants.detail].expectedMs,
  );

  const outdated = useAppSelector(viewshedOutdatedSelector);

  const radiusOptions = useMemo(
    () =>
      VIEWSHED_RADIUS_STEPS_KM.map((km) => ({
        value: String(km),
        label: nfKm.format(km),
        extra:
          grantedRadiusKm(km, premium) === km ? undefined : (
            <PremiumGem nested />
          ),
      })),
    [nfKm, premium],
  );

  // The ground each pixel covers, beside every tier: what a tier is worth
  // depends on the range, and nothing else on the toolbar would say so.
  const detailOptions = useMemo(
    () =>
      VIEWSHED_DETAIL_ORDER.map((detail) => ({
        value: detail,
        label: m?.details[detail],
        extra: (
          <>
            {grantedDetail(detail, premium) === detail ? null : (
              <PremiumGem nested />
            )}
            {/* Floated, not flexed: a `dropdown-item` is a block. Not a
                message — the same in every language. */}
            <span className="float-end ms-3 text-body-secondary">
              {nfM.format(viewshedScale(grants.radiusKm, detail))}/px
            </span>
          </>
        ),
      })),
    [m, nfM, premium, grants.radiusKm],
  );

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip
            label={gm?.mapLayers.letters[VIEWSHED_LAYER]}
            breakpoint="sm"
          >
            {({ props, label, labelClassName }) => (
              <span
                className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
                {...props}
              >
                <FaBinoculars />
                <span className={labelClassName}>{label}</span>
              </span>
            )}
          </LongPressTooltip>

          {!hidden && (
            <>
              {/* First, because nothing else in the row means anything until
                  there is a place to look from. */}
              <PlacePickerButton
                consumer="viewshed"
                variant={viewpoint ? 'secondary' : 'primary'}
                label={m?.pickViewpoint}
                icon={<FaEye />}
                locateLabel={m?.locate}
                onPick={() => dispatch(viewshedSetPickingViewpoint(true))}
              />

              <SelectDropdown
                // What is actually being rendered, not what is stored: an
                // account whose premium lapsed keeps its wider choice, and
                // showing that figure would be a lie.
                value={String(grants.radiusKm)}
                onSelect={(value) => {
                  const asked = Number(value ?? grants.radiusKm);

                  // Offering to buy what the distance costs, rather than
                  // quietly storing a choice the next render would clamp away.
                  if (grantedRadiusKm(asked, premium) !== asked) {
                    becomePremium?.();
                  } else {
                    dispatch(viewshedSetSettings({ radiusKm: asked }));
                  }
                }}
                options={radiusOptions}
                toggleIcon={<TbRulerMeasure />}
                name={gm?.general.maxVisibleDistance}
                breakpoint="md"
              />

              <SelectDropdown
                value={grants.detail}
                onSelect={(value) => {
                  const asked = (value ?? 'standard') as ViewshedDetail;

                  if (grantedDetail(asked, premium) !== asked) {
                    becomePremium?.();
                  } else {
                    dispatch(viewshedSetSettings({ detail: asked }));
                  }
                }}
                options={detailOptions}
                toggleIcon={<TbGridDots />}
                name={m?.detail}
                breakpoint="md"
              />

              {/* The rest, which all cost a render but are set once and left:
                  they sit behind a toggle rather than in reach of a stray
                  click. */}
              <SliderDropdown
                icon={<FaCog />}
                toggleLabel={m?.settings}
                breakpoint="xxl"
              >
                <LabeledSlider
                  id="fm-viewshed-eye"
                  label={gm?.general.eyeHeight}
                  hint={gm?.general.eyeHeightHint}
                  valueLabel={nfM.format(settings.eye)}
                  min={0}
                  max={EYE_MAX}
                  step={0.1}
                  value={settings.eye}
                  onChange={(eye) => dispatch(viewshedSetSettings({ eye }))}
                />

                {/* The faintness is in the pixels — the image's own alpha is
                    the sine of the grazing angle — so this is the only control
                    that can lift it; the layer's opacity can only take away. */}
                <LabeledSlider
                  id="fm-viewshed-gamma"
                  label={m?.strength}
                  valueLabel={
                    settings.gamma === 1
                      ? m?.strengthMeasured
                      : nfGamma.format(settings.gamma)
                  }
                  hint={m?.strengthHint}
                  min={1}
                  max={GAMMA_MAX}
                  step={0.25}
                  value={settings.gamma}
                  onChange={(gamma) => dispatch(viewshedSetSettings({ gamma }))}
                />

                <LabeledSlider
                  id="fm-viewshed-floor"
                  label={m?.minOpacity}
                  valueLabel={nfPercent.format(settings.alphaFloor)}
                  hint={m?.minOpacityHint}
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.alphaFloor}
                  onChange={(alphaFloor) =>
                    dispatch(viewshedSetSettings({ alphaFloor }))
                  }
                />

                <LabeledSlider
                  id="fm-viewshed-target"
                  label={m?.targetHeight}
                  valueLabel={nfM.format(settings.targetHeight)}
                  hint={m?.targetHeightHint}
                  min={0}
                  max={TARGET_HEIGHT_MAX}
                  step={1}
                  value={settings.targetHeight}
                  onChange={(targetHeight) =>
                    dispatch(viewshedSetSettings({ targetHeight }))
                  }
                />

                {/* Label above and the swatch across the menu, as the sliders
                    above read: the colour is the row's value, not its unit. */}
                <div className="d-flex flex-column">
                  <Form.Label className="mb-0">{m?.color}</Form.Label>

                  <RgbaColorPicker
                    value={settings.color}
                    onChange={(color) =>
                      dispatch(viewshedSetSettings({ color }))
                    }
                    alpha={false}
                  />
                </div>
              </SliderDropdown>

              {rendering ? (
                <>
                  {/* The queue position instead of a figure, where the row has
                      no second line to put it on. */}
                  <ProgressBar
                    className="align-self-center"
                    style={{ width: '8rem' }}
                    striped
                    animated
                    variant={bar.variant}
                    now={bar.now}
                    label={
                      bar.queued
                        ? m?.queued({ ahead: bar.queued.ahead })
                        : bar.label
                    }
                  />

                  <Button
                    variant="secondary"
                    onClick={() => dispatch(viewshedCancel())}
                  >
                    {gm?.general.cancel}
                  </Button>
                </>
              ) : (
                outdated && (
                  <LongPressTooltip label={m?.outdated}>
                    {({ props }) => (
                      <Button
                        variant="primary"
                        onClick={() => dispatch(viewshedRender())}
                        {...props}
                      >
                        <FaSync /> {m?.update}
                      </Button>
                    )}
                  </LongPressTooltip>
                )
              )}
            </>
          )}

          <ButtonGroup>
            <LongPressTooltip
              label={hidden ? gm?.general.expand : gm?.general.collapse}
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
              <LongPressTooltip label={gm?.general.close}>
                {({ props }) => (
                  <Button
                    variant="dark"
                    onClick={() =>
                      dispatch(
                        mapToggleLayer({ type: VIEWSHED_LAYER, enable: false }),
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

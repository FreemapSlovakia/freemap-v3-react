import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { SliderDropdown } from '@shared/components/SliderDropdown.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ViewFromHere } from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useTerrainProgress } from '@shared/hooks/useTerrainProgress.js';
import { type ReactElement, useMemo } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Spinner } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaBinoculars,
  FaCog,
  FaEye,
  FaSync,
  FaTimes,
} from 'react-icons/fa';
import { TbRulerMeasure } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { VIEWSHED_LAYER } from '../api.js';
import {
  viewshedCancel,
  viewshedRender,
  viewshedSetPickingViewpoint,
  viewshedSetSettings,
} from '../model/actions.js';
import {
  viewshedAtRenderedViewpointSelector,
  viewshedGrantsSelector,
  viewshedOutdatedSelector,
} from '../model/selectors.js';
import { VIEWSHED_RADIUS_STEPS_KM } from '../model/settingsReducer.js';
import {
  FREE_RADIUS_MAX_KM,
  grantedRadiusKm,
  viewshedDetailTiers,
  viewshedScale,
} from '../request.js';
import { useViewshedMessages } from '../translations/useViewshedMessages.js';

/** Constant, so the menu doesn't rebuild its items on every render. */
const VIEWPOINT_OMIT: ViewFromHere[] = ['viewshed'];

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

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const prm = usePremiumMessages();

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

  const bar = useTerrainProgress(rendering, progress);

  const outdated = useAppSelector(viewshedOutdatedSelector);

  const atRenderedViewpoint = useAppSelector(
    viewshedAtRenderedViewpointSelector,
  );

  // Only what the account may have: a slider that ran past the grant would
  // stand where nothing is rendered, unlike a menu that can price each row.
  const radiusSteps = useMemo(
    () =>
      VIEWSHED_RADIUS_STEPS_KM.filter(
        (km) => grantedRadiusKm(km, premium) === km,
      ),
    [premium],
  );

  // Against the reach being rendered, not the stored one: the tiers a short
  // viewshed affords are not the tiers a long one does.
  const detailTiers = useMemo(
    () => viewshedDetailTiers(grants.radiusKm, premium),
    [grants.radiusKm, premium],
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

          {/* Beside the layer's own name, since it qualifies the whole overlay
              rather than any one control. A mark rather than a panel: the
              viewshed is a layer, so there is no window of its own to lay this
              over the way the panorama does. */}
          <span className="align-self-center me-2">
            <HintMark
              hint={
                <>
                  <p className="mb-1">{gm?.general.terrain.bareEarth}</p>

                  <p className="mb-1">{gm?.general.terrain.coverage}</p>

                  <p className="mb-0">{m?.caveats.viewpoint}</p>
                </>
              }
            />
          </span>

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

              {viewpoint && (
                <PlaceActionsButton
                  lat={viewpoint.lat}
                  lon={viewpoint.lon}
                  // The overlay on screen is the viewshed from here — but only
                  // while the pin stands where it was drawn from; dragged
                  // elsewhere, a viewshed from there is worth offering again.
                  omit={atRenderedViewpoint ? VIEWPOINT_OMIT : undefined}
                />
              )}

              {/* The two that decide what a render costs, and they trade
                  against each other — a shorter reach buys a finer raster for
                  the same pixels. Together, as the panorama's frame is. */}
              <SliderDropdown
                icon={<TbRulerMeasure />}
                // What is actually being rendered, not what is stored: an
                // account whose premium lapsed keeps its wider choice, and
                // showing that figure would be a lie.
                toggleLabel={`${nfKm.format(grants.radiusKm)} · ${nfM.format(viewshedScale(grants.radiusKm, grants.detail))}/px`}
                name={m?.extent}
                breakpoint="md"
                // Says on the toolbar why the overlay is the coarse one; the
                // reason is otherwise only inside a menu nobody opens to find
                // out what they lack.
                toggleClassName={premium ? undefined : 'text-warning'}
                toggleHint={premium ? undefined : prm?.higherDetail}
              >
                <LabeledSlider
                  id="fm-viewshed-radius"
                  label={
                    <>
                      {gm?.general.maxVisibleDistance}

                      {!premium && <PremiumGem hint={m?.rangeHint} />}
                    </>
                  }
                  valueLabel={nfKm.format(grants.radiusKm)}
                  min={0}
                  max={radiusSteps.length - 1}
                  value={Math.max(0, radiusSteps.indexOf(grants.radiusKm))}
                  onChange={(index) =>
                    dispatch(
                      viewshedSetSettings({
                        radiusKm: radiusSteps[index] ?? FREE_RADIUS_MAX_KM,
                      }),
                    )
                  }
                />

                <LabeledSlider
                  id="fm-viewshed-detail"
                  label={
                    <>
                      {m?.detail}

                      {!premium && <PremiumGem hint={prm?.higherDetail} />}
                    </>
                  }
                  // The ground a pixel covers, not the tier's name: the figure
                  // says what the tier is worth at this reach, which the name
                  // cannot, and the names run to three words.
                  valueLabel={`${nfM.format(viewshedScale(grants.radiusKm, grants.detail))}/px`}
                  min={0}
                  max={detailTiers.length - 1}
                  value={Math.max(0, detailTiers.indexOf(grants.detail))}
                  onChange={(index) =>
                    dispatch(
                      viewshedSetSettings({
                        detail: detailTiers[index] ?? grants.detail,
                      }),
                    )
                  }
                />
              </SliderDropdown>

              {/* The rest all cost a render and are set once, so they sit in
                  a modal rather than in reach of a stray click. */}
              <LongPressTooltip label={m?.settings} breakpoint="xxl">
                {({ props, label, labelClassName }) => (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      dispatch(setActiveModal({ type: 'viewshed-settings' }))
                    }
                    {...props}
                  >
                    <FaCog />
                    <span className={labelClassName}> {label}</span>
                  </Button>
                )}
              </LongPressTooltip>

              {rendering ? (
                <>
                  {/* The queue position instead of the seconds, where the row
                      has no second line to put both on. A spinner rather than a
                      bar, as in the panorama: the service's figure covers its
                      marching, and the encode of a 10 Mpx overlay and its
                      decode here are the rest. */}
                  <span className="align-self-center d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />

                    {bar.queued
                      ? m?.queued({ ahead: bar.queued.ahead })
                      : bar.label}
                  </span>

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

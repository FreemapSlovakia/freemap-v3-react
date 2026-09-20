import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ViewFromHere } from '@shared/components/ViewFromHereItems.js';
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
  viewshedAtRenderedViewpointSelector,
  viewshedGrantsSelector,
  viewshedOutdatedSelector,
} from '../model/selectors.js';
import {
  VIEWSHED_DETAIL_ORDER,
  VIEWSHED_DETAILS,
  VIEWSHED_RADIUS_STEPS_KM,
  type ViewshedDetail,
} from '../model/settingsReducer.js';
import { grantedDetail, grantedRadiusKm, viewshedScale } from '../request.js';
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

  const bar = useTerrainProgress(
    rendering,
    progress,
    VIEWSHED_DETAILS[grants.detail].expectedMs,
  );

  const outdated = useAppSelector(viewshedOutdatedSelector);

  const atRenderedViewpoint = useAppSelector(
    viewshedAtRenderedViewpointSelector,
  );

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
            {/* Not a message — the same in every language. */}
            <span className="text-body-secondary">
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
                // Says on the toolbar why the overlay is the coarse one; the
                // tier names are only in the menu, which nobody opens to find
                // out what they lack. The offer to buy is on the tiers.
                toggleClassName={premium ? undefined : 'text-warning'}
                toggleHint={premium ? undefined : prm?.higherDetail}
              />

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

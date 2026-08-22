import { setActiveModal } from '@app/store/actions.js';
import { requestCompassPermission } from '@features/location/compass.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import {
  LabeledSlider,
  SliderDropdown,
} from '@shared/components/SliderDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaCog, FaRegDotCircle, FaSync } from 'react-icons/fa';
import { LuFoldVertical, LuUnfoldVertical } from 'react-icons/lu';
import { MdOutlineHeight } from 'react-icons/md';
import { PiMountains } from 'react-icons/pi';
import {
  TbBaselineDensityLarge,
  TbBaselineDensityMedium,
  TbBaselineDensitySmall,
  TbTagOff,
} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  panoramaLocate,
  panoramaRender,
  panoramaSetAwaitingFix,
  panoramaSetSettings,
} from '../model/actions.js';
import {
  DOMINANCE_STEPS_M,
  LABEL_DENSITY_MAX,
  NO_DOMINANCE_FILTER,
} from '../model/settingsReducer.js';
import {
  grantedQuality,
  PANORAMA_QUALITY_ORDER,
  type PanoramaQuality,
  type PanoramaTilt,
  panoramaRenderKey,
} from '../quality.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

export default function PanoramaMenu(): ReactElement {
  const m = usePanoramaMessages();

  const dispatch = useDispatch();

  const becomePremium = useBecomePremium();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const settings = useAppSelector((state) => state.panoramaSettings);

  const { viewpoint, render, rendering, awaitingFix } = useAppSelector(
    (state) => state.panorama,
  );

  const quality = grantedQuality(settings.quality, premium);

  const nfM = useNumberFormat({
    style: 'unit',
    unit: 'meter',
    maximumFractionDigits: 0,
  });

  const nfDeg = useNumberFormat({
    style: 'unit',
    unit: 'degree',
    unitDisplay: 'narrow',
    maximumFractionDigits: 0,
  });

  // A stored value between two stops — an older setting, a hand-edited store —
  // snaps to the nearest stop rather than putting the slider somewhere it
  // cannot be moved back to.
  const dominanceStep = DOMINANCE_STEPS_M.reduce(
    (best, meters, i) =>
      Math.abs(meters - settings.minDominance) <
      Math.abs((DOMINANCE_STEPS_M[best] ?? 0) - settings.minDominance)
        ? i
        : best,
    0,
  );

  const dominanceLabel =
    settings.minDominance === NO_DOMINANCE_FILTER
      ? m?.dominance.all
      : `≥ ${nfM.format(settings.minDominance)}`;

  // The slider is finer than four words, but a word still says roughly where
  // it stands — a bare "6 of 10" would mean nothing about the picture. Clamped
  // the way `labelLayoutLimits` clamps, since the band indexes two arrays.
  const densityBand = Math.ceil(
    (Math.min(Math.max(settings.labelDensity, 0), LABEL_DENSITY_MAX) /
      LABEL_DENSITY_MAX) *
      3,
  );

  const densityLabel = [
    m?.labels.none,
    m?.labels.few,
    m?.labels.normal,
    m?.labels.many,
  ][densityBand];

  // The Tabler names measure the gap between baselines, not the number of
  // lines: `Small` is the closest spacing and so the busiest glyph.
  const densityIcon = [
    <TbTagOff key="0" />,
    <TbBaselineDensityLarge key="1" />,
    <TbBaselineDensityMedium key="2" />,
    <TbBaselineDensitySmall key="3" />,
  ][densityBand];

  // How many names, and — only while it is actually filtering — what a summit
  // has to be to get one. The threshold is off by default, so the toggle stays
  // a single word for anyone who never touches it.
  const namesLabel =
    settings.minDominance === NO_DOMINANCE_FILTER
      ? densityLabel
      : `${densityLabel} · ${dominanceLabel}`;

  // The picture answers for a viewpoint and a set of angles; once either moves
  // it is of somewhere else, and only pressing Update pays for a new render.
  const outdated =
    viewpoint !== null &&
    render !== null &&
    render.key !== panoramaRenderKey(viewpoint, settings, quality);

  return (
    <ToolMenu tool="panorama">
      <SelectDropdown
        // What is actually being rendered, not what is stored: an account
        // without premium asks for a finer tier by default and is put back on
        // the fast one, and showing it that finer name would be a lie. The
        // stored choice is kept either way, so premium later grants it silently.
        value={quality}
        onSelect={(value) => {
          const asked = (value ?? 'fast') as PanoramaQuality;

          // Offering to buy what the tier costs, rather than quietly storing a
          // choice that would be clamped away on the next render.
          if (grantedQuality(asked, premium) !== asked) {
            becomePremium?.();
          } else {
            dispatch(panoramaSetSettings({ quality: asked }));
          }
        }}
        options={PANORAMA_QUALITY_ORDER.map((tier) => ({
          value: tier,
          label: m?.quality[tier],
          extra:
            grantedQuality(tier, premium) === tier ? undefined : (
              <PremiumGem nested />
            ),
        }))}
        toggleIcon={<PiMountains />}
        name={m?.quality.label}
        breakpoint="md"
      />

      <SelectDropdown
        value={settings.tilt}
        onSelect={(value) =>
          // The last item is a door, not a band: the angles are typed in the
          // settings modal, which is the only place that has room for two
          // number fields and the one place they live.
          value === 'custom'
            ? dispatch(setActiveModal({ type: 'panorama-settings' }))
            : dispatch(
                panoramaSetSettings({
                  tilt: (value ?? 'standard') as PanoramaTilt,
                }),
              )
        }
        // Shortest frame to tallest, so the list runs the way the thing it
        // controls does.
        options={[
          { value: 'flat', label: m?.tilt.flat, icon: <LuFoldVertical /> },
          {
            value: 'standard',
            label: m?.tilt.standard,
            icon: <MdOutlineHeight />,
          },
          {
            value: 'wide',
            label: m?.tilt.wide,
            icon: <LuUnfoldVertical />,
            // Sets off what follows, which is a door rather than a band; the
            // flag draws the line *after* its own option.
            divider: true,
          },
          {
            value: 'custom',
            label: `${m?.settings.custom}…`,
            icon: <FaCog />,
          },
        ]}
        // A band from a `panorama-tilt=altMin,altMax` link matches no preset,
        // which would leave the toggle blank. It says the angles instead, and
        // picking a preset is the way back out of it.
        {...(settings.tilt === 'custom'
          ? {
              toggleIcon: <MdOutlineHeight />,
              toggleLabel: `${nfDeg.format(settings.altMin)}…${nfDeg.format(
                settings.altMax,
              )}`,
            }
          : {})}
        name={m?.tilt.label}
        breakpoint="md"
      />

      {/* How many names fit, beside which summits count for one at all — two
          halves of the same question, so they share a menu. Both act on what
          already arrived, so either is instant. Sliders rather than lists: the
          useful settings are a dozen each, and a dozen items is a menu to read
          where this is a thing to feel out. */}
      <SliderDropdown
        icon={densityIcon}
        toggleLabel={namesLabel}
        name={m?.labels.title}
        breakpoint="md"
      >
        <LabeledSlider
          id="fm-panorama-density"
          label={m?.labels.density}
          valueLabel={densityLabel}
          min={0}
          max={LABEL_DENSITY_MAX}
          value={settings.labelDensity}
          onChange={(labelDensity) =>
            dispatch(panoramaSetSettings({ labelDensity }))
          }
        />

        <LabeledSlider
          id="fm-panorama-dominance"
          label={m?.dominance.label}
          valueLabel={dominanceLabel}
          min={0}
          max={DOMINANCE_STEPS_M.length - 1}
          value={dominanceStep}
          onChange={(step) =>
            dispatch(
              panoramaSetSettings({
                minDominance: DOMINANCE_STEPS_M[step] ?? NO_DOMINANCE_FILTER,
              }),
            )
          }
        />
      </SliderDropdown>

      {/* Set-once settings — eye height, an exact vertical band, the look —
          which all cost a render, so they sit behind a modal rather than in
          reach of a stray click. */}
      <LongPressTooltip label={m?.settings.title}>
        {({ props }) => (
          <Button
            variant="secondary"
            onClick={() =>
              dispatch(setActiveModal({ type: 'panorama-settings' }))
            }
            {...props}
          >
            <FaCog />
          </Button>
        )}
      </LongPressTooltip>

      {/* The one place the viewpoint can be set without knowing where you are
          on the map — which is exactly the case out on a hill with the phone. */}
      <LongPressTooltip label={m?.locate}>
        {({ props }) => (
          <Button
            variant="secondary"
            onClick={() => {
              // The other way a viewpoint is placed, so it asks for the
              // magnetometer as the map click does — iOS grants it only from a
              // gesture, and the pick itself happens later in a processor,
              // nowhere near one.
              void requestCompassPermission();

              // Never disabled: a fix can fail to arrive without anything
              // being dispatched to say so (a bare timeout keeps trying), and
              // a button that is spinning and dead has no way out of that.
              // Pressing it again gives up.
              dispatch(
                awaitingFix ? panoramaSetAwaitingFix(false) : panoramaLocate(),
              );
            }}
            {...props}
          >
            {awaitingFix ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <FaRegDotCircle />
            )}
          </Button>
        )}
      </LongPressTooltip>

      {outdated && !rendering && (
        <LongPressTooltip label={m?.outdated}>
          {({ props }) => (
            <Button
              variant="primary"
              onClick={() => dispatch(panoramaRender())}
              {...props}
            >
              <FaSync /> {m?.update}
            </Button>
          )}
        </LongPressTooltip>
      )}
    </ToolMenu>
  );
}

import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  isCompassSupported,
  requestCompassPermission,
} from '@features/location/compass.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium } from '@features/premium/premium.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import {
  FloatingWindowControls,
  FullscreenButton,
} from '@shared/components/FloatingWindowControls.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import {
  LabeledSlider,
  SliderDropdown,
} from '@shared/components/SliderDropdown.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaCog,
  FaCompass,
  FaEye,
  FaInfoCircle,
  FaPlay,
  FaStop,
  FaSync,
} from 'react-icons/fa';
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
  panoramaRender,
  panoramaSetPickingViewpoint,
  panoramaSetSettings,
} from '../model/actions.js';
import {
  DOMINANCE_STEPS_M,
  LABEL_DENSITY_MAX,
  LABEL_DISTANCE_WEIGHTS,
  LABEL_HAZE_MAX_KM,
  NO_DOMINANCE_FILTER,
  nearestStep,
  type PanoramaTilt,
} from '../model/settingsReducer.js';
import {
  grantedQuality,
  PANORAMA_QUALITY_ORDER,
  type PanoramaQuality,
  panoramaRenderKey,
} from '../quality.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

type Props = {
  /** The caveats panel is the footer's to draw; this only presses the button. */
  showCaveats: boolean;
  onToggleCaveats: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

/** Everything the panorama is driven by; see `FloatingWindowControls`. */
export function PanoramaControls({
  showCaveats,
  onToggleCaveats,
  fullscreen,
  onToggleFullscreen,
}: Props): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const becomePremium = useBecomePremium();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const settings = useAppSelector((state) => state.panoramaSettings);

  const { viewpoint, render, rendering } = useAppSelector(
    (state) => state.panorama,
  );

  const quality = grantedQuality(settings.quality, premium);

  const nfM = useNumberFormat({
    style: 'unit',
    unit: 'meter',
    maximumFractionDigits: 0,
  });

  const nfKm = useNumberFormat({
    style: 'unit',
    unit: 'kilometer',
    maximumFractionDigits: 0,
  });

  const nfDeg = useNumberFormat({
    style: 'unit',
    unit: 'degree',
    unitDisplay: 'narrow',
    maximumFractionDigits: 0,
  });

  const dominanceStep = nearestStep(DOMINANCE_STEPS_M, settings.minDominance);

  const dominanceLabel =
    settings.minDominance === NO_DOMINANCE_FILTER
      ? m?.dominance.all
      : `≥ ${nfM.format(settings.minDominance)}`;

  const hazeLabel = settings.labelHazeKm
    ? nfKm.format(settings.labelHazeKm)
    : m?.labels.hazeOff;

  const weightStep = nearestStep(
    LABEL_DISTANCE_WEIGHTS,
    settings.labelDistanceWeight,
  );

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

  // The picture answers for a viewpoint and a set of angles; once either moves
  // it is of somewhere else, and only pressing Update pays for a new render.
  // A viewpoint with no picture at all counts too — closing the panel cancels
  // the render in flight but keeps the place, and without this there would be
  // nothing to ask for it again with.
  const outdated =
    viewpoint !== null &&
    (render === null ||
      render.key !== panoramaRenderKey(viewpoint, settings, quality));

  return (
    <FloatingWindowControls fullscreen={fullscreen}>
      <ExperimentalFunction />

      <OfflineBadge hint={gm?.general.offlineToolUnavailable} />

      {/* First, because nothing else in the row means anything until there is a
          place to look from. */}
      <PlacePickerButton
        consumer="panorama"
        variant={viewpoint ? 'secondary' : 'primary'}
        label={m?.pickViewpoint}
        icon={<FaEye />}
        locateLabel={m?.locate}
        // iOS grants the magnetometer only from a gesture, and the pick itself
        // happens later in a processor, nowhere near one.
        onAct={requestCompassPermission}
        onPick={() => dispatch(panoramaSetPickingViewpoint(true))}
      />

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

      {/* Which summits are named and how they are ordered — four halves of one
          question, all instant, so they share a menu. Sliders rather than
          lists, since the useful settings are a dozen each and a dozen items is
          a menu to read where this is a thing to feel out. The toggle is named
          rather than summarised: no two of the four speak for the others. */}
      <SliderDropdown
        icon={densityIcon}
        toggleLabel={m?.labels.title}
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

        {/* The two that decide the order rather than the cut. */}
        <LabeledSlider
          id="fm-panorama-weight"
          label={m?.labels.weight}
          valueLabel={m?.labels.weights[weightStep]}
          hint={m?.labels.weightHint}
          min={0}
          max={LABEL_DISTANCE_WEIGHTS.length - 1}
          value={weightStep}
          onChange={(step) =>
            dispatch(
              panoramaSetSettings({
                labelDistanceWeight: LABEL_DISTANCE_WEIGHTS[step] ?? 0.5,
              }),
            )
          }
        />

        <LabeledSlider
          id="fm-panorama-haze"
          label={m?.labels.haze}
          valueLabel={hazeLabel}
          hint={m?.labels.hazeHint}
          min={0}
          max={LABEL_HAZE_MAX_KM}
          step={10}
          value={settings.labelHazeKm}
          onChange={(labelHazeKm) =>
            dispatch(panoramaSetSettings({ labelHazeKm }))
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

      {/* What the picture is looked at with, as against what it is made of:
            pushed to the far end so the row reads render settings first, and
            these last. */}
      <span className="ms-auto d-flex align-items-center gap-1">
        {/* The icon is what says which state it is in, so this is an ordinary
              action rather than a toggle wearing an outline. */}
        <LongPressTooltip label={m?.autoPan}>
          {({ props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                // Asked on either edge, not just when turning it on: a phone
                // starts out following, so the press that gets here first is
                // as often the one stopping it. Straight out of the click,
                // since that is the only place iOS grants it from.
                void requestCompassPermission();

                dispatch(panoramaSetSettings({ autoPan: !settings.autoPan }));
              }}
              {...props}
            >
              {/* Where there is a magnetometer the view follows it rather than
                  turning by itself, so a play mark would promise the wrong
                  thing — see `PanoramaView`. */}
              {settings.autoPan ? (
                <FaStop />
              ) : isCompassSupported() ? (
                <FaCompass />
              ) : (
                <FaPlay />
              )}
            </Button>
          )}
        </LongPressTooltip>

        <FullscreenButton
          fullscreen={fullscreen}
          onToggle={onToggleFullscreen}
        />

        <LongPressTooltip label={m?.caveats.title}>
          {({ props }) => (
            <Button
              variant="secondary"
              active={showCaveats}
              onClick={onToggleCaveats}
              {...props}
            >
              <FaInfoCircle />
            </Button>
          )}
        </LongPressTooltip>
      </span>
    </FloatingWindowControls>
  );
}

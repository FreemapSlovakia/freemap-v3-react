import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  isCompassSupported,
  requestCompassPermission,
} from '@features/location/compass.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import {
  FloatingWindowControls,
  useFullscreenAction,
} from '@shared/components/FloatingWindowControls.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useConfirmChoice } from '@shared/components/ModalProvider.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { SliderDropdown } from '@shared/components/SliderDropdown.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { nearestStep } from '@shared/mathUtils.js';
import type { ReactElement } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  FaCog,
  FaCompass,
  FaCrosshairs,
  FaInfoCircle,
  FaPlay,
  FaStop,
  FaStreetView,
  FaSync,
} from 'react-icons/fa';
import { PiCompassRoseBold } from 'react-icons/pi';
import {
  TbBaselineDensityLarge,
  TbBaselineDensityMedium,
  TbBaselineDensitySmall,
  TbGridDots,
  TbTagOff,
} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  panoramaRender,
  panoramaSetPicking,
  panoramaSetSettings,
  panoramaToToposcope,
} from '../model/actions.js';
import {
  DOMINANCE_STEPS_M,
  FOV_FULL,
  hazeStepIndex,
  isFullTurn,
  LABEL_DENSITY_MAX,
  LABEL_DISTANCE_WEIGHTS,
  LABEL_HAZE_STEPS_KM,
  labelWeightBand,
  NO_DOMINANCE_FILTER,
  PANORAMA_FOVS,
  PROMINENCE_WEIGHT_MAX,
  PROMINENCE_WEIGHT_STEP,
  panoramaSettingsInitialState,
  prominenceWeightStep,
} from '../model/settingsReducer.js';
import {
  DETAIL_MAX,
  grantedPanorama,
  type PanoramaDetail,
  panoramaDetailStops,
  panoramaExpectedMs,
  panoramaRenderKey,
} from '../quality.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

/**
 * What the peak-names menu owns, and so what its Reset puts back — the tilt,
 * the quality and everything behind the settings modal are nobody's business
 * here.
 */
const LABEL_DEFAULTS = {
  labelDensity: panoramaSettingsInitialState.labelDensity,
  showLabelEle: panoramaSettingsInitialState.showLabelEle,
  minDominance: panoramaSettingsInitialState.minDominance,
  labelDistanceWeight: panoramaSettingsInitialState.labelDistanceWeight,
  prominenceWeight: panoramaSettingsInitialState.prominenceWeight,
  labelHazeKm: panoramaSettingsInitialState.labelHazeKm,
  showRevealedLabels: panoramaSettingsInitialState.showRevealedLabels,
};

const LABEL_SETTING_KEYS = Object.keys(
  LABEL_DEFAULTS,
) as (keyof typeof LABEL_DEFAULTS)[];

/** Narrowest first, the way a slider runs; a full turn is the far end. */
const FOV_STOPS = [...PANORAMA_FOVS].reverse();

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

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const prm = usePremiumMessages();

  const settings = useAppSelector((state) => state.panoramaSettings);

  const { viewpoint, render, rendering, renderAz } = useAppSelector(
    (state) => state.panorama,
  );

  const hasDrawnPoints = useAppSelector(
    (state) => state.drawingPoints.points.length > 0,
  );

  const confirmChoice = useConfirmChoice();

  const fullscreenAction = useFullscreenAction(fullscreen);

  // Asked rather than decided here: the summits are drawn points like any
  // others, so a map that already carries some can as well gain a dial as be
  // cleared for one.
  const createToposcope = async () => {
    let replace = false;

    if (hasDrawnPoints) {
      const choice = await confirmChoice({
        title: m?.toposcopeMergeModal.title,
        message: m?.toposcopeMergeModal.message,
        confirmLabel: m?.toposcopeMergeModal.append,
        extraLabel: m?.toposcopeMergeModal.replace,
        extraStyle: 'danger',
      });

      if (choice === 'cancel') {
        return;
      }

      replace = choice === 'extra';
    }

    dispatch(panoramaToToposcope({ replace }));
  };

  const grants = grantedPanorama(settings, premium);

  const nf = useNumberFormat({ maximumFractionDigits: 2 });

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

  const nfInt = useNumberFormat({ maximumFractionDigits: 0 });

  const nfSec = useNumberFormat({
    style: 'unit',
    unit: 'second',
    maximumFractionDigits: 0,
  });

  // The stops this frame can actually be rendered at, with `max` last — the one
  // stop that follows the frame rather than naming a figure. Stops past what
  // the frame or the account allows are not offered at all, rather than offered
  // and then clamped out from under the handle.
  const detailStops: PanoramaDetail[] = [
    ...panoramaDetailStops(settings, premium),
    DETAIL_MAX,
  ];

  // The handle sits on what is being served, not on what was asked: a stored
  // detail this frame or this account no longer affords is granted the nearest
  // stop below it, and the handle has to say so.
  const servedIndex =
    settings.detail === DETAIL_MAX
      ? detailStops.length - 1
      : detailStops.indexOf(grants.pxPerDeg);

  const detailIndex = servedIndex < 0 ? detailStops.length - 1 : servedIndex;

  // Pixels per degree rather than the request's own degrees per pixel: it reads
  // the way a person expects — more is sharper — and it says the same thing
  // about a slice as about a full turn, where a pixel count would call a narrow
  // slice coarser for being smaller.
  const pxLabel = `${nfInt.format(grants.pxPerDeg)} px/°`;

  const detailLabel =
    settings.detail === DETAIL_MAX
      ? `${m?.quality.maximum} · ${pxLabel}`
      : pxLabel;

  const expectedMs = panoramaExpectedMs(grants.pxPerDeg, settings);

  const dominanceStep = nearestStep(DOMINANCE_STEPS_M, settings.minDominance);

  const dominanceLabel =
    settings.minDominance === NO_DOMINANCE_FILTER
      ? m?.dominance.all
      : `≥ ${nfM.format(settings.minDominance)}`;

  const hazeLabel = settings.labelHazeKm
    ? nfKm.format(settings.labelHazeKm)
    : m?.labels.hazeOff;

  const prominenceStep = prominenceWeightStep(settings.prominenceWeight);

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
      render.key !== panoramaRenderKey(viewpoint, settings, grants, renderAz));

  return (
    <FloatingWindowControls fullscreen={fullscreen}>
      <OfflineBadge hint={gm?.general.offlineToolUnavailable} />

      {/* First, because nothing else in the row means anything until there is a
          place to look from. */}
      <PlacePickerButton
        consumer="panorama"
        variant={viewpoint ? 'secondary' : 'primary'}
        label={m?.pickViewpoint}
        icon={<FaStreetView />}
        locateLabel={m?.locate}
        // iOS grants the magnetometer only from a gesture, and the pick itself
        // happens later in a processor, nowhere near one.
        onAct={requestCompassPermission}
        onPick={() => dispatch(panoramaSetPicking('viewpoint'))}
      />

      {/* The frame: how much horizon, how much sky and ground, and how fine.
          One question with one answer — the wait — and one control, because
          each of the three moves what the others can reach and the figures
          only make sense beside each other. */}
      <SliderDropdown
        icon={<TbGridDots />}
        // What is being rendered, not what is stored: an account without
        // premium asks for more by default and is held to its budget, and
        // showing it the figure it cannot have would be a lie. The stored ask
        // is kept either way, so premium grants it back silently. The band is
        // left off: of the three it moves least and costs least.
        toggleLabel={`${isFullTurn(settings.fovDeg) ? m?.fov.full : nfDeg.format(settings.fovDeg)} · ${nfInt.format(grants.pxPerDeg)} px/°`}
        name={m?.frame}
        breakpoint="md"
        // Says on the toolbar why the picture is the coarse one; the reason is
        // otherwise only inside a menu nobody opens to find out what they lack.
        toggleClassName={premium ? undefined : 'text-warning'}
        toggleHint={premium ? undefined : prm?.higherDetail}
      >
        {/* The one setting that buys time back rather than spending it, and at
            `max` detail spends it on sharpness instead. `All around` is the
            last stop rather than the first: it is what the tool means, but a
            slider runs from least to most and a turn is the most there is. */}
        <LabeledSlider
          id="fm-panorama-fov"
          label={m?.fov.label}
          valueLabel={
            isFullTurn(settings.fovDeg)
              ? m?.fov.full
              : nfDeg.format(settings.fovDeg)
          }
          min={0}
          max={FOV_STOPS.length - 1}
          value={Math.max(
            0,
            FOV_STOPS.findIndex((fov) => fov >= settings.fovDeg),
          )}
          onChange={(index) =>
            dispatch(
              panoramaSetSettings({ fovDeg: FOV_STOPS[index] ?? FOV_FULL }),
            )
          }
        />

        <LabeledSlider
          id="fm-panorama-detail"
          label={
            <>
              {m?.quality.detail}

              {!premium && <PremiumGem hint={prm?.higherDetail} />}
            </>
          }
          valueLabel={detailLabel}
          min={0}
          max={detailStops.length - 1}
          value={detailIndex}
          onChange={(index) =>
            dispatch(
              panoramaSetSettings({ detail: detailStops[index] ?? DETAIL_MAX }),
            )
          }
        />

        {/* What the three come to, server and this side both: the picture
            arrives some way after the spinner says the service is done. */}
        <div className="text-body-secondary text-end">
          ≈ {nfSec.format(expectedMs / 1000)}
        </div>
      </SliderDropdown>

      {/* Which summits are named and how they are ordered — one question in
          several parts, all instant, so they share a menu. Sliders rather than
          lists, since the useful settings are a dozen each and a dozen items is
          a menu to read where this is a thing to feel out. The toggle is named
          rather than summarised: no two of them speak for the others. */}
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

        {/* Beside the count, because it is the other half of the same
            question: a second line makes every label taller, so fewer of them
            fit the picture. */}
        <div className="d-flex">
          <Form.Check
            id="fm-panorama-label-ele"
            type="checkbox"
            label={m?.labels.showEle}
            checked={settings.showLabelEle}
            onChange={(e) =>
              dispatch(
                panoramaSetSettings({ showLabelEle: e.currentTarget.checked }),
              )
            }
          />

          <HintMark hint={m?.labels.showEleHint} />
        </div>

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

        {/* Those that decide the order rather than the cut. */}
        <LabeledSlider
          id="fm-panorama-weight"
          label={m?.labels.weight}
          // Of the stop the knob snapped to, not of the stored value: an
          // off-stop one from an older store would otherwise put the knob on
          // "Nearness" while the word beside it said "Mostly nearness".
          valueLabel={
            m?.labels.weights[
              labelWeightBand(LABEL_DISTANCE_WEIGHTS[weightStep] ?? 0.5)
            ]
          }
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
          max={LABEL_HAZE_STEPS_KM.length - 1}
          value={hazeStepIndex(settings.labelHazeKm)}
          onChange={(step) =>
            dispatch(
              panoramaSetSettings({
                labelHazeKm: LABEL_HAZE_STEPS_KM[step] ?? 0,
              }),
            )
          }
        />

        {/* The third thing the rank weighs, beside what the two above set. A
            bare number like the ridge sliders, since the useful range is
            narrow and no five words divide it usefully. */}
        <LabeledSlider
          id="fm-panorama-prominence"
          label={m?.labels.prominence}
          valueLabel={
            prominenceStep ? nf.format(prominenceStep) : m?.labels.prominenceOff
          }
          hint={m?.labels.prominenceHint}
          min={0}
          max={PROMINENCE_WEIGHT_MAX}
          step={PROMINENCE_WEIGHT_STEP}
          value={prominenceStep}
          onChange={(prominenceWeight) =>
            dispatch(panoramaSetSettings({ prominenceWeight }))
          }
        />

        {/* Of the picture on screen, not of the setting: staging a lift, or
            taking one away, must not hide the only control that can bring back
            the names hidden in the render still being looked at. A cut like the
            two above and instant like them, so it belongs here rather than
            beside the lift itself, which costs a render. */}
        {(render?.depthLift ?? 0) > 0 && (
          <div className="d-flex">
            <Form.Check
              id="fm-panorama-revealed"
              type="checkbox"
              label={m?.labels.showRevealed}
              checked={settings.showRevealedLabels}
              onChange={(e) =>
                dispatch(
                  panoramaSetSettings({
                    showRevealedLabels: e.currentTarget.checked,
                  }),
                )
              }
            />

            <HintMark hint={m?.labels.showRevealedHint} />
          </div>
        )}

        {/* Several sliders deep into a picture is no place to be stuck, and
            none of them says what it started at. Applies at once, like
            everything else here — there is no form to submit.

            It answers for the revealed-names checkbox even where no lift has
            drawn it: that setting persists, so leaving it out would strand a
            non-default the menu offers no other way back from. The cost is that
            the button can be live with nothing on screen to show for it. */}
        <ResetToDefaultsButton
          className="align-self-end"
          onClick={() => dispatch(panoramaSetSettings(LABEL_DEFAULTS))}
          disabled={LABEL_SETTING_KEYS.every(
            (key) => settings[key] === LABEL_DEFAULTS[key],
          )}
        />
      </SliderDropdown>

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
          these last. Every one of them is a plain button, so they collapse
          into the menu as the window narrows — measured against the window
          itself; see `BreakpointsProvider` in `Panorama`. The order they go in
          is the order of their `showFrom`: the ⓘ panel of prose first, full
          screen last, that one being worth most where there is least room. */}
      <ResponsiveActions
        className="ms-auto"
        // The row's own spacing, which is a step tighter than this component's
        // default — a toolbar of icons, not a form.
        gap={1}
        fit
        toggleLabel={gm?.general.actions}
      >
        {/* The reverse of a press in the picture, which answers with a place on
            the map: nothing to aim until there is a picture. */}
        <Action
          label={m?.lookAt}
          icon={<FaCrosshairs />}
          showFrom="sm"
          disabled={!render}
          onClick={() => dispatch(panoramaSetPicking('target'))}
        />

        {/* Set-once settings — eye height, an exact vertical band, the look —
            which all cost a render, so they sit behind a modal rather than in
            reach of a stray click. */}
        <Action
          label={m?.settings.title}
          icon={<FaCog />}
          showFrom="md"
          onClick={() =>
            dispatch(setActiveModal({ type: 'panorama-settings' }))
          }
        />

        {/* The icon is what says which state it is in, so this is an ordinary
            action rather than a toggle wearing an outline. Where there is a
            magnetometer the view follows it rather than turning by itself, so a
            play mark would promise the wrong thing — see `PanoramaView`.

            Never disabled, though a slice has nothing to turn through: a phone
            starts out following, so disabling it there would leave someone
            unable to turn it off and the view spinning again the moment they
            went back to a full turn. It sets the preference either way. */}
        <Action
          label={m?.autoPan}
          icon={
            settings.autoPan ? (
              <FaStop />
            ) : isCompassSupported() ? (
              <FaCompass />
            ) : (
              <FaPlay />
            )
          }
          showFrom="lg"
          onClick={() => {
            // Asked on either edge, not just when turning it on: a phone starts
            // out following, so the press that gets here first is as often the
            // one stopping it. Straight out of the click, since that is the
            // only place iOS grants it from.
            void requestCompassPermission();

            dispatch(panoramaSetSettings({ autoPan: !settings.autoPan }));
          }}
        />

        <Action
          label={showCaveats ? gm?.general.close : m?.caveats.title}
          icon={<FaInfoCircle />}
          showFrom="xl"
          active={showCaveats}
          onClick={onToggleCaveats}
        />

        <Action {...fullscreenAction} onClick={onToggleFullscreen} />

        {/* First to fold, being the rarest and the costliest. Not the
            "Toposcope from here" among the viewpoint's own actions, which
            stands the dial here and leaves the rays to whatever is drawn:
            this one carries the picture's own names round to it. */}
        <Action
          label={m?.createToposcope}
          icon={<PiCompassRoseBold />}
          showFrom="xxl"
          disabled={!render}
          onClick={() => void createToposcope()}
        />
      </ResponsiveActions>
    </FloatingWindowControls>
  );
}

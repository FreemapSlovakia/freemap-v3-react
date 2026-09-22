import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  type ReactElement,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { Button, ButtonGroup, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  gradientFarStepIndex,
  gradientFarSteps,
  type PanoramaGradient,
} from '../gradient.js';
import { panoramaSetSettings } from '../model/actions.js';
import {
  ALT_LIMIT,
  DEPTH_LIFT_MAX,
  PANORAMA_LOOK_NAMES,
  PANORAMA_LOOKS,
  PANORAMA_TILTS,
  type PanoramaLook,
  type PanoramaSettingsState,
  panoramaLookOf,
  panoramaSettingsInitialState,
  RANGE_MAX_KM,
  RANGE_MIN_KM,
  RIDGE_STRENGTH_MAX,
  RIDGE_WIDTH_MAX,
  tiltRange,
} from '../model/settingsReducer.js';
import { FREE_RANGE_MAX_KM, grantedRangeKm } from '../quality.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import { PanoramaGroundPicker } from './PanoramaGroundPicker.js';

type Props = { show: boolean };

/** What this modal owns; the rest of the settings belong to the toolbar. */
type Draft = Pick<
  PanoramaSettingsState,
  | 'eye'
  | 'altMin'
  | 'altMax'
  | 'depthLift'
  | 'rangeKm'
  | 'ridgeStrength'
  | 'ridgeWidth'
  | 'ridgeColor'
  | 'groundColor'
  | 'groundGradient'
>;

/** Shortest frame to tallest, as a row of presses above the two sliders. */
const TILT_PRESETS = ['flat', 'standard', 'wide'] as const;

const EYE_MIN = 0;

const EYE_MAX = 300;

/**
 * What a number field currently says. `NaN` for an empty one rather than
 * `Number('')`'s `0`, which would read as an answer — standing on the ground,
 * or a band with an edge on the horizon — instead of a field mid-edit, and the
 * validity check would let it through.
 */
function typedNumber(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

/** The current settings as a form: the band as its two angles, whichever way
 * it is stored, so the sliders read as what is framed now. */
function seedDraft(settings: PanoramaSettingsState): Draft {
  const [altMin, altMax] = tiltRange(settings);

  return {
    eye: settings.eye,
    altMin,
    altMax,
    depthLift: settings.depthLift,
    rangeKm: settings.rangeKm,
    ridgeStrength: settings.ridgeStrength,
    ridgeWidth: settings.ridgeWidth,
    ridgeColor: settings.ridgeColor,
    groundColor: settings.groundColor,
    groundGradient: settings.groundGradient,
  };
}

/** What "reset" means here: the initial state, for everything this form owns. */
const defaults: Draft = seedDraft(panoramaSettingsInitialState);

/**
 * The panorama's set-once settings: how high the eye stands, the exact vertical
 * band when no preset frames what is wanted, and what the picture is drawn to
 * look like.
 *
 * A modal rather than more toolbar controls, because every one of these is a
 * **request** parameter: unlike the peak-name sliders, which rearrange the
 * picture already in hand, changing any of them is another render of a server
 * that draws one at a time. Saving stages the change the way dragging the
 * viewpoint does, and the Update button pays for it.
 */
export default function PanoramaSettingsModal({ show }: Props): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  const dispatch = useDispatch();

  const settings = useAppSelector((state) => state.panoramaSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const nf = useNumberFormat({ maximumFractionDigits: 1 });

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

  // A copy to edit, so a render landing underneath the modal can't rewrite what
  // is being typed and Cancel really is a cancel.
  const [draft, setDraft] = useState<Draft>(() => seedDraft(settings));

  // Re-seeded on opening, not only on mounting: `AsyncModal` keeps this around
  // for a second after it closes so it can animate out, and reopening inside
  // that second would otherwise bring back the very edits Cancel threw away —
  // with Save then committing them.
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: opening is the event; the settings are read at that moment, not followed
  useEffect(() => {
    if (show) {
      setDraft(seedDraft(settings));
    }
  }, [show]);

  const patch = (values: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...values }));

  const close = () => {
    dispatch(setActiveModal(null));
  };

  // The eye is metres above the ground, and a number field can be left empty
  // mid-edit. The band needs no such check: the presets and the two sliders
  // cannot express a bad one, each running 1..ALT_LIMIT on its own side.
  const invalid =
    !Number.isFinite(draft.eye) || draft.eye < EYE_MIN || draft.eye > EYE_MAX;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const { altMin, altMax, ...rest } = draft;

    // A band that is exactly a preset's is stored as that preset, whether it
    // was dragged there or came from Reset: kept as `custom` it would say the
    // same thing in a form no control marks as chosen.
    const preset = TILT_PRESETS.find(
      (name) =>
        PANORAMA_TILTS[name][0] === altMin &&
        PANORAMA_TILTS[name][1] === altMax,
    );

    dispatch(
      panoramaSetSettings({
        ...rest,
        ...(preset
          ? { tilt: preset }
          : { tilt: 'custom' as const, altMin, altMax }),
      }),
    );

    close();
  };

  useDocumentTitle(show ? m?.settings.title : undefined);

  const look = panoramaLookOf(draft);

  // What the slider shows and what the figure beside it says, both: a lapsed
  // account whose stored range is past the free bound is rendering this one.
  const grantedRange = grantedRangeKm(draft.rangeKm, premium);

  const gradient = draft.groundGradient;

  const patchGradient = (values: Partial<PanoramaGradient>) => {
    if (gradient) {
      patch({ groundGradient: { ...gradient, ...values } });
    }
  };

  // Cut at how far this render may see: a ramp ending past `range` is a 400,
  // not a picture.
  const farSteps = gradientFarSteps(grantedRange);

  const farIndex = gradientFarStepIndex(farSteps, gradient?.farKm ?? null);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The colour picker's popover is portalled to <body>, so the focus trap
      // would steal focus from its inputs — the same reason the drawing style
      // modal turns it off.
      enforceFocus={false}
    >
      {/* `step` is what the arrows move by, not a rule: without this the
          browser refuses to submit 1.65 m while Save sits there enabled. */}
      <form onSubmit={handleSubmit} className="d-contents" noValidate>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.settings.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="fm-panorama-eye">
              {gm?.general.eyeHeight}
              <HintMark hint={gm?.general.eyeHeightHint} />
            </Form.Label>

            <InputGroup hasValidation>
              <Form.Control
                id="fm-panorama-eye"
                type="number"
                min={EYE_MIN}
                max={EYE_MAX}
                step={0.1}
                isInvalid={invalid}
                value={Number.isFinite(draft.eye) ? draft.eye : ''}
                onChange={(e) =>
                  patch({
                    eye: typedNumber(e.currentTarget.value),
                  })
                }
              />

              {/* Literal, as the shading modal's metre fields are: the symbol
                  is the sam */}
              <InputGroup.Text>m</InputGroup.Text>

              <Form.Control.Feedback type="invalid">
                {gm?.general.valueRange({
                  min: `${EYE_MIN}\u00a0m`,
                  max: `${EYE_MAX}\u00a0m`,
                })}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Here rather than on the toolbar: a band is set to taste and then
              left, where the view angle and the detail are changed for every
              other picture. The presets are one press and what most views want;
              the sliders under them are the same setting said exactly. */}
          <Form.Group className="mb-3">
            <Form.Label>
              {m?.tilt.label}
              <HintMark hint={m?.settings.tiltHint} />
            </Form.Label>

            <ButtonGroup className="mb-2">
              {TILT_PRESETS.map((preset) => {
                const [lo, hi] = PANORAMA_TILTS[preset];

                return (
                  <Button
                    key={preset}
                    variant={
                      draft.altMin === lo && draft.altMax === hi
                        ? 'primary'
                        : 'outline-primary'
                    }
                    onClick={() => patch({ altMin: lo, altMax: hi })}
                  >
                    {m?.tilt[preset]}
                  </Button>
                );
              })}
            </ButtonGroup>

            {/* Degrees from the horizon, so both read positive and neither can
                be dragged through the other into a band with no height. */}
            <LabeledSlider
              id="fm-panorama-alt-max"
              label={m?.tilt.above}
              valueLabel={nfDeg.format(draft.altMax)}
              min={1}
              max={ALT_LIMIT}
              value={draft.altMax}
              onChange={(altMax) => patch({ altMax })}
            />

            <LabeledSlider
              id="fm-panorama-alt-min"
              label={m?.tilt.below}
              valueLabel={nfDeg.format(-draft.altMin)}
              min={1}
              max={ALT_LIMIT}
              value={-draft.altMin}
              onChange={(below) => patch({ altMin: -below })}
            />
          </Form.Group>

          {/* Beside the band because it moves it: the horizon rises by exactly
              the lift, and the request adds the same on top so the far ridges
              stay in frame. */}
          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-panorama-depth-lift"
              label={m?.settings.depthLift}
              valueLabel={
                draft.depthLift
                  ? `${nf.format(draft.depthLift)}°`
                  : m?.settings.depthLiftOff
              }
              hint={m?.settings.depthLiftHint}
              min={0}
              max={DEPTH_LIFT_MAX}
              step={0.5}
              value={draft.depthLift}
              onChange={(depthLift) => patch({ depthLift })}
            />
          </Form.Group>

          {/* Capped at what the account may have rather than clamped after the
              fact, the way the cached-map zooms are: the gem beside the name is
              what says the rest of the slider exists. */}
          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-panorama-range"
              label={
                <>
                  {gm?.general.maxVisibleDistance}

                  {!premium && <PremiumGem hint={m?.settings.rangeHint} />}
                </>
              }
              valueLabel={nfKm.format(grantedRange)}
              min={RANGE_MIN_KM}
              max={premium ? RANGE_MAX_KM : FREE_RANGE_MAX_KM}
              step={10}
              value={grantedRange}
              onChange={(rangeKm) => patch({ rangeKm })}
            />
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label>{m?.settings.look}</Form.Label>

            <div>
              <SelectDropdown
                value={look}
                onSelect={(value) => {
                  const preset =
                    PANORAMA_LOOKS[(value ?? 'natural') as PanoramaLook];

                  if (preset) {
                    patch(preset);
                  }
                }}
                options={PANORAMA_LOOK_NAMES.map((name) => ({
                  value: name,
                  label: m?.settings.looks[name],
                  // Nothing to apply: it is what the three below already say.
                  disabled: name === 'custom',
                }))}
                asSelect
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-panorama-ridge"
              label={m?.settings.ridgeStrength}
              valueLabel={nf.format(draft.ridgeStrength)}
              min={0}
              max={RIDGE_STRENGTH_MAX}
              step={0.1}
              value={draft.ridgeStrength}
              onChange={(ridgeStrength) => patch({ ridgeStrength })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-panorama-ridge-width"
              label={m?.settings.ridgeWidth}
              valueLabel={nf.format(draft.ridgeWidth)}
              min={0}
              max={RIDGE_WIDTH_MAX}
              step={0.1}
              value={draft.ridgeWidth}
              onChange={(ridgeWidth) => patch({ ridgeWidth })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="mb-0">{m?.settings.ridgeColor}</Form.Label>

            <div>
              <RgbaColorPicker
                value={draft.ridgeColor}
                onChange={(ridgeColor) => patch({ ridgeColor })}
                alpha={false}
              />
            </div>
          </Form.Group>

          {/* One control for both, because they are one thing asked two ways:
              the picker's own Solid/Gradient tabs say which, and its swatches
              are ready-made ramps. */}
          <Form.Group className={gradient ? 'mb-3' : undefined}>
            <Form.Label className="mb-0">
              {m?.settings.ground}
              <HintMark hint={m?.settings.groundHint} />
            </Form.Label>

            <div>
              <PanoramaGroundPicker
                color={draft.groundColor}
                gradient={gradient}
                onChange={(ground) =>
                  patch({
                    groundColor: ground.color,
                    groundGradient: ground.gradient,
                  })
                }
              />
            </div>
          </Form.Group>

          {gradient && (
            <>
              <Form.Group className="mb-3">
                <LabeledSlider
                  id="fm-panorama-gradient-far"
                  label={m?.settings.gradientFar}
                  // The stop the knob stands on, not the stored figure: a range
                  // lowered under it leaves the two disagreeing, and the
                  // request is clamped to the same rung the knob shows.
                  valueLabel={
                    farSteps[farIndex] === null
                      ? m?.settings.gradientFarAuto
                      : nfKm.format(farSteps[farIndex])
                  }
                  hint={m?.settings.gradientFarHint}
                  min={0}
                  max={farSteps.length - 1}
                  value={farIndex}
                  onChange={(index) =>
                    patchGradient({ farKm: farSteps[index] })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3 d-flex">
                <Form.Check
                  id="fm-panorama-gradient-sky"
                  type="checkbox"
                  label={m?.settings.gradientSky}
                  checked={gradient.fadeToSky}
                  onChange={(e) =>
                    patchGradient({ fadeToSky: e.currentTarget.checked })
                  }
                />

                <HintMark hint={m?.settings.gradientSkyHint} />
              </Form.Group>

              {/* Nothing to decide while the far end is measured from the
                  terrain in view: what it would drop is the tail past the
                  percentile, which nobody chose to see. */}
              <Form.Group className="d-flex">
                <Form.Check
                  id="fm-panorama-gradient-clip"
                  type="checkbox"
                  label={m?.settings.gradientClip}
                  checked={gradient.clip}
                  disabled={farSteps[farIndex] === null}
                  onChange={(e) =>
                    patchGradient({ clip: e.currentTarget.checked })
                  }
                />

                <HintMark hint={m?.settings.gradientClipHint} />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={invalid}>
            <FaCheck /> {gm?.general.save}
          </Button>

          {/* Everything the form holds, not only the look: the button says it
              resets the form, and a modal that quietly left the eye height and
              the angles where they were would be lying about it. */}
          <ResetToDefaultsButton
            onClick={() => patch(defaults)}
            disabled={(Object.keys(defaults) as (keyof Draft)[]).every(
              (key) => draft[key] === defaults[key],
            )}
          />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {gm?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

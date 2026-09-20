import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useState,
} from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { viewshedSetSettings } from '../model/actions.js';
import {
  GAMMA_MAX,
  type ViewshedSettingsState,
  viewshedSettingsInitialState,
} from '../model/settingsReducer.js';
import { useViewshedMessages } from '../translations/useViewshedMessages.js';

/** What this modal owns; the range and the detail tier are the toolbar's. */
type Draft = Pick<
  ViewshedSettingsState,
  'eye' | 'targetHeight' | 'gamma' | 'alphaFloor' | 'color'
>;

/** Highest a target may be raised, metres — a mast, not a mountain. */
const TARGET_HEIGHT_MAX = 100;

/**
 * As high as "above the ground here" still means anything — chimney, drone,
 * balloon. The service caps nothing; nothing above ~6145 m could change a
 * picture either, the curvature horizon being past the widest radius by then.
 */
const EYE_MAX = 3000;

/**
 * What a number field currently says. `NaN` for an empty one rather than
 * `Number('')`'s `0`, which would read as standing on the ground instead of a
 * field mid-edit, and the validity check would let it through.
 */
function typedNumber(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

function seedDraft(settings: ViewshedSettingsState): Draft {
  return {
    eye: settings.eye,
    targetHeight: settings.targetHeight,
    gamma: settings.gamma,
    alphaFloor: settings.alphaFloor,
    color: settings.color,
  };
}

/** What "reset" means here: the initial state, for everything this form owns. */
const defaults: Draft = seedDraft(viewshedSettingsInitialState);

type HeightFieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  value: number;
  max: number;
  /** What the arrows move by; a mast is not measured in decimetres. */
  step: number;
  /** Decided by the form, which gates Save on the same answer. */
  invalid: boolean;
  onChange: (value: number) => void;
};

/**
 * A height in metres, written rather than dragged: these are figures one knows
 * — eye level, a chimney, a drone — and nothing moves on screen to aim at.
 */
function HeightField({
  id,
  label,
  hint,
  value,
  max,
  step,
  invalid,
  onChange,
}: HeightFieldProps): ReactElement {
  const m = useMessages();

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor={id}>
        {label}
        {hint && <HintMark hint={hint} />}
      </Form.Label>

      <InputGroup hasValidation>
        <Form.Control
          id={id}
          type="number"
          min={0}
          max={max}
          step={step}
          isInvalid={invalid}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(typedNumber(e.currentTarget.value))}
        />

        <InputGroup.Text>m</InputGroup.Text>

        <Form.Control.Feedback type="invalid">
          {m?.general.valueRange({ min: '0\u00a0m', max: `${max}\u00a0m` })}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );
}

type Props = { show: boolean };

/**
 * The viewshed's set-once settings. Every one of them is in
 * `viewshedRenderKey`, so none of them changes the picture on screen — saving
 * stages the change the way dragging the viewpoint does, and the toolbar's
 * Update button pays for it. A modal rather than more toolbar controls for that
 * reason, as the panorama's are.
 */
export default function ViewshedSettingsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const vm = useViewshedMessages();

  const dispatch = useDispatch();

  const settings = useAppSelector((state) => state.viewshedSettings);

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  const nfGamma = useNumberFormat({ maximumFractionDigits: 2 });

  // A copy to edit, so Cancel really is a cancel.
  const [draft, setDraft] = useState<Draft>(() => seedDraft(settings));

  // Re-seeded on opening, not only on mounting: `AsyncModal` keeps this around
  // for a second after it closes so it can animate out, and reopening inside
  // that second would otherwise bring back the very edits Cancel threw away.
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

  // Both heights are metres above the ground, and a number field can be left
  // empty mid-edit.
  const invalidEye =
    !Number.isFinite(draft.eye) || draft.eye < 0 || draft.eye > EYE_MAX;

  const invalidTarget =
    !Number.isFinite(draft.targetHeight) ||
    draft.targetHeight < 0 ||
    draft.targetHeight > TARGET_HEIGHT_MAX;

  const invalid = invalidEye || invalidTarget;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(viewshedSetSettings(draft));

    close();
  };

  useDocumentTitle(show ? vm?.settings : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The colour picker's popover is portalled to `<body>`, so the focus trap
      // would steal focus from its inputs — as the panorama's modal has it.
      enforceFocus={false}
    >
      {/* `step` is what the arrows move by, not a rule: without this the
          browser refuses to submit 1.65 m while Save sits there enabled. */}
      <form onSubmit={handleSubmit} className="d-contents" noValidate>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {vm?.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <HeightField
            id="fm-viewshed-eye"
            label={m?.general.eyeHeight}
            hint={m?.general.eyeHeightHint}
            value={draft.eye}
            max={EYE_MAX}
            step={0.1}
            invalid={invalidEye}
            onChange={(eye) => patch({ eye })}
          />

          <HeightField
            id="fm-viewshed-target"
            label={vm?.targetHeight}
            hint={vm?.targetHeightHint}
            value={draft.targetHeight}
            max={TARGET_HEIGHT_MAX}
            step={1}
            invalid={invalidTarget}
            onChange={(targetHeight) => patch({ targetHeight })}
          />

          {/* Sliders, unlike the heights above: there is no figure to know,
              only a look to settle on. */}
          <Form.Group className="mb-3">
            {/* The faintness is in the pixels — the image's own alpha is the
                sine of the grazing angle — so this is the only control that can
                lift it; the layer's opacity can only take away. */}
            <LabeledSlider
              id="fm-viewshed-gamma"
              label={vm?.strength}
              valueLabel={
                draft.gamma === 1
                  ? vm?.strengthMeasured
                  : nfGamma.format(draft.gamma)
              }
              hint={vm?.strengthHint}
              min={1}
              max={GAMMA_MAX}
              step={0.25}
              value={draft.gamma}
              onChange={(gamma) => patch({ gamma })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-viewshed-floor"
              label={vm?.minOpacity}
              valueLabel={nfPercent.format(draft.alphaFloor)}
              hint={vm?.minOpacityHint}
              min={0}
              max={1}
              step={0.05}
              value={draft.alphaFloor}
              onChange={(alphaFloor) => patch({ alphaFloor })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="mb-0">{vm?.color}</Form.Label>

            <RgbaColorPicker
              value={draft.color}
              onChange={(color) => patch({ color })}
              alpha={false}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={invalid}>
            <FaCheck /> {m?.general.save}
          </Button>

          <ResetToDefaultsButton
            onClick={() => patch(defaults)}
            disabled={(Object.keys(defaults) as (keyof Draft)[]).every(
              (key) => draft[key] === defaults[key],
            )}
          />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

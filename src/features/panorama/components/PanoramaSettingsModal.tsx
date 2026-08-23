import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
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
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { panoramaSetSettings } from '../model/actions.js';
import {
  PANORAMA_LOOK_NAMES,
  PANORAMA_LOOKS,
  PANORAMA_STYLE_DEFAULTS,
  PANORAMA_TILTS,
  type PanoramaLook,
  type PanoramaSettingsState,
  panoramaLookOf,
  panoramaSettingsInitialState,
  RIDGE_STRENGTH_MAX,
  RIDGE_WIDTH_MAX,
  tiltRange,
} from '../model/settingsReducer.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

type Props = { show: boolean };

/** What this modal owns; the rest of the settings belong to the toolbar. */
type Draft = Pick<
  PanoramaSettingsState,
  | 'eye'
  | 'altMin'
  | 'altMax'
  | 'ridgeStrength'
  | 'ridgeWidth'
  | 'ridgeColor'
  | 'groundColor'
>;

const EYE_MIN = 0;

const EYE_MAX = 300;

/** Angles above and below the horizon, so short of straight up or down. */
const ALT_LIMIT = 89;

/**
 * What a number field currently says. `NaN` for an empty one rather than
 * `Number('')`'s `0`, which would read as an answer — standing on the ground,
 * or a band with an edge on the horizon — instead of a field mid-edit, and the
 * validity check would let it through.
 */
function typedNumber(value: string): number {
  return value.trim() ? Number(value) : Number.NaN;
}

/** The current settings as a form: the band as its two angles, whichever way it
 * is stored, so the fields read as the numbers behind what is framed now. */
function seedDraft(settings: PanoramaSettingsState): Draft {
  const [altMin, altMax] = tiltRange(settings);

  return {
    eye: settings.eye,
    altMin,
    altMax,
    ridgeStrength: settings.ridgeStrength,
    ridgeWidth: settings.ridgeWidth,
    ridgeColor: settings.ridgeColor,
    groundColor: settings.groundColor,
  };
}

/** What "reset" means here: the initial state, for everything this form owns. */
const defaults: Draft = {
  eye: panoramaSettingsInitialState.eye,
  altMin: tiltRange(panoramaSettingsInitialState)[0],
  altMax: tiltRange(panoramaSettingsInitialState)[1],
  ...PANORAMA_STYLE_DEFAULTS,
};

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

  const nf = useNumberFormat({ maximumFractionDigits: 1 });

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

  // A band the wrong way round would render nothing; the eye is metres above
  // the ground, and a number field can be left empty mid-edit.
  const invalid =
    !Number.isFinite(draft.eye) ||
    draft.eye < EYE_MIN ||
    draft.eye > EYE_MAX ||
    !Number.isFinite(draft.altMin) ||
    !Number.isFinite(draft.altMax) ||
    draft.altMax <= draft.altMin ||
    // A band is angles above and below the horizon; anything wider is not a
    // view, and `panoramaStep` would work a step out of it and ask the service
    // for something it refuses — with the bad band persisted behind it.
    draft.altMin < -ALT_LIMIT ||
    draft.altMax > ALT_LIMIT;

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const [altMin, altMax] = tiltRange(settings);

    const { altMin: _min, altMax: _max, ...rest } = draft;

    // A band that is exactly a preset's is that preset, whether it was typed or
    // came from Reset. Storing it as `custom` would leave the toolbar showing
    // "−18…12°" with the Standard item unticked, for the standard band.
    const preset = (
      Object.keys(PANORAMA_TILTS) as (keyof typeof PANORAMA_TILTS)[]
    ).find(
      (name) =>
        PANORAMA_TILTS[name][0] === draft.altMin &&
        PANORAMA_TILTS[name][1] === draft.altMax,
    );

    dispatch(
      panoramaSetSettings({
        ...rest,
        // The angles are written only when they are actually being changed.
        // Writing them regardless would overwrite a custom band the user had
        // set and then stepped away from with a preset — `altMin`/`altMax` are
        // deliberately left standing while a preset is chosen, so the band can
        // be returned to.
        ...(draft.altMin === altMin && draft.altMax === altMax
          ? {}
          : preset
            ? { tilt: preset }
            : {
                tilt: 'custom' as const,
                altMin: draft.altMin,
                altMax: draft.altMax,
              }),
      }),
    );

    close();
  };

  useDocumentTitle(show ? m?.settings.title : undefined);

  const look = panoramaLookOf(draft);

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
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.settings.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="fm-panorama-eye">{m?.settings.eye}</Form.Label>

            <InputGroup>
              <Form.Control
                id="fm-panorama-eye"
                type="number"
                min={EYE_MIN}
                max={EYE_MAX}
                step={0.1}
                value={Number.isFinite(draft.eye) ? draft.eye : ''}
                onChange={(e) =>
                  patch({
                    eye: typedNumber(e.currentTarget.value),
                  })
                }
              />

              {/* Literal, as the shading modal's metre fields are: the symbol
                  is the same in every locale this app speaks. */}
              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>

            <Form.Text>{m?.settings.eyeHint}</Form.Text>
          </Form.Group>

          {/* The angles themselves, not another preset list — picking a preset
              is the toolbar's job, and offering it here as well would be the
              same control in two places, free to disagree. Seeded from whatever
              is framed now, so this reads as "and here are the numbers behind
              it"; typing different ones is what makes the band custom. */}
          <Form.Group className="mb-3">
            {/* The toolbar's name for it, not "Exact angles": this is that
                setting, written as its numbers. The toolbar item that opens
                this modal is the one thing "Exact angles" names, and that is a
                door rather than a setting. */}
            <Form.Label>{m?.tilt.label}</Form.Label>

            {/* An en dash rather than a hyphen: the lower angle is normally
                negative, and a hyphen beside a minus sign reads as arithmetic. */}
            <InputGroup>
              <Form.Control
                type="number"
                step={1}
                value={Number.isFinite(draft.altMin) ? draft.altMin : ''}
                onChange={(e) =>
                  patch({
                    altMin: typedNumber(e.currentTarget.value),
                  })
                }
              />

              <InputGroup.Text>–</InputGroup.Text>

              <Form.Control
                type="number"
                step={1}
                value={Number.isFinite(draft.altMax) ? draft.altMax : ''}
                onChange={(e) =>
                  patch({
                    altMax: typedNumber(e.currentTarget.value),
                  })
                }
              />

              <InputGroup.Text>°</InputGroup.Text>
            </InputGroup>

            <Form.Text>{m?.settings.tiltHint}</Form.Text>
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

          <Form.Group>
            <Form.Label className="mb-0">{m?.settings.groundColor}</Form.Label>

            <div>
              <RgbaColorPicker
                value={draft.groundColor}
                onChange={(groundColor) => patch({ groundColor })}
                alpha={false}
              />
            </div>
          </Form.Group>
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

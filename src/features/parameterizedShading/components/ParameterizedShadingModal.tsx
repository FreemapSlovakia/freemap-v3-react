import { useMessages } from '@features/l10n/l10nInjector.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { isInvalidFloat, isInvalidInt } from '@shared/numberValidator.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { hexaToColor } from '../model/Shading.js';
import {
  DEFAULT_PRESET_PARAMS,
  type ParameterizedPreset,
  type PresetParams,
} from '../model/shadingPresets.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

const deElevation = (value: string | null) => value ?? '';

const deWidth = (value: string | null) => value ?? '10';

const deContourColor = (value: string | null) => value ?? '#000000d0';

const deBelowColor = (value: string | null) => value ?? '#e6e6e6d0';

const deAboveColor = (value: string | null) => value ?? '#e6e6e600';

const deMaxElevation = (value: string | null) => value ?? '3000';

const deMetallicColor = (value: string | null) => value ?? '#ffffffff';

const deDarkColor = (value: string | null) => value ?? '#000000ff';

const deRepeats = (value: string | null) => value ?? '3';

// 2 × repeats + 1 stops must fit the shader's 16 (`NUM_STOPS`).
const MAX_REPEATS = 7;

// Precious metals first, then dark tones for the colour between highlights.
const METAL_COLORS = [
  '#ffffff',
  '#c0c0c0',
  '#ffeb3b',
  '#ffd700',
  '#b87333',
  '#cd7f32',
  '#b76e79',
  '#000000',
  '#2a3439',
  '#3d2b1f',
  '#1a2a4a',
];

type Props = {
  kind: ParameterizedPreset | null;
  colorReliefMax: number;
  onClose: () => void;
  onApply: (params: PresetParams) => void;
};

export function ParameterizedShadingModal({
  kind,
  colorReliefMax,
  onClose,
  onApply,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  const [elevation, setElevation] = usePersistentState<string>(
    'fm.shading.param.elevation',
    String,
    deElevation,
  );

  const [width, setWidth] = usePersistentState<string>(
    'fm.shading.param.width',
    String,
    deWidth,
  );

  const [contourColor, setContourColor] = usePersistentState<string>(
    'fm.shading.contour.color',
    String,
    deContourColor,
  );

  const [belowColor, setBelowColor] = usePersistentState<string>(
    'fm.shading.fog.belowColor',
    String,
    deBelowColor,
  );

  const [aboveColor, setAboveColor] = usePersistentState<string>(
    'fm.shading.fog.aboveColor',
    String,
    deAboveColor,
  );

  const [maxElevation, setMaxElevation] = usePersistentState<string>(
    'fm.shading.hypsometric.maxElevation',
    String,
    deMaxElevation,
  );

  const [metallicColor, setMetallicColor] = usePersistentState<string>(
    'fm.shading.metallic.color',
    String,
    deMetallicColor,
  );

  const [darkColor, setDarkColor] = usePersistentState<string>(
    'fm.shading.metallic.darkColor',
    String,
    deDarkColor,
  );

  const [repeats, setRepeats] = usePersistentState<string>(
    'fm.shading.metallic.repeats',
    String,
    deRepeats,
  );

  const isBand = kind === 'contour' || kind === 'fog';

  // Not `required`, so an empty field is merely unfinished rather than wrong:
  // the elevation opens empty and reddening it on sight would read as broken.
  const invalidElevation = isInvalidFloat(elevation, false, 0, colorReliefMax);

  // A band taller than the terrain itself paints the whole map one colour.
  const invalidWidth = isInvalidFloat(width, false, 0, colorReliefMax);

  const invalidMaxElevation = isInvalidFloat(
    maxElevation,
    false,
    1,
    colorReliefMax,
  );

  const invalidRepeats = isInvalidInt(repeats, false, 1, MAX_REPEATS);

  const invalid = isBand
    ? elevation === '' || width === '' || invalidElevation || invalidWidth
    : kind === 'hypsometric'
      ? maxElevation === '' || invalidMaxElevation
      : repeats === '' || invalidRepeats;

  function handleSubmit() {
    if (invalid) {
      return;
    }

    onApply({
      ...DEFAULT_PRESET_PARAMS,
      elevation: Number(elevation),
      bandWidth: Number(width),
      color: hexaToColor(
        kind === 'contour'
          ? contourColor
          : kind === 'fog'
            ? belowColor
            : metallicColor,
      ),
      aboveColor: hexaToColor(aboveColor),
      maxElevation: Number(maxElevation),
      darkColor: hexaToColor(darkColor),
      repeats: Number(repeats),
    });
  }

  const elevationRange = m?.general.valueRange({
    min: '0 m',
    max: `${colorReliefMax} m`,
  });

  return (
    <Modal show={kind !== null} onHide={onClose} size="sm">
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          handleSubmit();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{kind && sm?.presetNames[kind]}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {isBand && (
            <>
              <Form.Group className="mb-3" controlId="ps-elevation">
                <Form.Label>{sm?.elevation}</Form.Label>

                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    step="any"
                    value={elevation}
                    onChange={(e) => setElevation(e.currentTarget.value)}
                    autoFocus
                    isInvalid={invalidElevation}
                    min={0}
                    max={colorReliefMax}
                  />

                  <InputGroup.Text>m</InputGroup.Text>

                  <Form.Control.Feedback type="invalid">
                    {elevationRange}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="ps-width">
                <Form.Label>{sm?.elevationBandWidth}</Form.Label>

                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    step="any"
                    min={0}
                    max={colorReliefMax}
                    value={width}
                    onChange={(e) => setWidth(e.currentTarget.value)}
                    isInvalid={invalidWidth}
                  />

                  <InputGroup.Text>m</InputGroup.Text>

                  <Form.Control.Feedback type="invalid">
                    {elevationRange}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </>
          )}

          {kind === 'fog' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>{sm?.belowColor}</Form.Label>

                <RgbaColorPicker value={belowColor} onChange={setBelowColor} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{sm?.aboveColor}</Form.Label>

                <RgbaColorPicker value={aboveColor} onChange={setAboveColor} />
              </Form.Group>
            </>
          )}

          {kind === 'contour' && (
            <Form.Group className="mb-3">
              <Form.Label>{sm?.color}</Form.Label>

              <RgbaColorPicker
                value={contourColor}
                onChange={setContourColor}
              />
            </Form.Group>
          )}

          {kind === 'hypsometric' && (
            <Form.Group className="mb-3" controlId="ps-max-elevation">
              <Form.Label>{sm?.maxElevation}</Form.Label>

              <InputGroup hasValidation>
                <Form.Control
                  type="number"
                  step="any"
                  min={1}
                  max={colorReliefMax}
                  value={maxElevation}
                  onChange={(e) => setMaxElevation(e.currentTarget.value)}
                  autoFocus
                  isInvalid={invalidMaxElevation}
                />

                <InputGroup.Text>m</InputGroup.Text>

                <Form.Control.Feedback type="invalid">
                  {m?.general.valueRange({
                    min: '1 m',
                    max: `${colorReliefMax} m`,
                  })}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          )}

          {kind === 'metallic' && (
            <>
              <Form.Group className="mb-3" controlId="ps-repeats">
                <Form.Label>{sm?.repeats}</Form.Label>

                <Form.Control
                  type="number"
                  step={1}
                  min={1}
                  max={MAX_REPEATS}
                  value={repeats}
                  onChange={(e) => setRepeats(e.currentTarget.value)}
                  autoFocus
                  isInvalid={invalidRepeats}
                />

                <Form.Control.Feedback type="invalid">
                  {m?.general.valueRange({
                    min: '1',
                    max: String(MAX_REPEATS),
                  })}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{sm?.highlightColor}</Form.Label>

                <RgbaColorPicker
                  value={metallicColor}
                  onChange={setMetallicColor}
                  presets={METAL_COLORS}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{sm?.darkColor}</Form.Label>

                <RgbaColorPicker
                  value={darkColor}
                  onChange={setDarkColor}
                  presets={METAL_COLORS}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {m?.general.cancel}
          </Button>

          <Button type="submit" variant="primary" disabled={invalid}>
            {sm?.apply}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

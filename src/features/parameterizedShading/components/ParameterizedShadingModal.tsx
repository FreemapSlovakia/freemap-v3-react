import { useMessages } from '@features/l10n/l10nInjector.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import Color from 'color';
import { ReactElement } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { type Color as ColorType, ShadingComponent } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

export type ParameterizedKind = 'contour' | 'fog';

/** Parse an `#rrggbb`/`#rrggbbaa` string into a `[r, g, b, a]` shading color. */
function hexaToColor(hexa: string): ColorType {
  const c = Color(hexa);

  return [
    Math.round(c.red()),
    Math.round(c.green()),
    Math.round(c.blue()),
    c.alpha(),
  ];
}

const deElevation = (value: string | null) => value ?? '';

const deWidth = (value: string | null) => value ?? '10';

const deContourColor = (value: string | null) => value ?? '#000000d0';

const deBelowColor = (value: string | null) => value ?? '#e6e6e6d0';

const deAboveColor = (value: string | null) => value ?? '#e6e6e600';

type Props = {
  kind: ParameterizedKind | null;
  colorReliefMax: number;
  onClose: () => void;
  onAdd: (component: ShadingComponent) => void;
};

export function ParameterizedShadingModal({
  kind,
  colorReliefMax,
  onClose,
  onAdd,
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

  function handleSubmit() {
    const ele = Number(elevation);

    const w = Number(width);

    if (isNaN(ele) || isNaN(w)) {
      return;
    }

    const hwidth = w / 2;

    const id = Math.random();

    let component: ShadingComponent;

    if (kind === 'fog') {
      const below = hexaToColor(belowColor);

      const above = hexaToColor(aboveColor);

      component = {
        id,
        type: 'color-relief',
        colorStops: [
          { value: ele - hwidth, color: below },
          { value: ele + hwidth, color: above },
        ],
        brightness: 0,
        contrast: 1,
      };
    } else {
      const color = hexaToColor(contourColor);

      const transparent: ColorType = [color[0], color[1], color[2], 0];

      component = {
        id,
        type: 'color-relief',
        colorStops: [
          { value: ele - hwidth, color: transparent },
          { value: ele - hwidth, color },
          { value: ele + hwidth, color },
          { value: ele + hwidth, color: transparent },
        ],
        brightness: 0,
        contrast: 1,
      };
    }

    onAdd(component);
  }

  return (
    <Modal show={kind !== null} onHide={onClose} size="sm">
      <Form
        onSubmit={(e) => {
          e.preventDefault();

          handleSubmit();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {kind === 'fog' ? sm?.fogInversion : sm?.contour}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="ps-elevation">
            <Form.Label>{sm?.elevation}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                step="any"
                value={elevation}
                onChange={(e) => setElevation(e.currentTarget.value)}
                autoFocus
                min={0}
                max={colorReliefMax}
              />

              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="ps-width">
            <Form.Label>{sm?.elevationBandWidth}</Form.Label>

            <InputGroup>
              <Form.Control
                type="number"
                step="any"
                min={0}
                value={width}
                onChange={(e) => setWidth(e.currentTarget.value)}
              />

              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {kind === 'fog' ? (
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
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>{sm?.color}</Form.Label>

              <RgbaColorPicker
                value={contourColor}
                onChange={setContourColor}
              />
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {m?.general.cancel}
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={elevation === '' || width === ''}
          >
            {sm?.add}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

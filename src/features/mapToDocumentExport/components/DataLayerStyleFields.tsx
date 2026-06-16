import { useMessages } from '@features/l10n/l10nInjector.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import type { ChangeEvent, ReactElement } from 'react';
import {
  Form,
  InputGroup,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaRegSun } from 'react-icons/fa';
import type { CustomLayerOrder } from '../model/types.js';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';

type Props = {
  /** Disabled until at least two map-feature sources are selected. */
  disabled: boolean;
  glow: boolean;
  onGlowChange: (glow: boolean) => void;
  glowColor: string;
  onGlowColorChange: (color: string) => void;
  glowWidth: string;
  onGlowWidthChange: (e: ChangeEvent<HTMLInputElement>) => void;
  invalidGlowWidth: boolean;
  labelColor: string;
  onLabelColorChange: (color: string) => void;
  labelSize: string;
  onLabelSizeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  invalidLabelSize: boolean;
  labelWeight: string;
  onLabelWeightChange: (e: ChangeEvent<HTMLInputElement>) => void;
  invalidLabelWeight: boolean;
  customLayerOrder: CustomLayerOrder;
  onCustomLayerOrderChange: (value: CustomLayerOrder) => void;
};

export function DataLayerStyleFields({
  disabled,
  glow,
  onGlowChange,
  glowColor,
  onGlowColorChange,
  glowWidth,
  onGlowWidthChange,
  invalidGlowWidth,
  labelColor,
  onLabelColorChange,
  labelSize,
  onLabelSizeChange,
  invalidLabelSize,
  labelWeight,
  onLabelWeightChange,
  invalidLabelWeight,
  customLayerOrder,
  onCustomLayerOrderChange,
}: Props): ReactElement {
  const m = useMessages();

  const mtde = useMapToDocumentExportMessages();

  return (
    <fieldset disabled={disabled} className="mt-3">
      <Form.Group>
        <Form.Label className="d-block">{mtde?.glow}</Form.Label>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <ToggleButtonGroup
            type="checkbox"
            value={glow ? ['glow'] : []}
            onChange={(values: string[]) =>
              onGlowChange(values.includes('glow'))
            }
          >
            <ToggleButton
              id="exportGlow"
              value="glow"
              variant="outline-primary"
              className="rounded flex-grow-0"
            >
              <FaRegSun /> {mtde?.glow}
            </ToggleButton>
          </ToggleButtonGroup>

          {glow && (
            <>
              <InputGroup className="w-auto">
                <InputGroup.Text>{m?.generic.color}</InputGroup.Text>

                <RgbaColorPicker
                  value={glowColor}
                  onChange={onGlowColorChange}
                  className="flex-grow-0"
                  style={{ width: '3rem' }}
                />
              </InputGroup>

              <InputGroup className="w-auto">
                <InputGroup.Text>{m?.generic.width}</InputGroup.Text>

                <Form.Control
                  type="number"
                  value={glowWidth}
                  min={1}
                  max={50}
                  step={1}
                  isInvalid={invalidGlowWidth}
                  onChange={onGlowWidthChange}
                  style={{ minWidth: '5rem', width: '5rem' }}
                />
              </InputGroup>
            </>
          )}
        </div>
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Label className="d-block">{mtde?.labelTitle}</Form.Label>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup className="w-auto">
            <InputGroup.Text>{m?.generic.color}</InputGroup.Text>

            <RgbaColorPicker
              value={labelColor}
              onChange={onLabelColorChange}
              alpha={false}
              className="flex-grow-0"
              style={{ width: '3rem' }}
            />
          </InputGroup>

          <InputGroup className="w-auto">
            <InputGroup.Text>{m?.generic.size}</InputGroup.Text>

            <Form.Control
              type="number"
              value={labelSize}
              min={1}
              max={100}
              step={1}
              isInvalid={invalidLabelSize}
              onChange={onLabelSizeChange}
              style={{ minWidth: '5rem', width: '5rem' }}
            />
          </InputGroup>

          <InputGroup className="w-auto">
            <InputGroup.Text>{m?.generic.weight}</InputGroup.Text>

            <Form.Control
              type="number"
              value={labelWeight}
              min={100}
              max={900}
              step={100}
              isInvalid={invalidLabelWeight}
              onChange={onLabelWeightChange}
              style={{ minWidth: '5rem', width: '5rem' }}
            />
          </InputGroup>
        </div>
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Label className="d-block">{mtde?.customLayerOrder}</Form.Label>

        <ToggleButtonGroup
          type="radio"
          name="customLayerOrder"
          value={customLayerOrder}
          onChange={onCustomLayerOrderChange}
        >
          <ToggleButton
            id="customLayerOrder-natural"
            value="natural"
            variant="outline-primary"
          >
            {mtde?.orders.natural}
          </ToggleButton>

          <ToggleButton
            id="customLayerOrder-topmost"
            value="topmost"
            variant="outline-primary"
          >
            {mtde?.orders.topmost}
          </ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>
    </fieldset>
  );
}

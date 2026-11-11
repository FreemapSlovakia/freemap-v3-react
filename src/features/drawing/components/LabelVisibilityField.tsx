import { Text } from '@features/l10n/Text.js';
import { FitButtonGroup } from '@shared/components/FitButtonGroup.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  LABEL_MIN_ZOOM_FLOOR,
  type LabelSettings,
  LabelVisibilitySchema,
} from '@shared/labelVisibility.js';
import type { ReactElement } from 'react';
import { Form, ToggleButton } from 'react-bootstrap';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

type Props = {
  value: LabelSettings;
  onChange: (value: LabelSettings) => void;
};

export function LabelVisibilityField({ value, onChange }: Props): ReactElement {
  const dm = useDrawingMessages();

  const zoom = useAppSelector((state) => Math.round(state.map.zoom));

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

  // Past a since-lowered maxZoom too, so the select can show a stored value.
  const zooms = Array.from(
    {
      length: Math.max(maxZoom, value.minZoom ?? 0) - LABEL_MIN_ZOOM_FLOOR + 1,
    },
    (_, i) => i + LABEL_MIN_ZOOM_FLOOR,
  );

  return (
    <>
      <Form.Group className="mt-3">
        <Form.Label className="d-block">
          <Text m={dm} k="edit.showLabel" />
        </Form.Label>

        <FitButtonGroup>
          {LabelVisibilitySchema.options.map((option) => (
            <ToggleButton
              key={option}
              id={`labelVisibility-${option}`}
              type="radio"
              name="labelVisibility"
              variant="outline-primary"
              value={option}
              checked={value.visibility === option}
              onChange={() => onChange({ ...value, visibility: option })}
            >
              <Text m={dm} k={`edit.labelVisibility.${option}`} />
            </ToggleButton>
          ))}
        </FitButtonGroup>
      </Form.Group>

      <Form.Group className="mt-3" controlId="labelMinZoom">
        <Form.Label>
          <Text m={dm} k="edit.labelMinZoom" />
        </Form.Label>

        <Form.Select
          value={value.minZoom ?? ''}
          disabled={value.visibility === 'always'}
          onChange={(e) =>
            onChange({
              ...value,
              minZoom: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">{dm?.edit.labelMinZoomNever}</option>

          {zooms.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Form.Select>

        <Form.Text>
          <Text m={dm}>{(m) => m.edit.currentZoom({ zoom })}</Text>
        </Form.Text>
      </Form.Group>
    </>
  );
}

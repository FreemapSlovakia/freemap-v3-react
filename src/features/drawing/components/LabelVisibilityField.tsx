import { useBreakpointMatches } from '@shared/breakpoints.js';
import {
  type LabelVisibility,
  LabelVisibilitySchema,
} from '@shared/labelVisibility.js';
import type { ReactElement } from 'react';
import { ButtonGroup, Form, ToggleButton } from 'react-bootstrap';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

type Props = {
  value: LabelVisibility;
  onChange: (value: LabelVisibility) => void;
};

export function LabelVisibilityField({ value, onChange }: Props): ReactElement {
  const dm = useDrawingMessages();

  const { sm } = useBreakpointMatches();

  return (
    <Form.Group className="mt-3">
      <Form.Label className="d-block">{dm?.edit.showLabel}</Form.Label>

      <ButtonGroup vertical={!sm}>
        {LabelVisibilitySchema.options.map((option) => (
          <ToggleButton
            key={option}
            id={`labelVisibility-${option}`}
            type="radio"
            name="labelVisibility"
            variant="outline-primary"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          >
            {dm?.edit.labelVisibility[option]}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </Form.Group>
  );
}

import { HintMark } from '@shared/components/HintMark.js';
import type { ReactElement, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

type Props = {
  /** Ties the label to the range; must be unique on the page. */
  id: string;
  /** Names the setting, above the slider. */
  label: ReactNode;
  /** Says where it stands, beside the name. */
  valueLabel: ReactNode;
  /** What the setting means, behind the name, for one whose name can't carry it. */
  hint?: ReactNode;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
};

// The mark stays with the name's last word when the name wraps.
function withHint(label: ReactNode, hint: ReactNode): ReactNode {
  if (!hint) {
    return label;
  }

  if (typeof label !== 'string') {
    return (
      <>
        {label}
        <HintMark hint={hint} />
      </>
    );
  }

  const cut = label.lastIndexOf(' ') + 1;

  return (
    <>
      {label.slice(0, cut)}
      <span className="text-nowrap">
        {label.slice(cut)}
        <HintMark hint={hint} />
      </span>
    </>
  );
}

/**
 * A range with its name, where it stands, and what it means — in a settings
 * form or in a `SliderDropdown`, which is why it is not in that file.
 */
export function LabeledSlider({
  id,
  label,
  valueLabel,
  hint,
  min,
  max,
  step = 1,
  value,
  onChange,
}: Props): ReactElement {
  return (
    <div className="d-flex flex-column">
      {/* Name and value on one line, the value emphasised: it is the part that
          moves, and a stack of sliders reads as rows rather than as a column of
          labels with a column of centred values between them. */}
      <div className="d-flex justify-content-between align-items-baseline gap-2">
        <Form.Label className="mb-0" htmlFor={id}>
          {withHint(label, hint)}
        </Form.Label>

        <span className="fw-semibold text-end">{valueLabel}</span>
      </div>

      <Form.Range
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </div>
  );
}

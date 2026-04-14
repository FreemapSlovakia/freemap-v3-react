import { DrawingRecentColors } from '@features/drawing/components/DrawingRecentColors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';

type Props = {
  color: string;
  onColorChange: (color: string) => void;
  width: string;
  onWidthChange: (width: string) => void;
  widthStep?: number;
  invalidWidth?: boolean;
  lineCap: 'butt' | 'round' | 'square';
  onLineCapChange: (lineCap: 'butt' | 'round' | 'square') => void;
  lineJoin: 'miter' | 'round' | 'bevel';
  onLineJoinChange: (lineJoin: 'miter' | 'round' | 'bevel') => void;
  dashArray: number[];
  onDashArrayChange: (dashArray: number[]) => void;
};

export function DrawingLineStyleFields({
  color,
  onColorChange,
  width,
  onWidthChange,
  widthStep,
  invalidWidth,
  lineCap,
  onLineCapChange,
  lineJoin,
  onLineJoinChange,
  dashArray,
  onDashArrayChange,
}: Props): ReactElement {
  const m = useMessages();

  const [inputs, setInputs] = useState<string[]>(() => [
    ...dashArray.map(String),
    '',
  ]);

  const internalChange = useRef(false);

  useEffect(() => {
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    setInputs([...dashArray.map(String), '']);
  }, [dashArray]);

  function handleInputChange(index: number, value: string) {
    const newInputs = [...inputs];
    newInputs[index] = value;
    if (index === inputs.length - 1 && value !== '') {
      newInputs.push('');
    }
    setInputs(newInputs);
    internalChange.current = true;
    onDashArrayChange(newInputs.filter(Boolean).map(Number));
  }

  function handleInputBlur(index: number) {
    if (inputs[index] === '' && index !== inputs.length - 1) {
      setInputs(inputs.filter((_, i) => i !== index));
    }
  }

  const widthNum = parseFloat(width) || 2;
  const dashArrayValue = dashArray.length ? dashArray.join(' ') : undefined;
  const previewHeight = Math.max(20, widthNum + 12);

  return (
    <>
      <Form.Group controlId="color" className="mt-3">
        <Form.Label>{m?.drawing.edit.color}</Form.Label>

        <Form.Control
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.currentTarget.value)}
        />

        <DrawingRecentColors onColor={onColorChange} />
      </Form.Group>

      <Form.Group controlId="width" className="mt-3">
        <Form.Label>{m?.drawing.edit.width}</Form.Label>

        <Form.Control
          type="number"
          value={width}
          min={1}
          max={12}
          step={widthStep}
          isInvalid={invalidWidth}
          onChange={(e) => onWidthChange(e.currentTarget.value)}
        />
      </Form.Group>

      <Form.Group controlId="lineCap" className="mt-3">
        <Form.Label>{m?.drawing.edit.lineCap}</Form.Label>

        <Form.Select
          value={lineCap}
          onChange={(e) =>
            onLineCapChange(
              e.currentTarget.value as 'butt' | 'round' | 'square',
            )
          }
        >
          <option value="round">{m?.drawing.edit.lineCapRound}</option>
          <option value="butt">{m?.drawing.edit.lineCapButt}</option>
          <option value="square">{m?.drawing.edit.lineCapSquare}</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="lineJoin" className="mt-3">
        <Form.Label>{m?.drawing.edit.lineJoin}</Form.Label>

        <Form.Select
          value={lineJoin}
          onChange={(e) =>
            onLineJoinChange(
              e.currentTarget.value as 'miter' | 'round' | 'bevel',
            )
          }
        >
          <option value="round">{m?.drawing.edit.lineJoinRound}</option>
          <option value="miter">{m?.drawing.edit.lineJoinMiter}</option>
          <option value="bevel">{m?.drawing.edit.lineJoinBevel}</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="dashArray" className="mt-3">
        <Form.Label>{m?.drawing.edit.dashArray}</Form.Label>

        <div className="d-flex flex-wrap gap-1 mb-2">
          {inputs.map((val, i) => (
            <Form.Control
              key={i}
              type="number"
              min={0}
              value={val}
              placeholder="…"
              style={{ width: '4rem' }}
              onChange={(e) => handleInputChange(i, e.currentTarget.value)}
              onBlur={() => handleInputBlur(i)}
            />
          ))}
        </div>

        <svg width="100%" height={previewHeight} style={{ display: 'block' }}>
          <line
            x1="4"
            y1="50%"
            x2="96%"
            y2="50%"
            stroke={color}
            strokeWidth={widthNum}
            strokeLinecap={lineCap}
            strokeLinejoin={lineJoin}
            strokeDasharray={dashArrayValue}
          />
        </svg>
      </Form.Group>
    </>
  );
}

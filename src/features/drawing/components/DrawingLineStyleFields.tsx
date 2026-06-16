import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import type { LineCap, LineJoin } from '../model/actions/drawingLineActions.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';

type Props = {
  color: string;
  onColorChange: (color: string) => void;
  fillColor?: string;
  onFillColorChange?: (fillColor: string) => void;
  width: string;
  onWidthChange: (width: string) => void;
  widthStep?: number;
  invalidWidth?: boolean;
  lineCap: LineCap;
  onLineCapChange: (lineCap: LineCap) => void;
  lineJoin: LineJoin;
  onLineJoinChange: (lineJoin: LineJoin) => void;
  dashArray: number[];
  onDashArrayChange: (dashArray: number[]) => void;
};

export function DrawingLineStyleFields({
  color,
  onColorChange,
  fillColor,
  onFillColorChange,
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
  const dm = useDrawingMessages();

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
  const previewHeight = onFillColorChange
    ? Math.max(40, widthNum * 2 + 24)
    : Math.max(20, widthNum + 12);

  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    const el = svgRef.current;

    if (!el) {
      return;
    }

    const ro = new ResizeObserver(([entry]) => {
      setSvgWidth(entry!.contentRect.width);
    });

    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const inset = widthNum / 2 + 6;

  return (
    <>
      <Form.Group controlId="color" className="mt-3">
        <Form.Label>{dm?.edit.color}</Form.Label>

        <RgbaColorPicker value={color} onChange={onColorChange} />
      </Form.Group>

      {onFillColorChange && (
        <Form.Group controlId="fillColor" className="mt-3">
          <Form.Label>{dm?.edit.fillColor}</Form.Label>

          <RgbaColorPicker
            value={fillColor ?? color}
            onChange={onFillColorChange}
          />
        </Form.Group>
      )}

      <Form.Group controlId="width" className="mt-3">
        <Form.Label>{dm?.edit.width}</Form.Label>

        <Form.Control
          type="number"
          value={width}
          min={1}
          max={99}
          step={widthStep}
          isInvalid={invalidWidth}
          onChange={(e) => onWidthChange(e.currentTarget.value)}
        />
      </Form.Group>

      <Form.Group controlId="lineCap" className="mt-3">
        <Form.Label>{dm?.edit.lineCap}</Form.Label>

        <Form.Select
          value={lineCap}
          onChange={(e) => onLineCapChange(e.currentTarget.value as LineCap)}
        >
          <option value="round">{dm?.edit.lineCapRound}</option>
          <option value="butt">{dm?.edit.lineCapButt}</option>
          <option value="square">{dm?.edit.lineCapSquare}</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="lineJoin" className="mt-3">
        <Form.Label>{dm?.edit.lineJoin}</Form.Label>

        <Form.Select
          value={lineJoin}
          onChange={(e) => onLineJoinChange(e.currentTarget.value as LineJoin)}
        >
          <option value="round">{dm?.edit.lineJoinRound}</option>
          <option value="miter">{dm?.edit.lineJoinMiter}</option>
          <option value="bevel">{dm?.edit.lineJoinBevel}</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="dashArray" className="mt-3">
        <Form.Label>{dm?.edit.dashArray}</Form.Label>

        <div className="d-flex flex-wrap gap-1 mb-2">
          {inputs.map((val, i) => (
            <Form.Control
              key={i}
              type="number"
              min={0}
              value={val}
              style={{ width: '4rem' }}
              onChange={(e) => handleInputChange(i, e.currentTarget.value)}
              onBlur={() => handleInputBlur(i)}
            />
          ))}
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height={previewHeight}
          style={{ display: 'block' }}
        >
          {svgWidth > 0 &&
            (onFillColorChange ? (
              <rect
                x={inset}
                y={inset}
                width={svgWidth - 2 * inset}
                height={previewHeight - 2 * inset}
                fill={fillColor || color}
                stroke={color}
                strokeWidth={widthNum}
                strokeLinecap={lineCap}
                strokeLinejoin={lineJoin}
                strokeDasharray={dashArrayValue}
              />
            ) : (
              <line
                x1={inset}
                y1={previewHeight / 2}
                x2={svgWidth - inset}
                y2={previewHeight / 2}
                stroke={color}
                strokeWidth={widthNum}
                strokeLinecap={lineCap}
                strokeLinejoin={lineJoin}
                strokeDasharray={dashArrayValue}
              />
            ))}
        </svg>
      </Form.Group>
    </>
  );
}

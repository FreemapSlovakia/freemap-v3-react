import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { ReactElement, useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import { DrawingLineStyleFields } from './DrawingLineStyleFields.js';

/**
 * Editing state + UI for a full `DrawingStyle` (color, fill, width, dash, line
 * cap/join, marker shape), shared by every modal that edits a default style.
 * Seeds from `initial` once (modals remount on open). Returns the rendered
 * fields, the assembled style (width falls back to `initial.width` while the
 * input is empty/invalid), an `invalid` flag for the width, a `dirty` flag, and
 * a `reset` that refills the fields from a given style (e.g. the defaults).
 */
export function useDrawingStyleEditor(
  initial: DrawingStyle,
  opts?: { widthStep?: number },
): {
  element: ReactElement;
  style: DrawingStyle;
  invalid: boolean;
  dirty: boolean;
  reset: (to: DrawingStyle) => void;
} {
  const dm = useDrawingMessages();

  const [color, setColor] = useState(initial.color);

  const [fillColor, setFillColor] = useState(initial.fillColor);

  const [width, setWidth] = useState(String(initial.width));

  const [dashArray, setDashArray] = useState(initial.dashArray);

  const [lineCap, setLineCap] = useState(initial.lineCap);

  const [lineJoin, setLineJoin] = useState(initial.lineJoin);

  const [markerType, setMarkerType] = useState(initial.markerType);

  const invalid = !(Number(width) > 0);

  const style: DrawingStyle = {
    color,
    fillColor,
    width: Number(width) || initial.width,
    dashArray,
    lineCap,
    lineJoin,
    markerType,
  };

  const dirty =
    color !== initial.color ||
    fillColor !== initial.fillColor ||
    width !== String(initial.width) ||
    dashArray !== initial.dashArray ||
    lineCap !== initial.lineCap ||
    lineJoin !== initial.lineJoin ||
    markerType !== initial.markerType;

  const reset = useCallback((to: DrawingStyle) => {
    setColor(to.color);
    setFillColor(to.fillColor);
    setWidth(String(to.width));
    setDashArray(to.dashArray);
    setLineCap(to.lineCap);
    setLineJoin(to.lineJoin);
    setMarkerType(to.markerType);
  }, []);

  const element = (
    <>
      <DrawingLineStyleFields
        color={color}
        onColorChange={setColor}
        fillColor={fillColor}
        onFillColorChange={setFillColor}
        width={width}
        onWidthChange={setWidth}
        widthStep={opts?.widthStep}
        invalidWidth={invalid}
        lineCap={lineCap}
        onLineCapChange={setLineCap}
        lineJoin={lineJoin}
        onLineJoinChange={setLineJoin}
        dashArray={dashArray}
        onDashArrayChange={setDashArray}
      />

      <Form.Group controlId="markerType" className="mt-3">
        <Form.Label>{dm?.edit.shape}</Form.Label>

        <MarkerTypeSelect
          asSelect
          value={markerType}
          onChange={setMarkerType}
        />
      </Form.Group>
    </>
  );

  return { element, style, invalid, dirty, reset };
}

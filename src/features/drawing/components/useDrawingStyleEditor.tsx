import {
  type DrawingStyle,
  drawingStyleEquals,
} from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { type ReactElement, useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import { DrawingLineStyleFields } from './DrawingLineStyleFields.js';

// `width` is held as a string so the number input can be empty / mid-edit; every
// other field matches `DrawingStyle`.
type Draft = Omit<DrawingStyle, 'width'> & { width: string };

/**
 * Editing state + UI for a full `DrawingStyle` (color, fill, width, dash, line
 * cap/join, marker shape), shared by every modal that edits a default style.
 * Holds one draft object seeded from `initial` (modals remount on open).
 * Returns the rendered fields, the assembled style (width falls back to
 * `initial.width` while the input is empty/invalid), an `invalid` flag, a
 * `dirty` flag (vs `initial`), and a `reset` that refills the draft from a given
 * style (e.g. the defaults).
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

  const [draft, setDraft] = useState<Draft>(() => ({
    ...initial,
    width: String(initial.width),
  }));

  const set = useCallback(
    (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })),
    [],
  );

  const reset = useCallback(
    (to: DrawingStyle) => setDraft({ ...to, width: String(to.width) }),
    [],
  );

  const invalid = !(Number(draft.width) > 0);

  const style: DrawingStyle = {
    ...draft,
    width: Number(draft.width) || initial.width,
  };

  const dirty = !drawingStyleEquals(style, initial);

  const element = (
    <>
      <DrawingLineStyleFields
        color={draft.color}
        onColorChange={(color) => set({ color })}
        fillColor={draft.fillColor}
        onFillColorChange={(fillColor) => set({ fillColor })}
        width={draft.width}
        onWidthChange={(width) => set({ width })}
        widthStep={opts?.widthStep}
        invalidWidth={invalid}
        lineCap={draft.lineCap}
        onLineCapChange={(lineCap) => set({ lineCap })}
        lineJoin={draft.lineJoin}
        onLineJoinChange={(lineJoin) => set({ lineJoin })}
        dashArray={draft.dashArray}
        onDashArrayChange={(dashArray) => set({ dashArray })}
      />

      <Form.Group controlId="markerType" className="mt-3">
        <Form.Label>{dm?.edit.shape}</Form.Label>

        <MarkerTypeSelect
          asSelect
          value={draft.markerType}
          onChange={(markerType) => set({ markerType })}
        />
      </Form.Group>
    </>
  );

  return { element, style, invalid, dirty, reset };
}

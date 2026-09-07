import { elevationSetSettings } from '@features/elevationChart/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import type { ColorizingMode } from '../index.js';
import { STEEPNESS_SCALES } from '../modes/steepness.js';
import { useColorizerMessages } from '../translations/useColorizerMessages.js';

/**
 * Sets the grade the steepness palette ends at. Offered where the reader is
 * looking at the wrong colors — in the colorize dropdown right under the
 * Steepness row — and only while that is the active mode.
 *
 * The slider steps through {@link STEEPNESS_SCALES} by index rather than
 * carrying the ratio itself: the useful settings run 5 % to 100 %, and a slider
 * over that span linearly would spend half its travel above 50 %, where nothing
 * changes.
 */
export function SteepnessScaleSlider({
  mode,
}: {
  mode: ColorizingMode | null | undefined;
}): ReactElement | null {
  const dispatch = useDispatch();

  const cm = useColorizerMessages();

  const scale = useAppSelector(
    (state) => state.elevationSettings.steepnessScale,
  );

  if (mode !== 'steepness') {
    return null;
  }

  const index = Math.max(
    0,
    (STEEPNESS_SCALES as readonly number[]).indexOf(scale),
  );

  return (
    <div
      className="px-3 pt-1 pb-2"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <Form.Label className="mb-1 small d-flex justify-content-between gap-2">
        {cm?.steepnessScale ?? '…'}
        <span className="text-body-secondary">
          ±{Math.round(scale * 100)}&nbsp;%
        </span>
      </Form.Label>

      <Form.Range
        min={0}
        max={STEEPNESS_SCALES.length - 1}
        step={1}
        value={index}
        onChange={(e) => {
          dispatch(
            elevationSetSettings({
              steepnessScale: STEEPNESS_SCALES[Number(e.currentTarget.value)],
            }),
          );
        }}
      />
    </div>
  );
}

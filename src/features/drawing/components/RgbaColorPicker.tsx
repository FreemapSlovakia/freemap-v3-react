import { rgbaStringToHexa, toRgbaString } from '@shared/colorAlpha.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { CSSProperties, ReactElement, useState } from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

const checkerBg: CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
};

export function RgbaColorPicker({ value, onChange }: Props): ReactElement {
  const recentColors = useAppSelector(
    (state) => state.drawingSettings.drawingRecentColors,
  );

  const [show, setShow] = useState(false);

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      rootClose
      show={show}
      onToggle={setShow}
      overlay={
        <Popover style={{ maxWidth: 'none' }}>
          <Popover.Body className="p-2">
            <ColorPicker
              value={toRgbaString(value)}
              onChange={(c) => onChange(rgbaStringToHexa(c))}
              width={236}
              height={120}
              presets={recentColors}
              hideControls
              hideColorTypeBtns
              hideEyeDrop
              hideAdvancedSliders
              hideColorGuide
              hideInputType
            />
          </Popover.Body>
        </Popover>
      }
    >
      <button
        type="button"
        className="form-control p-0"
        style={{
          cursor: 'pointer',
          height: 'calc(1.5em + 0.75rem + 2px)',
          ...checkerBg,
        }}
        aria-label="Pick color"
      >
        <div className="w-100 h-100 rounded" style={{ background: value }} />
      </button>
    </OverlayTrigger>
  );
}

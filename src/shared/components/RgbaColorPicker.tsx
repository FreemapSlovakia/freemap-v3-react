import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { rgbaStringToHexa, toRgbaString } from '@shared/colorAlpha.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import { type CSSProperties, type ReactElement, useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  style?: CSSProperties;
  /** Allow editing the alpha channel; when `false` the result is `#rrggbb`. */
  alpha?: boolean;
};

const checkerBg: CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
};

export function RgbaColorPicker({
  value,
  onChange,
  className,
  style,
  alpha = true,
}: Props): ReactElement {
  const recentColors = useAppSelector(
    (state) => state.drawingSettings.recentColors,
  );

  const [show, setShow] = useState(false);

  // Holds the last forwarded color so the drag-end handler can commit it as a
  // single history entry (see onDragStart/onDragEnd below).
  const latestColorRef = useRef<string | null>(null);

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      rootClose
      show={show}
      onToggle={setShow}
      // render into <body> so the popover isn't clipped by a scrollable modal
      // body and can flip above the swatch when there's no room below
      container={() => document.body}
      flip
      overlay={
        <Popover style={{ maxWidth: 'none' }}>
          <Popover.Body className="p-2">
            <ColorPicker
              value={toRgbaString(value)}
              onChange={(c) => {
                const hexa = rgbaStringToHexa(c);

                const result = alpha ? hexa : hexa.slice(0, 7);

                latestColorRef.current = result;

                onChange(result);
              }}
              // Suspend history writes for the whole pointer drag so the stream
              // of intermediate colors collapses into one entry instead of
              // flooding pushState (Safari caps it at 100/10s).
              onDragStart={() => {
                setUrlUpdatingEnabled(false);
              }}
              onDragEnd={() => {
                // Re-enable first so the flush commits one history entry.
                setUrlUpdatingEnabled(true);

                if (latestColorRef.current !== null) {
                  onChange(latestColorRef.current);
                }
              }}
              width={236}
              height={120}
              presets={recentColors}
              hideOpacity={!alpha}
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
        className={`form-control p-0${className ? ` ${className}` : ''}`}
        style={{
          cursor: 'pointer',
          height: 'calc(1.5em + 0.75rem + 2px)',
          ...checkerBg,
          ...style,
        }}
        aria-label="Pick color"
      >
        <div
          className="w-100 h-100"
          style={{ background: value, borderRadius: 'inherit' }}
        />
      </button>
    </OverlayTrigger>
  );
}

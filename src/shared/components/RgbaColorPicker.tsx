import { rgbaStringToHexa, toRgbaString } from '@shared/colorAlpha.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDragCommit } from '@shared/hooks/useDragCommit.js';
import ColorPicker from '@zdila/react-gradient-color-picker';
import type { CSSProperties, ReactElement } from 'react';
import { ColorPickerPopover } from './ColorPickerPopover.js';

type Props = {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  style?: CSSProperties;
  /** Allow editing the alpha channel; when `false` the result is `#rrggbb`. */
  alpha?: boolean;
  /** Offered ahead of the recently used colours. */
  presets?: string[];
};

export function RgbaColorPicker({
  value,
  onChange,
  className,
  style,
  alpha = true,
  presets,
}: Props): ReactElement {
  const recentColors = useAppSelector(
    (state) => state.drawingSettings.recentColors,
  );

  const { change, onDragStart, onDragEnd } = useDragCommit(onChange);

  return (
    <ColorPickerPopover
      swatch={value}
      checker
      className={className}
      style={style}
      onHide={onDragEnd}
    >
      <ColorPicker
        value={toRgbaString(value)}
        onChange={(c) => {
          const hexa = rgbaStringToHexa(c);

          change(alpha ? hexa : hexa.slice(0, 7));
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        width={236}
        height={120}
        // The picker shows only the first 18.
        presets={presets ? [...presets, ...recentColors] : recentColors}
        hideOpacity={!alpha}
        hideControls
        hideColorTypeBtns
        hideEyeDrop
        hideAdvancedSliders
        hideColorGuide
        hideInputType
      />
    </ColorPickerPopover>
  );
}

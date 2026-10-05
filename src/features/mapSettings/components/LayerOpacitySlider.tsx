import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import type { CSSProperties, ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { MdOpacity } from 'react-icons/md';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

type Props = {
  /** 0 to 1. */
  value: number;
  onChange: (value: number) => void;
  className?: string;
  style?: CSSProperties;
};

/** An opacity as a slider with its percentage. */
export function LayerOpacitySlider({
  value,
  onChange,
  className,
  style,
}: Props): ReactElement {
  const msm = useMapSettingsMessages();

  const percent = Math.round(value * 100);

  return (
    <div
      className={`d-flex align-items-center gap-2${className ? ` ${className}` : ''}`}
      style={style}
    >
      <GlyphMarker
        hint={msm?.overlayOpacity}
        color={null}
        className="flex-shrink-0"
      >
        <MdOpacity />
      </GlyphMarker>

      <Form.Range
        min={0}
        max={100}
        value={percent}
        onChange={(e) => onChange(Number(e.currentTarget.value) / 100)}
      />

      <span className="flex-shrink-0 text-end" style={{ width: '3em' }}>
        {percent}%
      </span>
    </div>
  );
}

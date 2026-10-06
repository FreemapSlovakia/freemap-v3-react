import { useMessages } from '@features/l10n/l10nInjector.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import type { ReactElement, ReactNode } from 'react';
import { Form } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

type Props<T extends { name: string; iconSpec?: string }> = {
  value: T;
  onChange: (value: T) => void;
  /** What the form doesn't set; a preset's by default. */
  hint?: ReactNode;
  /** The icon until one is picked; a preset's by default. */
  placeholder?: ReactElement;
};

/** A preset's or a named map's name and icon; the rest is set on the map. */
export function PresetForm<T extends { name: string; iconSpec?: string }>({
  value,
  onChange,
  hint,
  placeholder,
}: Props<T>): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  return (
    <div>
      <div className="d-flex gap-2 align-items-end">
        <Form.Group controlId="presetName" className="flex-grow-1 min-w-0">
          <Form.Label className="required">{m?.general.name}</Form.Label>

          <Form.Control
            type="text"
            value={value.name}
            onChange={(e) =>
              onChange({ ...value, name: e.currentTarget.value })
            }
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="d-block" htmlFor="presetIcon">
            {m?.general.icon}
          </Form.Label>

          <IconPicker
            id="presetIcon"
            selected={value.iconSpec}
            onSelect={(iconSpec) => onChange({ ...value, iconSpec })}
            placeholder={placeholder ?? CUSTOM_MAP_ICONS.preset}
          />
        </Form.Group>
      </div>

      <Form.Text className="d-block mt-2">{hint ?? msm?.presetHint}</Form.Text>
    </div>
  );
}

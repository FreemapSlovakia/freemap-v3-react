import { useMessages } from '@features/l10n/l10nInjector.js';
import type { MapPreset } from '@features/map/model/mapPreset.js';
import { CUSTOM_MAP_ICONS } from '@shared/components/CustomMapGlyph.js';
import { IconPicker } from '@shared/components/IconPicker.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

type Props = {
  value: MapPreset;
  onChange: (value: MapPreset) => void;
};

/** A preset's name and icon; its layers are edited on the map. */
export function PresetForm({ value, onChange }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  return (
    <div>
      <div className="d-flex gap-3 align-items-end">
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
            placeholder={CUSTOM_MAP_ICONS.preset}
          />
        </Form.Group>
      </div>

      <Form.Text className="d-block mt-2">{msm?.presetHint}</Form.Text>
    </div>
  );
}

import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, ButtonToolbar, Dropdown } from 'react-bootstrap';
import { FaPlus, FaSwatchbook, FaTrash } from 'react-icons/fa';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import {
  ARTISTIC_PRESETS,
  MAP_PRESETS,
  type ShadingPreset,
} from '../model/shadingPresets.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Props = {
  canRemove: boolean;
  /** An overlay without a background can have one added. */
  canAddBackground: boolean;
  onAdd: (type: string | null) => void;
  onRemove: () => void;
  onPreset: (preset: ShadingPreset) => void;
};

export function ShadingToolbar({
  canRemove,
  canAddBackground,
  onAdd,
  onRemove,
  onPreset,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  const presetItem = (preset: ShadingPreset) => (
    <Dropdown.Item
      as="button"
      key={preset}
      eventKey={preset}
      className="text-nowrap"
    >
      {sm?.presetNames[preset]}
    </Dropdown.Item>
  );

  return (
    <ButtonToolbar className="mt-2">
      <Dropdown onSelect={onAdd}>
        <Dropdown.Toggle id="add-shading-button" variant="success">
          <FaPlus /> {sm?.add}
        </Dropdown.Toggle>

        {/* Fixed, so the panel's own scroller doesn't clip it. */}
        <FmDropdownMenu>
          {canAddBackground && (
            <>
              <Dropdown.Item
                as="button"
                eventKey="background"
                className="text-nowrap"
              >
                {sm?.background}
              </Dropdown.Item>

              <Dropdown.Divider />
            </>
          )}

          <Dropdown.Header>{sm?.componentHeader}</Dropdown.Header>

          {SHADING_COMPONENT_TYPES.map((st) => (
            <Dropdown.Item
              as="button"
              key={st}
              eventKey={st}
              className="text-nowrap"
            >
              {sm?.types[st]}
            </Dropdown.Item>
          ))}

          <Dropdown.Divider />

          <Dropdown.Header>{sm?.templateHeader}</Dropdown.Header>

          <Dropdown.Item as="button" eventKey="contour" className="text-nowrap">
            {sm?.contour}
          </Dropdown.Item>
          <Dropdown.Item as="button" eventKey="fog" className="text-nowrap">
            {sm?.fogInversion}
          </Dropdown.Item>
        </FmDropdownMenu>
      </Dropdown>

      <Button disabled={!canRemove} variant="danger" onClick={onRemove}>
        <FaTrash /> {m?.general.remove}
      </Button>

      <Dropdown
        className="ms-auto"
        onSelect={(key) => key !== null && onPreset(key as ShadingPreset)}
      >
        <LongPressTooltip label={sm?.presets}>
          {({ props }) => (
            <Dropdown.Toggle variant="secondary" {...props}>
              <FaSwatchbook />
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>

        <FmDropdownMenu>
          <Dropdown.Header>{sm?.mapPresetsHeader}</Dropdown.Header>

          {MAP_PRESETS.map(presetItem)}

          <Dropdown.Divider />

          <Dropdown.Header>{sm?.artisticPresetsHeader}</Dropdown.Header>

          {ARTISTIC_PRESETS.map(presetItem)}
        </FmDropdownMenu>
      </Dropdown>
    </ButtonToolbar>
  );
}

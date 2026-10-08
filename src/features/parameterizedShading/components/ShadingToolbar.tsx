import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useState } from 'react';
import { Button, ButtonToolbar, Dropdown, Form } from 'react-bootstrap';
import { BsCircleFill, BsTransparency } from 'react-icons/bs';
import { FaPlus, FaSwatchbook, FaTrash } from 'react-icons/fa';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import {
  ARTISTIC_PRESETS,
  isOpaquePreset,
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
  /** `append` adds the preset's components rather than replacing the shading. */
  onPreset: (preset: ShadingPreset, append: boolean) => void;
  /** A preset keeps an optional background or gets a white one; ignored while appending. */
  withBackground: boolean;
  onWithBackgroundChange: (withBackground: boolean) => void;
};

export function ShadingToolbar({
  canRemove,
  canAddBackground,
  onAdd,
  onRemove,
  onPreset,
  withBackground,
  onWithBackgroundChange,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const [append, setAppend] = useState(false);

  const presetItem = (preset: ShadingPreset) => {
    const alwaysOpaque = isOpaquePreset(preset);

    const opaque = alwaysOpaque || (withBackground && !append);

    return (
      <Dropdown.Item
        as="button"
        key={preset}
        eventKey={preset}
        className="text-nowrap"
        disabled={append && alwaysOpaque}
      >
        {opaque ? (
          <BsCircleFill className="text-secondary" />
        ) : (
          <BsTransparency className="text-secondary" />
        )}{' '}
        {sm?.presetNames[preset]}
      </Dropdown.Item>
    );
  };

  return (
    <ButtonToolbar className="mt-2 gap-2">
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
        </FmDropdownMenu>
      </Dropdown>

      <Button disabled={!canRemove} variant="danger" onClick={onRemove}>
        <FaTrash /> {m?.general.remove}
      </Button>

      <Dropdown
        className="ms-auto"
        onSelect={(key) =>
          key !== null && onPreset(key as ShadingPreset, append)
        }
      >
        <LongPressTooltip label={sm?.presets}>
          {({ props }) => (
            <Dropdown.Toggle variant="secondary" {...props}>
              <FaSwatchbook />
            </Dropdown.Toggle>
          )}
        </LongPressTooltip>

        <FmDropdownMenu>
          <Form.Check
            id="shading-preset-append"
            className="mx-3 my-1 text-nowrap"
            label={sm?.addToExisting}
            checked={append}
            onChange={(e) => setAppend(e.currentTarget.checked)}
          />

          <Form.Check
            id="shading-preset-with-background"
            className="mx-3 my-1 text-nowrap"
            label={sm?.withBackground}
            checked={withBackground && !append}
            disabled={append}
            onChange={(e) => onWithBackgroundChange(e.currentTarget.checked)}
          />

          <Dropdown.Divider />

          <Dropdown.Header>{sm?.mapPresetsHeader}</Dropdown.Header>

          {MAP_PRESETS.map(presetItem)}

          <Dropdown.Divider />

          <Dropdown.Header>{sm?.artisticPresetsHeader}</Dropdown.Header>

          {ARTISTIC_PRESETS.toSorted((a, b) =>
            (sm?.presetNames[a] ?? a).localeCompare(
              sm?.presetNames[b] ?? b,
              language,
            ),
          ).map(presetItem)}
        </FmDropdownMenu>
      </Dropdown>
    </ButtonToolbar>
  );
}

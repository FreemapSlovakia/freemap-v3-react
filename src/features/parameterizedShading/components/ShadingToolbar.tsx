import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import {
  Button,
  ButtonToolbar,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { TbStack2 } from 'react-icons/tb';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Props = {
  canRemove: boolean;
  onAdd: (type: string | null) => void;
  onRemove: () => void;
  /** Absent where the map's combinations can't be managed. */
  onSaveAsCombination?: () => void;
};

export function ShadingToolbar({
  canRemove,
  onAdd,
  onRemove,
  onSaveAsCombination,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  return (
    <ButtonToolbar>
      <DropdownButton
        id="add-shading-button"
        title={sm?.add}
        variant="success"
        onSelect={onAdd}
      >
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
        <Dropdown.Item as="button" eventKey="contour" className="text-nowrap">
          {sm?.contour}
        </Dropdown.Item>
        <Dropdown.Item as="button" eventKey="fog" className="text-nowrap">
          {sm?.fogInversion}
        </Dropdown.Item>
      </DropdownButton>

      <Button disabled={!canRemove} variant="danger" onClick={onRemove}>
        {m?.general.remove}
      </Button>

      {onSaveAsCombination && (
        <LongPressTooltip label={m?.mapLayers.saveAsCombination}>
          {({ props }) => (
            <Button
              variant="secondary"
              className="ms-1"
              onClick={onSaveAsCombination}
              {...props}
            >
              <TbStack2 />
            </Button>
          )}
        </LongPressTooltip>
      )}
    </ButtonToolbar>
  );
}

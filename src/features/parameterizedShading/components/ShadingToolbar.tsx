import { useMessages } from '@features/l10n/l10nInjector.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import type { ReactElement } from 'react';
import { Button, ButtonToolbar, Dropdown } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Props = {
  canRemove: boolean;
  /** An overlay without a background can have one added. */
  canAddBackground: boolean;
  onAdd: (type: string | null) => void;
  onRemove: () => void;
};

export function ShadingToolbar({
  canRemove,
  canAddBackground,
  onAdd,
  onRemove,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  return (
    <ButtonToolbar className="mt-2">
      <Dropdown onSelect={onAdd}>
        <Dropdown.Toggle id="add-shading-button" variant="success">
          <FaPlus /> {sm?.add}
        </Dropdown.Toggle>

        {/* Fixed, so the panel's own scroller doesn't clip it. */}
        <FmDropdownMenu>
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

          {canAddBackground && (
            <>
              <Dropdown.Divider />

              <Dropdown.Item
                as="button"
                eventKey="background"
                className="text-nowrap"
              >
                {sm?.background}
              </Dropdown.Item>
            </>
          )}
        </FmDropdownMenu>
      </Dropdown>

      <Button disabled={!canRemove} variant="danger" onClick={onRemove}>
        <FaTrash /> {m?.general.remove}
      </Button>
    </ButtonToolbar>
  );
}

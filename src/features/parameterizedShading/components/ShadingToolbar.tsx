import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import {
  Button,
  ButtonToolbar,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Props = {
  canRemove: boolean;
  /** An overlay without a background can have one added. */
  canAddBackground: boolean;
  onAdd: (type: string | null) => void;
  onRemove: () => void;
  /** Absent where custom maps can't be managed, or for one that already is. */
  onSaveAsMap?: () => void;
};

export function ShadingToolbar({
  canRemove,
  canAddBackground,
  onAdd,
  onRemove,
  onSaveAsMap,
}: Props): ReactElement {
  const m = useMessages();

  const sm = useShadingMessages();

  return (
    <ButtonToolbar className="mt-2">
      <DropdownButton
        id="add-shading-button"
        title={
          <>
            <FaPlus /> {sm?.add}
          </>
        }
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
      </DropdownButton>

      <Button disabled={!canRemove} variant="danger" onClick={onRemove}>
        <FaTrash /> {m?.general.remove}
      </Button>

      {onSaveAsMap && (
        <LongPressTooltip label={m?.mapLayers.saveAsShadingMap}>
          {({ props }) => (
            <Button variant="secondary" onClick={onSaveAsMap} {...props}>
              <MdDashboardCustomize />
            </Button>
          )}
        </LongPressTooltip>
      )}
    </ButtonToolbar>
  );
}

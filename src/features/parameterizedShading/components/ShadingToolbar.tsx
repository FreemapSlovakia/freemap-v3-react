import { useMessages } from '@features/l10n/l10nInjector.js';
import { ReactElement } from 'react';
import {
  Button,
  ButtonToolbar,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { SHADING_COMPONENT_TYPES } from '../model/Shading.js';
import { useShadingMessages } from '../translations/useShadingMessages.js';

type Props = {
  canRemove: boolean;
  onAdd: (type: string | null) => void;
  onRemove: () => void;
};

export function ShadingToolbar({
  canRemove,
  onAdd,
  onRemove,
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
          <Dropdown.Item key={st} eventKey={st} className="text-nowrap">
            {sm?.types[st]}
          </Dropdown.Item>
        ))}

        <Dropdown.Divider />
        <Dropdown.Item eventKey="contour" className="text-nowrap">
          {sm?.contour}
        </Dropdown.Item>
        <Dropdown.Item eventKey="fog" className="text-nowrap">
          {sm?.fogInversion}
        </Dropdown.Item>
      </DropdownButton>

      <Button
        className="ms-1"
        type="button"
        disabled={!canRemove}
        variant="danger"
        onClick={onRemove}
      >
        {m?.general.remove}
      </Button>
    </ButtonToolbar>
  );
}

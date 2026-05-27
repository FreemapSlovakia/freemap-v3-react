import { useMessages } from '@features/l10n/l10nInjector.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';

type Props = {
  value: MarkerType;
  onChange: (markerType: MarkerType) => void;
};

export function MarkerTypeSelect({ value, onChange }: Props): ReactElement {
  const m = useMessages();

  return (
    <Form.Select
      value={value}
      onChange={(e) => onChange(e.currentTarget.value as MarkerType)}
    >
      <option value="pin">{m?.objects.icon.pin}</option>
      <option value="ring">{m?.objects.icon.ring}</option>
      <option value="square">{m?.objects.icon.square}</option>
    </Form.Select>
  );
}

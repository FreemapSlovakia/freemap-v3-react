import {
  type ChangeEvent,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';
import { Button, ButtonToolbar, Form } from 'react-bootstrap';
import { useMessages } from '../../../l10nInjector.js';
import { CustomLayerDef } from '../../../mapDefinitions.js';
import { CustomMapForm } from './CustomMapForm.js';

type Props = {
  value: CustomLayerDef[];
  onChange: Dispatch<SetStateAction<CustomLayerDef[]>>;
};

export function CustomMapsSettings({ value, onChange }: Props): ReactElement {
  const [type, setType] = useState(value[0]?.type ?? '');

  const handleSetType = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.currentTarget.value);
  }, []);

  const handleChange = useCallback(
    (def?: CustomLayerDef) => {
      onChange((value) => {
        const newDefs = value?.filter((def) => def.type !== type) ?? [];

        if (def) {
          newDefs.push(def);
        }

        return newDefs;
      });
    },
    [type, onChange],
  );

  const m = useMessages();

  const handleAddClick = useCallback(() => {
    const type = Math.random().toString(36).slice(-6);

    onChange((value) => [
      ...value,
      {
        type,
        name: '',
        url: 'https://',
        technology: 'tile',
        layer: 'base',
      },
    ]);

    setType(type);
  }, [onChange]);

  const handleDeleteClick = useCallback(() => {
    onChange((value) => {
      const newValue = value.filter((def) => def.type !== type);

      setType(newValue[0]?.type ?? ''); // TODO set following or previous

      return newValue;
    });
  }, [onChange, type]);

  return (
    <>
      {value.length > 0 && (
        <Form.Select value={type} onChange={handleSetType} className="mb-3">
          {value.map((def) => (
            <option value={def.type} key={def.type}>
              {def.name || `{${def.type}}`}
            </option>
          ))}
        </Form.Select>
      )}

      <ButtonToolbar className="justify-content-end">
        <Button type="button" variant="primary" onClick={handleAddClick}>
          {m?.general.add}
        </Button>

        {value.length > 0 && (
          <Button
            type="button"
            variant="danger"
            className="ms-1"
            onClick={handleDeleteClick}
          >
            {m?.general.delete}
          </Button>
        )}
      </ButtonToolbar>

      {value.length > 0 && (
        <>
          <hr />

          <CustomMapForm
            key={type}
            type={type}
            value={value.find((def) => def.type === type)}
            onChange={handleChange}
          />
        </>
      )}
    </>
  );
}

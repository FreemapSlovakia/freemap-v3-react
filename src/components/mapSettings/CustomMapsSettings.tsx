import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import { Button, ButtonToolbar, Form } from 'react-bootstrap';
import { useMessages } from '../../l10nInjector.js';
import { CustomLayerDef } from '../../mapDefinitions.js';
import { CustomMapForm } from './CustomMapForm.js';

type Props = {
  value: CustomLayerDef[];
  onChange: (prev: CustomLayerDef[]) => void;
};

export function CustomMapsSettings({ value, onChange }: Props): ReactElement {
  const [type, setType] = useState(value[0]?.type ?? '');

  const handleSetType = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setType(e.currentTarget.value);
  }, []);

  const handleChange = useCallback(
    (def?: CustomLayerDef) => {
      const newDefs = value?.filter((def) => def.type !== type) ?? [];

      if (def) {
        newDefs.push(def);
      }

      onChange(newDefs);
    },
    [type, value, onChange],
  );

  const m = useMessages();

  return (
    <>
      {value.length > 0 && (
        <Form.Select value={type} onChange={handleSetType} className="mb-2">
          {value.map((def) => (
            <option value={def.type} key={def.type}>
              {def.name || `{${def.type}}`}
            </option>
          ))}
        </Form.Select>
      )}

      <ButtonToolbar className="justify-content-end">
        <Button
          variant="primary"
          onClick={() => {
            const type = Math.random().toString(36).slice(-6);

            onChange([
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
          }}
        >
          {m?.general.add}
        </Button>

        {value.length > 0 && (
          <Button
            variant="danger"
            className="ms-1"
            onClick={() => {
              onChange(value.filter((def) => def.type !== type));

              setType(value[0]?.type ?? []); // TODO set follwing or previous
            }}
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

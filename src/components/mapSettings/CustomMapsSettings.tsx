import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import {
  ButtonGroup,
  Col,
  Container,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { useMessages } from '../../l10nInjector.js';
import { CustomLayerDef, CustomLayerLetters } from '../../mapDefinitions.js';
import { CustomMapForm } from './CustomMapForm.js';

type Props = {
  value: CustomLayerDef[];
  onChange: (prev: CustomLayerDef[]) => void;
};

export function CustomMapsSettings({ value, onChange }: Props): ReactElement {
  const [type, setType] = useState<CustomLayerLetters>('.1');

  const handleSetType = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setType(e.currentTarget.value as CustomLayerLetters);
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
      <Container fluid className="p-0">
        <Row className="mb-3">
          <Col className="align-self-center">{m?.mapLayers.base}</Col>

          <ButtonGroup as={Col}>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <ToggleButton
                  variant={
                    value.find((def) => def.type === '.' + i)
                      ? 'primary'
                      : 'secondary'
                  }
                  type="radio"
                  name="customLayer"
                  id={'.' + i}
                  value={'.' + i}
                  checked={type === '.' + i}
                  onChange={handleSetType}
                  key={i}
                >
                  {i}
                </ToggleButton>
              ))}
          </ButtonGroup>
        </Row>

        <Row className="mb-3">
          <Col className="align-self-center">{m?.mapLayers.overlay}</Col>

          <ButtonGroup as={Col}>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <ToggleButton
                  variant={
                    value.find((def) => def.type === ':' + i)
                      ? 'primary'
                      : 'secondary'
                  }
                  type="radio"
                  name="customLayer"
                  id={':' + i}
                  value={':' + i}
                  checked={type === ':' + i}
                  onChange={handleSetType}
                  key={i}
                >
                  {i}
                </ToggleButton>
              ))}
          </ButtonGroup>
        </Row>
      </Container>

      <hr />

      <CustomMapForm
        key={type}
        type={type}
        value={value.find((def) => def.type === type)}
        onChange={handleChange}
      />
    </>
  );
}

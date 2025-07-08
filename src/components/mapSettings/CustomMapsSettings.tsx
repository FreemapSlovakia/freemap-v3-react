import { ChangeEvent, ReactElement, useCallback, useState } from 'react';
import {
  ButtonGroup,
  Col,
  Container,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { CustomLayerDef, CustomLayerLetters } from '../../mapDefinitions.js';
import { CustomMapForm } from './CustomMapForm.js';

type Props = {
  value: CustomLayerDef[];
  onChange: (prev: CustomLayerDef[]) => void;
};

export function CustomMapsSettings({ value, onChange }: Props): ReactElement {
  // const bases = [
  //   ...baseLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith('.'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), false] as const,
  //     })),
  // ];

  // const ovls = [
  //   ...overlayLayers,
  //   ...localCustomLayers
  //     .filter((cl) => cl.type.startsWith(':'))
  //     .map((cl) => ({
  //       ...cl,
  //       adminOnly: false,
  //       icon: <MdDashboardCustomize />,
  //       key: ['Digit' + cl.type.slice(1), true] as const,
  //     })),
  // ];

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

  return (
    <>
      <Container fluid className="p-0">
        <Row className="mb-3">
          <Col>Base</Col>

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
          <Col>Overlay</Col>

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

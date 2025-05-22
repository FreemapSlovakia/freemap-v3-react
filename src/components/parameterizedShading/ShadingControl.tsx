import { Chrome, rgbaToHexa } from '@uiw/react-color';
import { produce } from 'immer';
import { useState } from 'react';
import {
  Button,
  ButtonToolbar,
  Card,
  DropdownButton,
  DropdownItem,
  Form,
  ToggleButton,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { mapSetShading } from '../../actions/mapActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import {
  Color,
  SHADING_COMPONENT_TYPES,
  type ShadingComponentType,
} from './Shading.js';
import { ShadingComponentControl } from './ShadingComponentControl.js';

export function ShadingControl() {
  const shading = useAppSelector((state) => state.map.shading);

  const [id, setId] = useState<number>();

  const selectedComponent = shading.components.find(
    (component) => component.id === id,
  );

  const dispatch = useDispatch();

  return (
    <Card
      body
      style={{ width: 'fit-content', pointerEvents: 'auto' }}
      className="m-2"
    >
      <Form>
        <ShadingComponentControl
          components={shading.components}
          onChange={(components) =>
            dispatch(mapSetShading({ ...shading, components }))
          }
          selectedId={id}
          onSelect={setId}
        />

        <ToggleButton
          id="bg-toggle"
          type="checkbox"
          value="1"
          checked={id === undefined}
          className="ms-1 mt-1 d-block"
          onClick={() => {
            setId(undefined);
          }}
          variant="outline-secondary"
        >
          Set Background Color
        </ToggleButton>

        <hr />

        <ButtonToolbar className="mt-3">
          <DropdownButton
            id="add-shading-button"
            title="Add"
            variant="success"
            onSelect={(type) => {
              const id = Math.random();

              dispatch(
                mapSetShading(
                  produce(shading, (draft) => {
                    draft.components.push({
                      id,
                      azimuth: 0,
                      elevation: Math.PI / 2,
                      colors: [[NaN, [128, 128, 128, 255]]],
                      type: type as ShadingComponentType,
                      brightness: 0,
                      contrast: 1,
                    });
                  }),
                ),
              );

              setId(id);
            }}
          >
            {SHADING_COMPONENT_TYPES.map((st) => (
              <DropdownItem key={st} eventKey={st}>
                {st}
              </DropdownItem>
            ))}
          </DropdownButton>

          <Button
            className="ms-1"
            type="button"
            disabled={id === undefined}
            variant="danger"
            onClick={() => {
              dispatch(
                mapSetShading(
                  produce(shading, (draft) => {
                    draft.components = draft.components.filter(
                      (component) => component.id !== id,
                    );
                  }),
                ),
              );

              setId(undefined);
            }}
          >
            Remove
          </Button>
        </ButtonToolbar>

        {selectedComponent && (
          <>
            <Form.Group className="mt-3">
              <Form.Label>Type</Form.Label>

              <Form.Select
                value={selectedComponent.type}
                onChange={(e) => {
                  const type = e.currentTarget.value as ShadingComponentType;

                  dispatch(
                    mapSetShading(
                      produce(shading, (draft) => {
                        draft.components.find(
                          (component) => component.id === selectedComponent.id,
                        )!.type = type;
                      }),
                    ),
                  );
                }}
              >
                {SHADING_COMPONENT_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedComponent.type.startsWith('hillshade-') && (
              <Form.Group className="mt-3">
                <Form.Label>Azimuth</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  max={360}
                  step={5}
                  value={((selectedComponent.azimuth / Math.PI) * 180).toFixed(
                    2,
                  )}
                  onChange={(e) => {
                    const azimuth =
                      (Number(e.currentTarget.value) / 180) * Math.PI;

                    dispatch(
                      mapSetShading(
                        produce(shading, (draft) => {
                          draft.components.find(
                            (component) =>
                              component.id === selectedComponent.id,
                          )!.azimuth = azimuth;
                        }),
                      ),
                    );
                  }}
                />
              </Form.Group>
            )}

            {selectedComponent.type.endsWith('-classic') && (
              <Form.Group className="mt-3">
                <Form.Label>Elevation</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  max={90}
                  value={(
                    (selectedComponent.elevation / Math.PI) *
                    180
                  ).toFixed(2)}
                  onChange={(e) => {
                    const elevation =
                      (Number(e.currentTarget.value) / 180) * Math.PI;

                    dispatch(
                      mapSetShading(
                        produce(shading, (draft) => {
                          draft.components.find(
                            (component) =>
                              component.id === selectedComponent.id,
                          )!.elevation = elevation;
                        }),
                      ),
                    );
                  }}
                />
              </Form.Group>
            )}
          </>
        )}

        <Chrome
          className="mt-3"
          showTriangle={false}
          color={(() => {
            const color =
              selectedComponent?.colors[0][1] ?? shading.backgroundColor;

            return rgbaToHexa({
              r: color[0],
              g: color[1],
              b: color[2],
              a: color[3] / 255,
            });
          })()}
          onChange={(color) => {
            dispatch(
              mapSetShading(
                produce(shading, (draft) => {
                  const colorArr = [
                    color.rgba.r,
                    color.rgba.g,
                    color.rgba.b,
                    color.rgba.a * 255,
                  ] as Color;

                  if (id === undefined) {
                    draft.backgroundColor = colorArr;
                  } else {
                    const component = draft.components.find(
                      (component) => component.id === id,
                    );

                    if (component) {
                      component.colors = [[NaN, colorArr]];
                    }
                  }
                }),
              ),
            );
          }}
        />
      </Form>
    </Card>
  );
}

export default ShadingControl;

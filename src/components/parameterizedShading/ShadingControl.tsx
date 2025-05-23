import ColorPicker from 'react-best-gradient-color-picker';
// import { Chrome, rgbaToHexa } from '@uiw/react-color';
import Color from 'color';
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
  ColorStop,
  SHADING_COMPONENT_TYPES,
  type Color as ColorType,
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

  const [color, setColor] = useState('');

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

        <ButtonToolbar className="mt-3">
          <DropdownButton
            id="add-shading-button"
            title="Add"
            variant="success"
            onSelect={(type0) => {
              const id = Math.random();

              const type = type0 as ShadingComponentType;

              dispatch(
                mapSetShading(
                  produce(shading, (draft) => {
                    draft.components.push({
                      id,
                      azimuth: 0,
                      elevation: Math.PI / 2,
                      colorStops:
                        type === 'color-relief' || type === 'aspect'
                          ? [
                              { value: 0 / 6, color: [255, 0, 0, 1] },
                              { value: 1 / 6, color: [255, 255, 0, 1] },
                              { value: 2 / 6, color: [0, 255, 0, 1] },
                              { value: 3 / 6, color: [0, 255, 255, 1] },
                              { value: 4 / 6, color: [0, 0, 255, 1] },
                              { value: 5 / 6, color: [255, 0, 255, 1] },
                              { value: 6 / 6, color: [255, 0, 0, 1] },
                            ]
                          : [{ value: 0, color: [128, 128, 128, 1] }],
                      type,
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

          <ToggleButton
            id="bg-toggle"
            type="checkbox"
            value="1"
            checked={id === undefined}
            className="ms-1"
            onClick={() => {
              setId(undefined);
            }}
            variant="outline-secondary"
          >
            Bg Color
          </ToggleButton>
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

        {selectedComponent && (
          <ColorPicker
            className="mt-3"
            height={100}
            width={240}
            hideGradientAngle
            hideGradientType
            hideColorTypeBtns
            hideInputs
            hideInputType
            value={(() => {
              let v: string;

              if (
                selectedComponent.type === 'aspect' ||
                selectedComponent.type === 'color-relief'
              ) {
                v =
                  'linear-gradient(90deg, ' +
                  selectedComponent.colorStops
                    .map(
                      (colorStop) =>
                        `rgba(${colorStop.color.join(',')}) ${(colorStop.value * 100).toFixed()}%`,
                    )
                    .join(', ') +
                  ')';
              } else {
                const color =
                  selectedComponent?.colorStops[0].color ??
                  shading.backgroundColor;

                v = Color.rgb(color).string();
              }

              console.log('SET', v === color.toLowerCase() ? color : v);

              return v === color.toLowerCase() ? color : v;
            })()}
            onChange={(color) => {
              setColor(color);

              console.log('GET', color);

              let colorStops: ColorStop[];

              if (color.startsWith('linear-gradient(')) {
                colorStops = [
                  ...color.matchAll(/rgba?\(([^)]+)\) (\d+%)/gi),
                ].map(([, rgba, stop]) => {
                  const color = rgba.split(',').map(Number) as ColorType;

                  if (color.length < 4) {
                    color.push(1);
                  }

                  return {
                    value: parseFloat(stop) / 100,
                    color,
                  };
                });
              } else {
                const c = Color(color).rgb().array() as ColorType;

                if (c.length < 4) {
                  c.push(1);
                }

                colorStops = [{ value: 0, color: c }];
              }

              dispatch(
                mapSetShading(
                  produce(shading, (draft) => {
                    if (id === undefined) {
                      draft.backgroundColor = colorStops[0].color;
                    } else {
                      const component = draft.components.find(
                        (component) => component.id === id,
                      );

                      if (component) {
                        component.colorStops = colorStops;
                      }
                    }
                  }),
                ),
              );
            }}
          />
        )}
      </Form>
    </Card>
  );
}

export default ShadingControl;

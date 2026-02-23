import ColorPicker from 'react-best-gradient-color-picker';
// import { Chrome, rgbaToHexa } from '@uiw/react-color';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  ButtonToolbar,
  Card,
  Dropdown,
  DropdownButton,
  Form,
  ListGroup,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { mapSetShading } from '../map/model/actions.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useScrollClasses } from '../../hooks/useScrollClasses.js';
import {
  ColorStop,
  SHADING_COMPONENT_TYPES,
  ShadingComponent,
  type Color as ColorType,
  type ShadingComponentType,
} from './Shading.js';
import {
  MANAGEABLE_TYPES,
  ShadingComponentControl,
} from './ShadingComponentControl.js';
import Color from 'color';

export function ShadingControl() {
  const shading = useAppSelector((state) => state.map.shading);

  const [id, setId] = useState<number>();

  const selectedComponent = shading.components.find(
    (component) => component.id === id,
  );

  const dispatch = useDispatch();

  const [color, setColor] = useState('');

  const [activeStopIndex, setActiveStopIndex] = useState<number>();

  const sc = useScrollClasses('vertical');

  const [card, setCard] = useState<HTMLDivElement | null>(null);

  const rf = useCallback(() => {
    if (!card) {
      return;
    }

    const { top } = card.getBoundingClientRect();

    window.requestAnimationFrame(() => {
      card.style.maxHeight =
        Math.max(window.innerHeight - top - 57, 100) + 'px';
    });
  }, [card]);

  useEffect(() => {
    window.addEventListener('resize', rf);

    return () => {
      window.removeEventListener('resize', rf);
    };
  }, [rf]);

  useEffect(() => {
    sc(card);

    if (!card) {
      return;
    }

    const ro = new ResizeObserver(() => {
      rf();
    });

    ro.observe(card);

    return () => {
      ro.disconnect();
    };
  }, [card, sc, rf]);

  return (
    <Card body className="fm-shading-control mt-2 ms-2">
      <div className="fm-menu-scroller" ref={setCard}>
        <div />

        <Form
          noValidate
          className="p-2"
          onSubmit={(e) => e.preventDefault()}
          style={{ width: '250px' }}
        >
          <ButtonToolbar>
            <DropdownButton
              id="add-shading-button"
              title="Add"
              variant="success"
              onSelect={(type0) => {
                const id = Math.random();

                let shadingComponent: ShadingComponent;

                if (type0 === 'contour') {
                  const eleWidth = window.prompt(
                    'Enter elevation[,width[,opacity]] (eg: "430.5,1,50")',
                  );

                  if (!eleWidth) {
                    return;
                  }

                  const parts = eleWidth.split(',').map((v) => Number(v));

                  const ele = parts[0];
                  const hwidth = parts[1] / 2 || 1;
                  const opacity = parts[2] / 100 || 1;

                  shadingComponent = {
                    id,
                    type: 'color-relief',
                    colorStops: [
                      { value: ele - hwidth, color: [0, 0, 0, 0] },
                      { value: ele - hwidth, color: [0, 0, 0, opacity] },
                      { value: ele + hwidth, color: [0, 0, 0, opacity] },
                      { value: ele + hwidth, color: [0, 0, 0, 0] },
                    ],
                    brightness: 0,
                    contrast: 1,
                  };
                } else {
                  function interpolate(
                    ratio: number,
                    from = type0 === 'aspect' ? 0 : 90,
                    to = type0 === 'aspect' ? 2 * Math.PI : 2660,
                  ) {
                    return (to - from) * ratio + from;
                  }

                  const type = type0 as ShadingComponentType;

                  const base: Omit<
                    ShadingComponent,
                    'elevation' | 'azimuth' | 'type'
                  > = {
                    id,
                    brightness: 0,
                    contrast: 1,
                    colorStops:
                      type0 === 'color-relief' || type0 === 'aspect'
                        ? [
                            {
                              value: interpolate(0 / 6),
                              color: [255, 0, 0, 1],
                            },
                            {
                              value: interpolate(1 / 6),
                              color: [255, 255, 0, 1],
                            },
                            {
                              value: interpolate(2 / 6),
                              color: [0, 255, 0, 1],
                            },
                            {
                              value: interpolate(3 / 6),
                              color: [0, 255, 255, 1],
                            },
                            {
                              value: interpolate(4 / 6),
                              color: [0, 0, 255, 1],
                            },
                            {
                              value: interpolate(5 / 6),
                              color: [255, 0, 255, 1],
                            },
                            {
                              value: interpolate(6 / 6),
                              color: [255, 0, 0, 1],
                            },
                          ]
                        : [{ value: 0, color: [0xff, 0xff, 0xff, 1] }],
                  };

                  shadingComponent =
                    type === 'hillshade-classic'
                      ? {
                          type,
                          ...base,
                          elevation: 45 * (Math.PI / 180),
                          azimuth: 315 * (Math.PI / 180),
                          exaggeration: 1,
                        }
                      : type === 'slope-classic'
                        ? {
                            type,
                            ...base,
                            elevation: 45 * (Math.PI / 180),
                            exaggeration: 1,
                          }
                        : type === 'hillshade-igor'
                          ? {
                              type,
                              ...base,
                              azimuth: 315 * (Math.PI / 180),
                              exaggeration: 1,
                            }
                          : type === 'slope-igor'
                            ? {
                                type,
                                ...base,
                                exaggeration: 1,
                              }
                            : {
                                type,
                                ...base,
                              };
                }

                dispatch(
                  mapSetShading(
                    produce(shading, (draft) => {
                      draft.components.push(shadingComponent);
                    }),
                  ),
                );

                setId(id);
              }}
            >
              {SHADING_COMPONENT_TYPES.map((st) => (
                <Dropdown.Item key={st} eventKey={st}>
                  {st}
                </Dropdown.Item>
              ))}

              <Dropdown.Divider />
              <Dropdown.Item eventKey="contour">contour</Dropdown.Item>
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

          <ListGroup
            className="my-2"
            activeKey={selectedComponent?.id ?? ''}
            onSelect={(e) => setId(e ? Number(e) : undefined)}
          >
            <ListGroup.Item action eventKey="">
              <span
                className="fm-shading-color"
                style={{
                  backgroundColor: Color(shading.backgroundColor).hex(),
                }}
              />{' '}
              Background
            </ListGroup.Item>

            {shading.components.map((component) => (
              <ListGroup.Item
                action
                key={component.id}
                eventKey={component.id}
                className="fm-ellipsis"
              >
                {/^hillshade-|^slope-/.test(component.type) && (
                  <span
                    className=" fm-shading-color"
                    style={{
                      backgroundColor: Color(
                        component.colorStops[0].color,
                      ).hex(),
                    }}
                  />
                )}{' '}
                {component.type.replace(/hillshade/, 'hs')}
                {(component.type === 'hillshade-classic' ||
                  component.type === 'hillshade-igor') &&
                  ' ◯ ' + (component.azimuth * (180 / Math.PI)).toFixed(1)}
                {(component.type === 'hillshade-classic' ||
                  component.type === 'slope-classic') &&
                  ' ↥ ' + (component.elevation * (180 / Math.PI)).toFixed(1)}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <hr />

          {shading.components.some(
            (shading) => MANAGEABLE_TYPES[shading.type],
          ) && (
            <ShadingComponentControl
              components={shading.components}
              onChange={(components) =>
                dispatch(mapSetShading({ ...shading, components }))
              }
              selectedId={id}
              onSelect={setId}
            />
          )}

          {selectedComponent && (
            <>
              {/* changing type disabled <Form.Group className="mt-3">
                <Form.Label>Type</Form.Label>

                <Form.Select
                  value={selectedComponent.type}
                  onChange={(e) => {
                    const type = e.currentTarget.value as ShadingComponentType;

                    dispatch(
                      mapSetShading(
                        produce(shading, (draft) => {
                          draft.components.find(
                            (component) =>
                              component.id === selectedComponent.id,
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
              </Form.Group> */}

              {'exaggeration' in selectedComponent && (
                <Form.Group controlId="exaggeration" className="mt-3">
                  <Form.Label>Exaggeration</Form.Label>

                  <Form.Control
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={selectedComponent.exaggeration.toFixed(1)}
                    onChange={(e) => {
                      const exaggeration = Number(e.currentTarget.value);

                      dispatch(
                        mapSetShading(
                          produce(shading, (draft) => {
                            (
                              draft.components.find(
                                (component) =>
                                  component.id === selectedComponent.id,
                              ) as { exaggeration: number }
                            ).exaggeration = exaggeration;
                          }),
                        ),
                      );
                    }}
                  />
                </Form.Group>
              )}

              {(selectedComponent.type == 'hillshade-igor' ||
                selectedComponent.type == 'hillshade-classic') && (
                <Form.Group controlId="azimuth" className="mt-3">
                  <Form.Label>Azimuth</Form.Label>

                  <Form.Control
                    type="number"
                    min={0}
                    max={360}
                    step={5}
                    value={(
                      (selectedComponent.azimuth / Math.PI) *
                      180
                    ).toFixed(1)}
                    onChange={(e) => {
                      const azimuth =
                        (Number(e.currentTarget.value) / 180) * Math.PI;

                      dispatch(
                        mapSetShading(
                          produce(shading, (draft) => {
                            (
                              draft.components.find(
                                (component) =>
                                  component.id === selectedComponent.id,
                              ) as { azimuth: number }
                            ).azimuth = azimuth;
                          }),
                        ),
                      );
                    }}
                  />
                </Form.Group>
              )}

              {(selectedComponent.type === 'hillshade-classic' ||
                selectedComponent.type === 'slope-classic') && (
                <Form.Group controlId="elevation" className="mt-3">
                  <Form.Label>Elevation</Form.Label>

                  <Form.Control
                    type="number"
                    min={0}
                    max={90}
                    value={(
                      (selectedComponent.elevation / Math.PI) *
                      180
                    ).toFixed(1)}
                    onChange={(e) => {
                      const elevation =
                        (Number(e.currentTarget.value) / 180) * Math.PI;

                      dispatch(
                        mapSetShading(
                          produce(shading, (draft) => {
                            (
                              draft.components.find(
                                (component) =>
                                  component.id === selectedComponent.id,
                              ) as { elevation: number }
                            ).elevation = elevation;
                          }),
                        ),
                      );
                    }}
                  />
                </Form.Group>
              )}
            </>
          )}

          <ColorPicker
            className="mt-3"
            height={120}
            width={236}
            hideGradientAngle
            hideGradientType
            hideColorTypeBtns
            hideInputs
            hideInputType
            value={(() => {
              let v: string;

              if (!selectedComponent) {
                v = Color.rgb(shading.backgroundColor).string();
              } else if (
                selectedComponent.type === 'aspect' ||
                selectedComponent.type === 'color-relief'
              ) {
                v =
                  'linear-gradient(90deg, ' +
                  selectedComponent.colorStops
                    .map(
                      (colorStop, i) =>
                        (activeStopIndex === i ? 'RGBA' : 'rgba') +
                        `(${colorStop.color.join(',')}) ${(100 * colorStop.value) / (selectedComponent.type === 'aspect' ? 2 * Math.PI : 2660)}%`,
                    )
                    .join(', ') +
                  ')';
              } else {
                const color =
                  selectedComponent?.colorStops[0].color ??
                  shading.backgroundColor;

                v = Color.rgb(color).string();
              }

              return v === color.toLowerCase() ? color : v;
            })()}
            onChange={(color) => {
              setColor(color);

              let colorStops: ColorStop[];

              let activeIndex: number | undefined;

              if (color.startsWith('linear-gradient(')) {
                colorStops = [
                  ...color.matchAll(/(r)gba?\(([^)]+)\) (\d+%)/gi),
                ].map(([, r, rgba, stop], i) => {
                  if (r === 'R') {
                    activeIndex = i;
                  }

                  const color = rgba.split(',').map(Number) as ColorType;

                  if (color.length < 4) {
                    color.push(1);
                  }

                  return {
                    value:
                      (parseFloat(stop) / 100) *
                      (selectedComponent!.type === 'aspect'
                        ? 2 * Math.PI
                        : 2660),
                    color,
                  };
                });

                setActiveStopIndex(activeIndex);
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
        </Form>
      </div>
    </Card>
  );
}

export default ShadingControl;

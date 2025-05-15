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
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { mapSetShadings } from '../../actions/mapActions.js';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { SHADING_TYPES, type ShadingType } from './Shading.js';
import { ShadingControl } from './ShadingControl.js';

export function ShadingsControl() {
  const shadings = useAppSelector((state) => state.map.shadings);

  const [id, setId] = useState<number>();

  const selected = shadings.find((shading) => shading.id === id);

  const dispatch = useDispatch();

  return (
    <Card
      body
      style={{ width: 'fit-content', pointerEvents: 'auto' }}
      className="m-2"
    >
      <Form>
        <ShadingControl
          shadings={shadings}
          onChange={(shadings) => dispatch(mapSetShadings(shadings))}
          selectedId={id}
          onSelect={setId}
        />

        <ButtonToolbar className="mt-3">
          <DropdownButton
            id="add-shading-button"
            title="Add"
            onSelect={(type) => {
              const id = Math.random();

              dispatch(
                mapSetShadings([
                  ...shadings,
                  {
                    id,
                    azimuth: 0,
                    elevation: Math.PI / 2,
                    color: [128, 128, 128, 255],
                    type: type as ShadingType,
                    brightness: 0,
                    contrast: 1,
                    weight: 1,
                  },
                ]),
              );

              setId(id);
            }}
          >
            {SHADING_TYPES.map((st) => (
              <DropdownItem key={st} eventKey={st}>
                {st}
              </DropdownItem>
            ))}
          </DropdownButton>

          <Button
            className="ms-1"
            type="button"
            disabled={id === undefined}
            onClick={() => {
              dispatch(
                mapSetShadings(shadings.filter((shading) => shading.id !== id)),
              );

              setId(undefined);
            }}
          >
            Remove
          </Button>
        </ButtonToolbar>

        {selected && (
          <>
            <Form.Group className="mt-3">
              <Form.Label>Type</Form.Label>

              <Form.Select
                value={selected.type}
                onChange={(e) => {
                  const type = e.currentTarget.value as ShadingType;

                  dispatch(
                    mapSetShadings(
                      produce(shadings, (draft) => {
                        draft.find(
                          (shading) => shading.id === selected.id,
                        )!.type = type;
                      }),
                    ),
                  );
                }}
              >
                {SHADING_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selected.type.startsWith('hillshade-') && (
              <Form.Group className="mt-3">
                <Form.Label>Azimuth</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  max={360}
                  step={5}
                  value={((selected.azimuth / Math.PI) * 180).toFixed(2)}
                  onChange={(e) => {
                    const azimuth =
                      (Number(e.currentTarget.value) / 180) * Math.PI;

                    dispatch(
                      mapSetShadings(
                        produce(shadings, (draft) => {
                          draft.find(
                            (shading) => shading.id === selected.id,
                          )!.azimuth = azimuth;
                        }),
                      ),
                    );
                  }}
                />
              </Form.Group>
            )}

            {selected.type.endsWith('-classic') && (
              <Form.Group className="mt-3">
                <Form.Label>Elevation</Form.Label>

                <Form.Control
                  type="number"
                  min={0}
                  max={90}
                  value={((selected.elevation / Math.PI) * 180).toFixed(2)}
                  onChange={(e) => {
                    const elevation =
                      (Number(e.currentTarget.value) / 180) * Math.PI;

                    dispatch(
                      mapSetShadings(
                        produce(shadings, (draft) => {
                          draft.find(
                            (shading) => shading.id === selected.id,
                          )!.elevation = elevation;
                        }),
                      ),
                    );
                  }}
                />
              </Form.Group>
            )}

            <Chrome
              className="mt-3"
              showTriangle={false}
              color={rgbaToHexa({
                r: selected.color[0],
                g: selected.color[1],
                b: selected.color[2],
                a: selected.color[3] / 255,
              })}
              onChange={(color) => {
                dispatch(
                  mapSetShadings(
                    produce(shadings, (draft) => {
                      const shading = draft.find((s) => s.id === id);

                      if (shading) {
                        shading.color = [
                          color.rgba.r,
                          color.rgba.g,
                          color.rgba.b,
                          color.rgba.a * 255,
                        ];
                      }
                    }),
                  ),
                );
              }}
            />
          </>
        )}
      </Form>
    </Card>
  );
}

import { Chrome, rgbaToHexa } from '@uiw/react-color';
import { produce } from 'immer';
import { useState } from 'react';
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        top: '50px',
        left: '10px',
        background: 'white',
        zIndex: 5000,
      }}
    >
      <ShadingControl
        shadings={shadings}
        onChange={(shadings) => dispatch(mapSetShadings(shadings))}
        selectedId={id}
        onSelect={setId}
      />

      <select
        value=""
        onChange={(e) => {
          const id = Math.random();

          const type = e.currentTarget.value as ShadingType;

          dispatch(
            mapSetShadings([
              ...shadings,
              {
                id,
                azimuth: 0,
                elevation: Math.PI / 2,
                color: [128, 128, 128, 255],
                type,
                brightness: 0,
                contrast: 1,
                weight: 1,
              },
            ]),
          );

          setId(id);
        }}
      >
        <option value="">Add...</option>

        {SHADING_TYPES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </select>

      <button
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
      </button>

      <hr />

      {selected && (
        <>
          <select
            value={selected.type}
            onChange={(e) => {
              const type = e.currentTarget.value as ShadingType;

              dispatch(
                mapSetShadings(
                  produce(shadings, (draft) => {
                    draft.find((shading) => shading.id === selected.id)!.type =
                      type;
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
          </select>

          {selected.type.startsWith('hillshade-') && (
            <input
              type="number"
              min={0}
              max={360}
              value={((selected.azimuth / Math.PI) * 180).toFixed(2)}
              onChange={(e) => {
                const azimuth = (Number(e.currentTarget.value) / 180) * Math.PI;

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
          )}

          {selected.type.endsWith('-classic') && (
            <input
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
          )}

          <Chrome
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
    </div>
  );
}

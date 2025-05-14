import { useState } from "react";
import {
  SHADING_TYPES,
  ShadingControl,
  type Shading,
  type ShadingType,
} from "./ShadingControl";
import { Chrome } from "@uiw/react-color";
import { produce } from "immer";

const HALF_PI = Math.PI / 2;

function App() {
  const [shadings, setShadings] = useState<Shading[]>([
    {
      id: 1,
      type: "hillshade-igor",
      azimuth: 0,
      elevation: HALF_PI,
      color: "#ff0000ff",
    },
    {
      id: 2,
      type: "hillshade-igor",
      azimuth: 0,
      elevation: HALF_PI,
      color: "#00ff00ff",
    },
    {
      id: 3,
      type: "hillshade-igor",
      azimuth: 0,
      elevation: HALF_PI,
      color: "#0000ffff",
    },
  ]);

  const [id, setId] = useState<number>();

  const selected = shadings.find((shading) => shading.id === id);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <ShadingControl
        shadings={shadings}
        onChange={setShadings}
        selectedId={id}
        onSelect={setId}
      />

      <select
        value=""
        onChange={(e) => {
          const id = Math.random();

          const type = e.currentTarget.value as ShadingType;

          setShadings((shadings) => [
            ...shadings,
            {
              id,
              azimuth: 0,
              elevation: HALF_PI,
              color: "#888888ff",
              type,
            },
          ]);

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
          setShadings((shadings) =>
            shadings.filter((shading) => shading.id !== id)
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

              setShadings((shadings) =>
                produce(shadings, (draft) => {
                  draft.find((shading) => shading.id === selected.id)!.type =
                    type;
                })
              );
            }}
          >
            {SHADING_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            max={360}
            value={((selected.azimuth / Math.PI) * 180).toFixed(2)}
            onChange={(e) => {
              const azimuth = (Number(e.currentTarget.value) / 180) * Math.PI;

              setShadings((shadings) =>
                produce(shadings, (draft) => {
                  draft.find((shading) => shading.id === selected.id)!.azimuth =
                    azimuth;
                })
              );
            }}
          />

          <input
            type="number"
            min={0}
            max={90}
            value={((selected.elevation / Math.PI) * 180).toFixed(2)}
            onChange={(e) => {
              const elevation = (Number(e.currentTarget.value) / 180) * Math.PI;

              setShadings((shadings) =>
                produce(shadings, (draft) => {
                  draft.find(
                    (shading) => shading.id === selected.id
                  )!.elevation = elevation;
                })
              );
            }}
          />

          <Chrome
            showTriangle={false}
            color={selected.color}
            onChange={(color) => {
              setShadings(
                produce(shadings, (draft) => {
                  const shading = draft.find((s) => s.id === id);

                  if (shading) {
                    shading.color = color.hexa;
                  }
                })
              );
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;

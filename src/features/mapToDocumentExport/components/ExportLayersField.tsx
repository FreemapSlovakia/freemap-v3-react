import type { ReactElement } from 'react';
import { Form, ToggleButton } from 'react-bootstrap';
import {
  FaBicycle,
  FaBuilding,
  FaHiking,
  FaHorse,
  FaMapSigns,
  FaMountain,
  FaRoad,
  FaSkiing,
  FaTree,
} from 'react-icons/fa';
import { GiHills, GiTreasureMap } from 'react-icons/gi';
import { RxTarget } from 'react-icons/rx';
import {
  EXTRA_LAYERS,
  type ExtraLayer,
  OMITTABLE_LAYERS,
  type OmittableLayer,
} from '../model/types.js';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';

const LAYER_ICONS: Record<ExtraLayer | OmittableLayer, ReactElement> = {
  contours: <RxTarget />,
  shading: <GiHills />,
  hikingTrails: <FaHiking />,
  bicycleTrails: <FaBicycle />,
  skiTrails: <FaSkiing />,
  horseTrails: <FaHorse />,
  sacScale: <FaMountain />,
  smoothness: <FaRoad />,
  waymarking: <FaMapSigns />,
  groundCover: <FaTree />,
  buildings: <FaBuilding />,
};

type Props = {
  baseMap: boolean;
  onBaseMapChange: (baseMap: boolean) => void;
  layers: ExtraLayer[];
  onToggleLayer: (layer: ExtraLayer) => void;
  omit: OmittableLayer[];
  onToggleOmit: (layer: OmittableLayer) => void;
};

export function ExportLayersField({
  baseMap,
  onBaseMapChange,
  layers,
  onToggleLayer,
  omit,
  onToggleOmit,
}: Props): ReactElement {
  const m = useMapToDocumentExportMessages();

  return (
    <fieldset className="mt-3 border rounded p-3">
      <legend>{m?.mapTitle}</legend>

      <ToggleButton
        id="exportBaseMap"
        type="checkbox"
        value="baseMap"
        variant="outline-primary"
        className="rounded"
        checked={baseMap}
        onChange={(e) => onBaseMapChange(e.currentTarget.checked)}
      >
        <GiTreasureMap /> {m?.baseMap}
      </ToggleButton>

      {baseMap && (
        <>
          <Form.Label className="d-block mt-3">{m?.omitTitle}</Form.Label>

          <div className="d-flex flex-wrap gap-2">
            {OMITTABLE_LAYERS.map((layer) => (
              <ToggleButton
                key={layer}
                id={`export-omit-${layer}`}
                type="checkbox"
                value={layer}
                variant="outline-primary"
                className="rounded flex-grow-0"
                checked={omit.includes(layer)}
                onChange={() => onToggleOmit(layer)}
              >
                {LAYER_ICONS[layer]} {m?.omit[layer]}
              </ToggleButton>
            ))}
          </div>

          {omit.length > 0 && (
            <Form.Text className="d-block">{m?.omitHint}</Form.Text>
          )}
        </>
      )}

      <Form.Label className="d-block mt-3">{m?.layersTitle}</Form.Label>

      <div className="d-flex flex-wrap gap-2">
        {EXTRA_LAYERS.map((layer) => (
          <ToggleButton
            key={layer}
            id={`export-layer-${layer}`}
            type="checkbox"
            value={layer}
            variant="outline-primary"
            className="rounded flex-grow-0"
            checked={layers.includes(layer)}
            onChange={() => onToggleLayer(layer)}
          >
            {LAYER_ICONS[layer]} {m?.layers[layer]}
          </ToggleButton>
        ))}
      </div>

      {!baseMap && (
        <Form.Text className="d-block">{m?.noBaseMapHint}</Form.Text>
      )}
    </fieldset>
  );
}

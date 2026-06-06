import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Form, ToggleButton } from 'react-bootstrap';
import { FaBicycle, FaHiking, FaHorse, FaSkiing } from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { RxTarget } from 'react-icons/rx';
import { EXPORTABLE_LAYERS, type ExportableLayer } from '../model/types.js';

const LAYER_ICONS: Record<ExportableLayer, ReactElement> = {
  contours: <RxTarget />,
  shading: <GiHills />,
  hikingTrails: <FaHiking />,
  bicycleTrails: <FaBicycle />,
  skiTrails: <FaSkiing />,
  horseTrails: <FaHorse />,
};

type Props = {
  value: ExportableLayer[];
  onToggle: (layer: ExportableLayer) => void;
};

export function ExportLayersField({ value, onToggle }: Props): ReactElement {
  const m = useMessages();

  return (
    <Form.Group className="mt-3">
      <Form.Label className="d-block">
        {m?.mapToDocumentExport.layersTitle}
      </Form.Label>

      <div className="d-flex flex-wrap gap-2">
        {EXPORTABLE_LAYERS.map((layer) => (
          <ToggleButton
            key={layer}
            id={`export-layer-${layer}`}
            type="checkbox"
            value={layer}
            variant="outline-primary"
            className="rounded flex-grow-0"
            checked={value.includes(layer)}
            onChange={() => onToggle(layer)}
          >
            {LAYER_ICONS[layer]} {m?.mapToDocumentExport.layers[layer]}
          </ToggleButton>
        ))}
      </div>
    </Form.Group>
  );
}

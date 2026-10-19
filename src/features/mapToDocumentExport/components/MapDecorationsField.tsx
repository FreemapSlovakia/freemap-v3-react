import type { ReactElement } from 'react';
import { Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import {
  FaCompass,
  FaCopyright,
  FaList,
  FaRulerHorizontal,
} from 'react-icons/fa';
import { useMapToDocumentExportMessages } from '../translations/useMapToDocumentExportMessages.js';

export type Decoration = 'scaleBar' | 'northArrow' | 'attribution' | 'legend';

type Props = {
  scaleBar: boolean;
  northArrow: boolean;
  attribution: boolean;
  legend: boolean;
  onChange: (values: Decoration[]) => void;
};

export function MapDecorationsField({
  scaleBar,
  northArrow,
  attribution,
  legend,
  onChange,
}: Props): ReactElement {
  const m = useMapToDocumentExportMessages();

  return (
    <Form.Group className="mt-3">
      <Form.Label className="d-block">{m?.decorations}</Form.Label>

      <ToggleButtonGroup
        type="checkbox"
        value={[
          ...(scaleBar ? (['scaleBar'] as const) : []),
          ...(northArrow ? (['northArrow'] as const) : []),
          ...(attribution ? (['attribution'] as const) : []),
          ...(legend ? (['legend'] as const) : []),
        ]}
        onChange={onChange}
        className="d-flex flex-wrap gap-2"
      >
        <ToggleButton
          id="exportScaleBar"
          value="scaleBar"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaRulerHorizontal /> {m?.scaleBar}
        </ToggleButton>

        <ToggleButton
          id="exportNorthArrow"
          value="northArrow"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCompass /> {m?.northArrow}
        </ToggleButton>

        <ToggleButton
          id="exportAttribution"
          value="attribution"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCopyright /> {m?.attribution}
        </ToggleButton>

        <ToggleButton
          id="exportLegend"
          value="legend"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaList /> {m?.legend}
        </ToggleButton>
      </ToggleButtonGroup>

      {legend && <Form.Text>{m?.legendWidens}</Form.Text>}
    </Form.Group>
  );
}

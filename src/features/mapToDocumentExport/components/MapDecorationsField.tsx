import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FaCompass, FaCopyright, FaRulerHorizontal } from 'react-icons/fa';

export type Decoration = 'scaleBar' | 'northArrow' | 'attribution';

type Props = {
  scaleBar: boolean;
  northArrow: boolean;
  attribution: boolean;
  onChange: (values: Decoration[]) => void;
};

export function MapDecorationsField({
  scaleBar,
  northArrow,
  attribution,
  onChange,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <Form.Group className="mt-3">
      <Form.Label className="d-block">
        {m?.mapToDocumentExport.decorations}
      </Form.Label>

      <ToggleButtonGroup
        type="checkbox"
        value={[
          ...(scaleBar ? (['scaleBar'] as const) : []),
          ...(northArrow ? (['northArrow'] as const) : []),
          ...(attribution ? (['attribution'] as const) : []),
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
          <FaRulerHorizontal /> {m?.mapToDocumentExport.scaleBar}
        </ToggleButton>

        <ToggleButton
          id="exportNorthArrow"
          value="northArrow"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCompass /> {m?.mapToDocumentExport.northArrow}
        </ToggleButton>

        <ToggleButton
          id="exportAttribution"
          value="attribution"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCopyright /> {m?.mapToDocumentExport.attribution}
        </ToggleButton>
      </ToggleButtonGroup>
    </Form.Group>
  );
}

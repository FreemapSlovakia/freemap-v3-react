import { Text } from '@features/l10n/Text.js';
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
      <Form.Label className="d-block">
        <Text m={m} k="decorations" />
      </Form.Label>

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
          <FaRulerHorizontal /> <Text m={m} k="scaleBar" />
        </ToggleButton>

        <ToggleButton
          id="exportNorthArrow"
          value="northArrow"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCompass /> <Text m={m} k="northArrow" />
        </ToggleButton>

        <ToggleButton
          id="exportAttribution"
          value="attribution"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaCopyright /> <Text m={m} k="attribution" />
        </ToggleButton>

        <ToggleButton
          id="exportLegend"
          value="legend"
          variant="outline-primary"
          className="rounded flex-grow-0"
        >
          <FaList /> <Text m={m} k="legend" />
        </ToggleButton>
      </ToggleButtonGroup>

      {legend && (
        <Form.Text>
          <Text m={m} k="legendWidens" />
        </Form.Text>
      )}
    </Form.Group>
  );
}

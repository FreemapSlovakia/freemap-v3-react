import { Text } from '@features/l10n/Text.js';
import type { ReactElement } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { FaDrawPolygon, FaEye } from 'react-icons/fa';
import { useMapAreaMessages } from '../translations/useMapAreaMessages.js';
import type { MapAreaMode } from '../useMapAreaSelection.js';

type Props = {
  area: MapAreaMode;
  onSelectVisible: () => void;
  onSelectArea: () => void;
  className?: string;
};

/** "Visible area" / "Selected area" toggle shared by the export/cache modals. */
export function MapAreaToggle({
  area,
  onSelectVisible,
  onSelectArea,
  className,
}: Props): ReactElement {
  const m = useMapAreaMessages();

  return (
    <ToggleButtonGroup
      type="radio"
      name="mapArea"
      value={area}
      className={className}
    >
      <ToggleButton
        id="mapArea-visible"
        className="fm-ellipsis"
        variant="outline-primary"
        value="visible"
        onClick={onSelectVisible}
      >
        <FaEye /> <Text m={m} k="visible" />
      </ToggleButton>

      <ToggleButton
        id="mapArea-area"
        className="fm-ellipsis"
        variant="outline-primary"
        value="area"
        onClick={onSelectArea}
      >
        <FaDrawPolygon /> <Text m={m} k="byArea" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
